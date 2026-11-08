-- Rotllo · v1 · Ajustes de seguridad y rendimiento (avisos del panel de Supabase)
--
-- 1. El perfil se separa en dos tablas: `perfiles` (lo público: nombre, usuario, foto)
--    y `perfiles_privados` (fecha de nacimiento, idioma, estado; solo lo ve su dueño).
--    Así desaparece la vista perfiles_publicos, que se saltaba las reglas de seguridad.
-- 2. Las funciones de ayuda de las reglas pasan al esquema `privado`, que la API de
--    Supabase no publica: ya no se pueden llamar desde fuera. En `public` solo quedan
--    las dos que usa la app: crear_local (con cuenta) y registrar_clic (todos).
-- 3. Índices para las claves que cruzan tablas, y reglas sin solapes.

-- ─────────────────────────────────────────────────────────────────────────────
-- 0. Esquema privado
-- ─────────────────────────────────────────────────────────────────────────────

create schema if not exists privado;
-- Hace falta para que las reglas RLS puedan usar las funciones. No las expone en la API:
-- la API solo publica los esquemas que tiene configurados (public).
grant usage on schema privado to anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Perfil público / perfil privado
-- ─────────────────────────────────────────────────────────────────────────────

create table public.perfiles_privados (
  id uuid primary key references public.perfiles (id) on delete cascade,
  fecha_nacimiento date, -- tiene que dar 18 años o más (trigger)
  idioma public.idioma not null default 'es',
  estado public.estado_perfil not null default 'incompleto',
  actualizado_en timestamptz not null default now()
);

-- Pasar los datos que ya existen (se copian tal cual; los triggers aún no están puestos).
insert into public.perfiles_privados (id, fecha_nacimiento, idioma, estado)
select id, fecha_nacimiento, idioma, estado from public.perfiles;

drop view public.perfiles_publicos;
drop trigger perfiles_antes_de_guardar on public.perfiles;
drop function public.perfiles_antes_de_guardar();
alter table public.perfiles drop column fecha_nacimiento, drop column idioma, drop column estado;

alter table public.perfiles_privados enable row level security;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Funciones de ayuda → esquema privado
--    "set schema" conserva la función (las reglas y triggers siguen apuntando a ella);
--    luego se reescribe su cuerpo para que use los nombres nuevos.
-- ─────────────────────────────────────────────────────────────────────────────

alter function public.es_admin() set schema privado;
alter function public.es_miembro_local(uuid, public.rol_local[]) set schema privado;
alter function public.usuario_activo() set schema privado;
alter function public.local_verificado(uuid) set schema privado;
alter function public.puede_editar_plan(uuid) set schema privado;
alter function public.es_privilegiado() set schema privado;
alter function public.primera_carpeta_uuid(text) set schema privado;
alter function public.puede_subir_foto(text, text) set schema privado;
alter function public.crear_perfil_nuevo_usuario() set schema privado;
alter function public.locales_antes_de_actualizar() set schema privado;
alter function public.miembros_conservar_propietario() set schema privado;
alter function public.planes_antes_de_guardar() set schema privado;

create or replace function privado.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins_rotllo where user_id = (select auth.uid()))
$$;

create or replace function privado.es_miembro_local(
  p_local uuid,
  p_roles public.rol_local[] default array['propietario', 'editor', 'portero']::public.rol_local[]
) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.miembros_local
    where local_id = p_local and user_id = (select auth.uid()) and rol = any (p_roles)
  )
$$;

create or replace function privado.usuario_activo() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.perfiles_privados where id = (select auth.uid()) and estado = 'activo'
  )
$$;

create or replace function privado.local_verificado(p_local uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.locales where id = p_local and estado_verificacion = 'verificado')
$$;

create or replace function privado.puede_editar_plan(p_plan uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.planes p
    where p.id = p_plan
      and (
        privado.es_admin()
        or (privado.es_miembro_local(p.local_id, array['propietario', 'editor']::public.rol_local[])
            and privado.usuario_activo())
      )
  )
$$;

create or replace function privado.es_privilegiado() returns boolean
language sql stable set search_path = '' as $$
  select current_user not in ('anon', 'authenticated') or privado.es_admin()
$$;

create or replace function privado.primera_carpeta_uuid(p_nombre text) returns uuid
language sql stable set search_path = '' as $$
  select case
    when (storage.foldername(p_nombre))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then ((storage.foldername(p_nombre))[1])::uuid
  end
$$;

create or replace function privado.puede_subir_foto(p_bucket text, p_nombre text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case p_bucket
    when 'planes' then privado.puede_editar_plan(privado.primera_carpeta_uuid(p_nombre))
    when 'locales' then
      privado.es_admin()
      or privado.es_miembro_local(
        privado.primera_carpeta_uuid(p_nombre), array['propietario', 'editor']::public.rol_local[]
      )
    when 'avatares' then privado.primera_carpeta_uuid(p_nombre) = (select auth.uid())
    else false
  end
$$;

-- Al registrarse: perfil público + perfil privado (con la fecha, si viene en el registro).
create or replace function privado.crear_perfil_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, nombre_visible)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'nombre', new.raw_user_meta_data ->> 'name', ''), 50), '')
  );
  insert into public.perfiles_privados (id, fecha_nacimiento)
  values (new.id, (new.raw_user_meta_data ->> 'fecha_nacimiento')::date);
  return new;
end
$$;

create or replace function privado.locales_antes_de_actualizar() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not privado.es_privilegiado() and (
       new.estado_verificacion is distinct from old.estado_verificacion
    or new.motivo_rechazo is distinct from old.motivo_rechazo
    or new.verificado_en is distinct from old.verificado_en
    or new.verificado_por is distinct from old.verificado_por
    or new.stripe_account_id is distinct from old.stripe_account_id
    or new.stripe_listo is distinct from old.stripe_listo
    or new.creado_por is distinct from old.creado_por
  ) then
    raise exception 'Solo Rotllo puede cambiar la verificación o los pagos de un local'
      using errcode = 'insufficient_privilege';
  end if;

  if new.estado_verificacion = 'verificado' and old.estado_verificacion <> 'verificado' then
    new.verificado_en := now();
    new.verificado_por := (select auth.uid());
  end if;

  new.actualizado_en := now();
  return new;
end
$$;

create or replace function privado.miembros_conservar_propietario() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.rol = 'propietario'
     and (tg_op = 'DELETE' or new.rol <> 'propietario')
     and exists (select 1 from public.locales where id = old.local_id)
     and not exists (
       select 1 from public.miembros_local
       where local_id = old.local_id and rol = 'propietario' and user_id <> old.user_id
     ) then
    raise exception 'Un local necesita al menos un propietario' using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end
$$;

create or replace function privado.planes_antes_de_guardar() returns trigger
language plpgsql set search_path = '' as $$
declare
  l public.locales;
begin
  select * into l from public.locales where id = new.local_id;
  if l.id is null then
    raise exception 'Local no encontrado' using errcode = 'foreign_key_violation';
  end if;

  if tg_op = 'INSERT' then
    new.ubicacion := coalesce(new.ubicacion, l.ubicacion);
    new.direccion := coalesce(new.direccion, l.direccion);
    new.edad_minima := coalesce(new.edad_minima, l.edad_minima_defecto);
    new.creado_por := coalesce(new.creado_por, (select auth.uid()));
  end if;

  if tg_op = 'UPDATE' then
    if old.estado = 'cancelado' and new.estado <> 'cancelado' then
      raise exception 'Un plan cancelado no se puede volver a publicar: crea uno nuevo'
        using errcode = 'check_violation';
    end if;
    if old.estado in ('cancelado', 'finalizado') and not privado.es_privilegiado() then
      raise exception 'Este plan ya no se puede editar' using errcode = 'check_violation';
    end if;
  end if;

  if new.modo_entradas = 'rotllo' and not l.stripe_listo then
    raise exception 'Para vender con Rotllo, el local tiene que conectar Stripe'
      using errcode = 'check_violation';
  end if;

  if new.estado = 'publicado' and (tg_op = 'INSERT' or old.estado <> 'publicado') then
    if l.estado_verificacion <> 'verificado' then
      raise exception 'El local tiene que estar verificado para publicar'
        using errcode = 'check_violation';
    end if;
    new.publicado_en := now();
  end if;

  if new.estado = 'cancelado' and (tg_op = 'INSERT' or old.estado <> 'cancelado') then
    new.cancelado_en := now();
  end if;

  new.actualizado_en := now();
  return new;
end
$$;

-- Reglas del perfil privado: mayor de 18, la fecha se pone una sola vez y el estado no
-- lo cambia el usuario (pasa solo a "activo" cuando hay una fecha válida).
create function privado.perfiles_privados_antes_de_guardar() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.fecha_nacimiento is not null
     and new.fecha_nacimiento > (current_date - interval '18 years')::date then
    raise exception 'Rotllo es para mayores de 18 años' using errcode = 'check_violation';
  end if;

  if tg_op = 'UPDATE' and not privado.es_privilegiado() then
    if old.fecha_nacimiento is not null and new.fecha_nacimiento is distinct from old.fecha_nacimiento then
      raise exception 'La fecha de nacimiento solo se cambia a través de soporte'
        using errcode = 'insufficient_privilege';
    end if;
    if new.estado is distinct from old.estado then
      raise exception 'El estado del perfil no se puede cambiar' using errcode = 'insufficient_privilege';
    end if;
  end if;

  if new.estado = 'incompleto' and new.fecha_nacimiento is not null then
    new.estado := 'activo';
  end if;

  new.actualizado_en := now();
  return new;
end
$$;

create trigger perfiles_privados_antes_de_guardar
before insert or update on public.perfiles_privados
for each row execute function privado.perfiles_privados_antes_de_guardar();

create function privado.marcar_actualizado() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado_en := now();
  return new;
end
$$;

create trigger perfiles_marcar_actualizado
before update on public.perfiles
for each row execute function privado.marcar_actualizado();

-- crear_local y registrar_clic se quedan en public (las usa la app). Su cuerpo usaba los
-- nombres antiguos de las funciones de ayuda, así que se reescriben.
create or replace function public.crear_local(
  p_nombre text,
  p_slug text,
  p_tipo public.tipo_local,
  p_direccion text,
  p_lat double precision,
  p_lng double precision,
  p_barrio text default null,
  p_instagram text default null,
  p_razon_social text default null,
  p_nif text default null,
  p_email_contacto text default null,
  p_edad_minima_defecto integer default 18
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_local uuid;
begin
  if not privado.usuario_activo() then
    raise exception 'Necesitas una cuenta activa para dar de alta un local'
      using errcode = 'insufficient_privilege';
  end if;

  insert into public.locales (
    nombre, slug, tipo, direccion, barrio, ubicacion, instagram, edad_minima_defecto, creado_por
  ) values (
    p_nombre, p_slug, p_tipo, p_direccion, p_barrio,
    extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
    p_instagram, p_edad_minima_defecto, auth.uid()
  ) returning id into v_local;

  insert into public.locales_privado (local_id, razon_social, nif, email_contacto)
  values (v_local, p_razon_social, p_nif, p_email_contacto);

  insert into public.miembros_local (local_id, user_id, rol)
  values (v_local, auth.uid(), 'propietario');

  return v_local;
end
$$;

create or replace function public.registrar_clic(p_plan uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_url text;
begin
  select p.url_ticketera into v_url
  from public.planes p
  join public.locales l on l.id = p.local_id
  where p.id = p_plan
    and p.estado = 'publicado'
    and p.modo_entradas = 'enlace_externo'
    and l.estado_verificacion = 'verificado';

  if v_url is null then
    return null;
  end if;

  insert into public.clics_ticketera (plan_id, user_id) values (p_plan, auth.uid());
  return v_url;
end
$$;

-- Quién puede llamar a qué desde la API.
revoke execute on function public.crear_local(
  text, text, public.tipo_local, text, double precision, double precision, text, text, text, text, text, integer
) from public, anon;
grant execute on function public.crear_local(
  text, text, public.tipo_local, text, double precision, double precision, text, text, text, text, text, integer
) to authenticated;
-- registrar_clic sigue abierta a todos a propósito: "Pillar entrada" funciona sin cuenta.

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Reglas RLS: perfiles y reglas sin solapes
-- ─────────────────────────────────────────────────────────────────────────────

-- Perfil público: lo ve cualquiera con cuenta; cada uno edita el suyo.
drop policy "perfil propio: ver" on public.perfiles;
drop policy "perfil propio: editar" on public.perfiles;
create policy "perfiles: ver (con cuenta)" on public.perfiles for select to authenticated
  using (true);
create policy "perfiles: editar el mío" on public.perfiles for update
  using (id = (select auth.uid()) or (select privado.es_admin()))
  with check (id = (select auth.uid()) or (select privado.es_admin()));

-- Perfil privado: solo su dueño (y Rotllo).
create policy "perfil privado: ver el mío" on public.perfiles_privados for select
  using (id = (select auth.uid()) or (select privado.es_admin()));
create policy "perfil privado: editar el mío" on public.perfiles_privados for update
  using (id = (select auth.uid()) or (select privado.es_admin()))
  with check (id = (select auth.uid()) or (select privado.es_admin()));

-- Las reglas "gestionar" (for all) se solapaban con las de "ver". Se separan por acción.
drop policy "admins: gestionar" on public.admins_rotllo;
create policy "admins: nombrar" on public.admins_rotllo for insert with check ((select privado.es_admin()));
create policy "admins: quitar" on public.admins_rotllo for delete using ((select privado.es_admin()));

drop policy "categorias: gestionar" on public.categorias;
create policy "categorias: crear" on public.categorias for insert with check ((select privado.es_admin()));
create policy "categorias: editar" on public.categorias for update
  using ((select privado.es_admin())) with check ((select privado.es_admin()));
create policy "categorias: borrar" on public.categorias for delete using ((select privado.es_admin()));

drop policy "fotos: gestionar" on public.fotos_plan;
create policy "fotos: añadir" on public.fotos_plan for insert with check (privado.puede_editar_plan(plan_id));
create policy "fotos: editar" on public.fotos_plan for update
  using (privado.puede_editar_plan(plan_id)) with check (privado.puede_editar_plan(plan_id));
create policy "fotos: borrar" on public.fotos_plan for delete using (privado.puede_editar_plan(plan_id));

drop policy "miembros: gestionar" on public.miembros_local;
create policy "miembros: añadir" on public.miembros_local for insert
  with check (privado.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or (select privado.es_admin()));
create policy "miembros: cambiar rol" on public.miembros_local for update
  using (privado.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or (select privado.es_admin()))
  with check (privado.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or (select privado.es_admin()));
create policy "miembros: quitar" on public.miembros_local for delete
  using (privado.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or (select privado.es_admin()));

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Índices para las claves que cruzan tablas
-- ─────────────────────────────────────────────────────────────────────────────

create index favoritos_plan_idx on public.favoritos (plan_id);
create index planes_categoria_idx on public.planes (categoria_id);
create index planes_creado_por_idx on public.planes (creado_por);
create index locales_creado_por_idx on public.locales (creado_por);
create index locales_verificado_por_idx on public.locales (verificado_por);
create index reportes_revisado_por_idx on public.reportes (revisado_por);
create index clics_ticketera_user_idx on public.clics_ticketera (user_id);
