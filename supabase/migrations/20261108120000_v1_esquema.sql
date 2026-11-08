-- Rotllo · v1 · Esquema inicial
-- Tablas de la v1 de docs/system-design.md, con sus reglas de seguridad (RLS).
--
-- Cómo leer este archivo:
--   1. Extensiones y tipos (las listas cerradas de valores).
--   2. Tablas.
--   3. Funciones de ayuda (¿es admin?, ¿es del local?...).
--   4. Triggers: reglas que se comprueban solas al guardar.
--   5. Reglas RLS: quién puede leer o cambiar cada fila.
--   6. Funciones que llama la app (crear_local, registrar_clic) y la vista del feed.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extensiones y tipos
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists postgis with schema extensions;

create type public.idioma as enum ('es', 'en', 'it');
create type public.estado_perfil as enum ('incompleto', 'activo', 'suspendido');
create type public.tipo_local as enum ('bar', 'discoteca', 'actividad', 'cultura', 'otro');
create type public.estado_verificacion as enum ('pendiente', 'verificado', 'rechazado', 'suspendido');
create type public.rol_local as enum ('propietario', 'editor', 'portero');
create type public.modo_entradas as enum ('ninguna', 'enlace_externo', 'rotllo');
create type public.estado_plan as enum ('borrador', 'publicado', 'cancelado', 'finalizado');
create type public.tipo_objetivo as enum ('plan', 'local', 'usuario', 'mensaje', 'jam');
create type public.motivo_reporte as enum ('spam', 'acoso', 'inapropiado', 'fraude', 'menores', 'otro');
create type public.estado_reporte as enum ('pendiente', 'accion_tomada', 'descartado');

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Tablas
-- ─────────────────────────────────────────────────────────────────────────────

-- Un perfil por cada cuenta de Supabase Auth. Se crea solo (trigger en auth.users).
create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  nombre_visible text check (char_length(nombre_visible) between 1 and 50),
  avatar_url text,
  fecha_nacimiento date, -- privada; tiene que dar 18 años o más (trigger)
  idioma public.idioma not null default 'es',
  estado public.estado_perfil not null default 'incompleto',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- El equipo de Rotllo. Tabla aparte para que nadie pueda hacerse admin editando su perfil.
create table public.admins_rotllo (
  user_id uuid primary key references public.perfiles (id) on delete cascade,
  creado_en timestamptz not null default now()
);

create table public.locales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  tipo public.tipo_local not null,
  descripcion text,
  direccion text not null,
  barrio text,
  ubicacion extensions.geography(point, 4326) not null,
  instagram text,
  web text,
  telefono text,
  logo_url text,
  portada_url text,
  edad_minima_defecto smallint not null default 18 check (edad_minima_defecto >= 18),
  estado_verificacion public.estado_verificacion not null default 'pendiente',
  motivo_rechazo text,
  verificado_en timestamptz,
  verificado_por uuid references public.perfiles (id) on delete set null,
  stripe_account_id text, -- v2 · entradas
  stripe_listo boolean not null default false, -- v2 · entradas
  creado_por uuid references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);
create index locales_ubicacion_idx on public.locales using gist (ubicacion);

-- Datos del local que no son públicos.
create table public.locales_privado (
  local_id uuid primary key references public.locales (id) on delete cascade,
  razon_social text,
  nif text,
  email_contacto text,
  telefono_contacto text
);

create table public.miembros_local (
  local_id uuid not null references public.locales (id) on delete cascade,
  user_id uuid not null references public.perfiles (id) on delete cascade,
  rol public.rol_local not null,
  creado_en timestamptz not null default now(),
  primary key (local_id, user_id)
);
create index miembros_local_user_idx on public.miembros_local (user_id);

-- Lista cerrada: solo la cambia un admin. Los nombres van en es/en/it.
create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre jsonb not null check (nombre ? 'es'),
  icono text,
  orden smallint not null default 0,
  activa boolean not null default true
);

create table public.planes (
  id uuid primary key default gen_random_uuid(),
  local_id uuid not null references public.locales (id) on delete cascade,
  categoria_id uuid not null references public.categorias (id),
  titulo text not null check (char_length(titulo) between 3 and 80),
  descripcion text not null default '',
  idioma public.idioma not null default 'es',
  empieza_en timestamptz not null,
  termina_en timestamptz,
  ubicacion extensions.geography(point, 4326) not null, -- si no se da, la del local (trigger)
  direccion text not null, -- si no se da, la del local (trigger)
  es_gratis boolean not null default false,
  precio_desde_centimos integer check (precio_desde_centimos >= 0),
  edad_minima smallint not null check (edad_minima >= 18), -- si no se da, la del local (trigger)
  publico_edad_desde smallint check (publico_edad_desde >= 18),
  publico_edad_hasta smallint,
  modo_entradas public.modo_entradas not null default 'ninguna',
  url_ticketera text,
  admite_devoluciones boolean not null default false, -- v2 · entradas
  devoluciones_hasta_horas smallint check (devoluciones_hasta_horas > 0), -- v2 · entradas
  estado public.estado_plan not null default 'borrador',
  motivo_cancelacion text,
  publicado_en timestamptz,
  cancelado_en timestamptz,
  creado_por uuid references public.perfiles (id) on delete set null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint termina_despues check (termina_en is null or termina_en > empieza_en),
  constraint publico_coherente check (
    publico_edad_hasta is null or publico_edad_hasta >= coalesce(publico_edad_desde, 18)
  ),
  constraint ticketera_si_enlace check (
    modo_entradas <> 'enlace_externo' or url_ticketera ~ '^https://'
  ),
  constraint gratis_sin_precio check (not es_gratis or coalesce(precio_desde_centimos, 0) = 0)
);
create index planes_ubicacion_idx on public.planes using gist (ubicacion);
create index planes_estado_fecha_idx on public.planes (estado, empieza_en);
create index planes_local_idx on public.planes (local_id);

create table public.fotos_plan (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.planes (id) on delete cascade,
  storage_path text not null, -- ruta dentro del bucket "planes": {plan_id}/{foto_id}-1600.webp
  texto_alternativo text,
  orden smallint not null default 0 check (orden between 0 and 5), -- máximo 6 fotos
  unique (plan_id, orden)
);

create table public.favoritos (
  user_id uuid not null references public.perfiles (id) on delete cascade,
  plan_id uuid not null references public.planes (id) on delete cascade,
  creado_en timestamptz not null default now(),
  primary key (user_id, plan_id)
);

create table public.reportes (
  id uuid primary key default gen_random_uuid(),
  reportado_por uuid not null references public.perfiles (id) on delete cascade,
  tipo_objetivo public.tipo_objetivo not null,
  objetivo_id uuid not null,
  motivo public.motivo_reporte not null,
  detalle text check (char_length(detalle) <= 1000),
  estado public.estado_reporte not null default 'pendiente',
  revisado_por uuid references public.perfiles (id) on delete set null,
  revisado_en timestamptz,
  resolucion text,
  creado_en timestamptz not null default now(),
  unique (reportado_por, tipo_objetivo, objetivo_id)
);

-- Cuántas personas manda Rotllo a la ticketera de cada plan (ADR-003).
create table public.clics_ticketera (
  id bigint generated always as identity primary key,
  plan_id uuid not null references public.planes (id) on delete cascade,
  user_id uuid references public.perfiles (id) on delete set null, -- vacío si no tiene cuenta
  creado_en timestamptz not null default now()
);
create index clics_ticketera_plan_idx on public.clics_ticketera (plan_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Funciones de ayuda
--    "security definer" = se ejecutan con permisos del dueño, así pueden mirar tablas
--    protegidas sin entrar en un bucle de reglas RLS.
-- ─────────────────────────────────────────────────────────────────────────────

create function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins_rotllo where user_id = (select auth.uid()))
$$;

create function public.es_miembro_local(
  p_local uuid,
  p_roles public.rol_local[] default array['propietario', 'editor', 'portero']::public.rol_local[]
) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.miembros_local
    where local_id = p_local and user_id = (select auth.uid()) and rol = any (p_roles)
  )
$$;

create function public.usuario_activo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = (select auth.uid()) and estado = 'activo')
$$;

create function public.local_verificado(p_local uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.locales where id = p_local and estado_verificacion = 'verificado')
$$;

create function public.puede_editar_plan(p_plan uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.planes p
    where p.id = p_plan
      and (
        public.es_admin()
        or (public.es_miembro_local(p.local_id, array['propietario', 'editor']::public.rol_local[])
            and public.usuario_activo())
      )
  )
$$;

-- Quien no es un cliente de la app (service_role, postgres) o un admin de Rotllo.
-- No es security definer a propósito: necesita ver el rol real de quien ejecuta.
create function public.es_privilegiado() returns boolean
language sql stable set search_path = public as $$
  select current_user not in ('anon', 'authenticated') or public.es_admin()
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- Al crear una cuenta en Supabase Auth, se crea su perfil.
-- Si el registro trae la fecha de nacimiento (registro con email), se guarda ya.
create function public.crear_perfil_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre_visible, fecha_nacimiento)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'nombre', new.raw_user_meta_data ->> 'name', ''), 50), ''),
    (new.raw_user_meta_data ->> 'fecha_nacimiento')::date
  );
  return new;
end
$$;

create trigger crear_perfil_al_registrarse
after insert on auth.users
for each row execute function public.crear_perfil_nuevo_usuario();

-- Reglas del perfil: mayor de 18, la fecha se pone una sola vez, y el estado no lo
-- cambia el usuario (pasa solo a "activo" cuando hay fecha válida).
create function public.perfiles_antes_de_guardar() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.fecha_nacimiento is not null
     and new.fecha_nacimiento > (current_date - interval '18 years')::date then
    raise exception 'Rotllo es para mayores de 18 años' using errcode = 'check_violation';
  end if;

  if tg_op = 'UPDATE' and not public.es_privilegiado() then
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

create trigger perfiles_antes_de_guardar
before insert or update on public.perfiles
for each row execute function public.perfiles_antes_de_guardar();

-- Locales: la verificación, Stripe y quién lo creó solo los cambia Rotllo.
create function public.locales_antes_de_actualizar() returns trigger
language plpgsql set search_path = public as $$
begin
  if not public.es_privilegiado() and (
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

create trigger locales_antes_de_actualizar
before update on public.locales
for each row execute function public.locales_antes_de_actualizar();

-- Un local nunca se queda sin propietario.
create function public.miembros_conservar_propietario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.rol = 'propietario'
     and (tg_op = 'DELETE' or new.rol <> 'propietario')
     and exists (select 1 from public.locales where id = old.local_id) -- si se borra el local, da igual
     and not exists (
       select 1 from public.miembros_local
       where local_id = old.local_id and rol = 'propietario' and user_id <> old.user_id
     ) then
    raise exception 'Un local necesita al menos un propietario' using errcode = 'check_violation';
  end if;
  return coalesce(new, old);
end
$$;

create trigger miembros_conservar_propietario
before update or delete on public.miembros_local
for each row execute function public.miembros_conservar_propietario();

-- Planes: valores por defecto del local y reglas de publicación.
create function public.planes_antes_de_guardar() returns trigger
language plpgsql set search_path = public, extensions as $$
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
    if old.estado in ('cancelado', 'finalizado') and not public.es_privilegiado() then
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

create trigger planes_antes_de_guardar
before insert or update on public.planes
for each row execute function public.planes_antes_de_guardar();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Reglas RLS
--    Si ninguna regla lo permite, está prohibido. El admin de Rotllo puede todo.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.perfiles enable row level security;
alter table public.admins_rotllo enable row level security;
alter table public.locales enable row level security;
alter table public.locales_privado enable row level security;
alter table public.miembros_local enable row level security;
alter table public.categorias enable row level security;
alter table public.planes enable row level security;
alter table public.fotos_plan enable row level security;
alter table public.favoritos enable row level security;
alter table public.reportes enable row level security;
alter table public.clics_ticketera enable row level security;

-- perfiles: cada uno ve y edita el suyo. Los demás usan la vista perfiles_publicos.
create policy "perfil propio: ver" on public.perfiles for select
  using (id = (select auth.uid()) or public.es_admin());
create policy "perfil propio: editar" on public.perfiles for update
  using (id = (select auth.uid()) or public.es_admin())
  with check (id = (select auth.uid()) or public.es_admin());

-- admins_rotllo: cada uno puede saber si es admin; solo un admin nombra a otros.
create policy "admins: ver" on public.admins_rotllo for select
  using (user_id = (select auth.uid()) or public.es_admin());
create policy "admins: gestionar" on public.admins_rotllo for all
  using (public.es_admin()) with check (public.es_admin());

-- locales: todos ven los verificados; sus miembros, siempre. Se crean con crear_local().
create policy "locales: ver" on public.locales for select
  using (estado_verificacion = 'verificado' or public.es_miembro_local(id) or public.es_admin());
create policy "locales: editar" on public.locales for update
  using (public.es_miembro_local(id, array['propietario', 'editor']::public.rol_local[]) or public.es_admin())
  with check (public.es_miembro_local(id, array['propietario', 'editor']::public.rol_local[]) or public.es_admin());
create policy "locales: borrar" on public.locales for delete
  using (public.es_admin());

create policy "local privado: ver" on public.locales_privado for select
  using (public.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or public.es_admin());
create policy "local privado: editar" on public.locales_privado for update
  using (public.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or public.es_admin())
  with check (public.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or public.es_admin());

create policy "miembros: ver" on public.miembros_local for select
  using (public.es_miembro_local(local_id) or public.es_admin());
create policy "miembros: gestionar" on public.miembros_local for all
  using (public.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or public.es_admin())
  with check (public.es_miembro_local(local_id, array['propietario']::public.rol_local[]) or public.es_admin());

create policy "categorias: ver" on public.categorias for select
  using (activa or public.es_admin());
create policy "categorias: gestionar" on public.categorias for all
  using (public.es_admin()) with check (public.es_admin());

-- planes: todos ven los no-borradores de locales verificados; el local ve también sus borradores.
create policy "planes: ver" on public.planes for select
  using (
    (estado <> 'borrador' and public.local_verificado(local_id))
    or public.es_miembro_local(local_id)
    or public.es_admin()
  );
create policy "planes: crear" on public.planes for insert
  with check (
    (public.es_miembro_local(local_id, array['propietario', 'editor']::public.rol_local[]) and public.usuario_activo())
    or public.es_admin()
  );
create policy "planes: editar" on public.planes for update
  using (
    (public.es_miembro_local(local_id, array['propietario', 'editor']::public.rol_local[]) and public.usuario_activo())
    or public.es_admin()
  )
  with check (
    (public.es_miembro_local(local_id, array['propietario', 'editor']::public.rol_local[]) and public.usuario_activo())
    or public.es_admin()
  );
create policy "planes: borrar borradores" on public.planes for delete
  using (
    (estado = 'borrador' and public.es_miembro_local(local_id, array['propietario', 'editor']::public.rol_local[]))
    or public.es_admin()
  );

-- fotos: visibles si el plan es visible (la subconsulta aplica las reglas de planes).
create policy "fotos: ver" on public.fotos_plan for select
  using (exists (select 1 from public.planes p where p.id = plan_id));
create policy "fotos: gestionar" on public.fotos_plan for all
  using (public.puede_editar_plan(plan_id)) with check (public.puede_editar_plan(plan_id));

create policy "favoritos: ver los míos" on public.favoritos for select
  using (user_id = (select auth.uid()));
create policy "favoritos: guardar" on public.favoritos for insert
  with check (
    user_id = (select auth.uid())
    and public.usuario_activo()
    and exists (select 1 from public.planes p where p.id = plan_id)
  );
create policy "favoritos: quitar" on public.favoritos for delete
  using (user_id = (select auth.uid()));

create policy "reportes: ver los míos" on public.reportes for select
  using (reportado_por = (select auth.uid()) or public.es_admin());
create policy "reportes: enviar" on public.reportes for insert
  with check (reportado_por = (select auth.uid()) and public.usuario_activo() and estado = 'pendiente');
create policy "reportes: revisar" on public.reportes for update
  using (public.es_admin()) with check (public.es_admin());

-- clics: solo los ve el local del plan. Se registran con registrar_clic().
create policy "clics: ver los de mi local" on public.clics_ticketera for select
  using (
    public.es_admin()
    or exists (
      select 1 from public.planes p
      where p.id = plan_id and public.es_miembro_local(p.local_id, array['propietario', 'editor']::public.rol_local[])
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Funciones para la app y vistas
-- ─────────────────────────────────────────────────────────────────────────────

-- Alta de un local: lo crea en "pendiente", guarda sus datos privados y pone a quien
-- lo crea como propietario. Todo junto o nada.
create function public.crear_local(
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
language plpgsql security definer set search_path = public, extensions as $$
declare
  v_local uuid;
begin
  if not public.usuario_activo() then
    raise exception 'Necesitas una cuenta activa para dar de alta un local'
      using errcode = 'insufficient_privilege';
  end if;

  insert into public.locales (
    nombre, slug, tipo, direccion, barrio, ubicacion, instagram, edad_minima_defecto, creado_por
  ) values (
    p_nombre, p_slug, p_tipo, p_direccion, p_barrio,
    st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography,
    p_instagram, p_edad_minima_defecto, auth.uid()
  ) returning id into v_local;

  insert into public.locales_privado (local_id, razon_social, nif, email_contacto)
  values (v_local, p_razon_social, p_nif, p_email_contacto);

  insert into public.miembros_local (local_id, user_id, rol)
  values (v_local, auth.uid(), 'propietario');

  return v_local;
end
$$;

-- "Pillar entrada" en la v1: apunta el clic y devuelve el enlace de la ticketera.
-- Funciona también sin cuenta (anon).
create function public.registrar_clic(p_plan uuid) returns text
language plpgsql security definer set search_path = public as $$
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

-- Lo que ven los demás de un perfil. Nunca la fecha de nacimiento.
create view public.perfiles_publicos as
select id, username, nombre_visible, avatar_url
from public.perfiles
where estado <> 'suspendido';

grant select on public.perfiles_publicos to anon, authenticated;

-- Feed y ficha de planes: una fila "plana" con todo lo que pinta la app.
-- security_invoker = true: se aplican las reglas RLS de quien consulta.
create view public.planes_feed
with (security_invoker = true) as
select
  p.id,
  p.titulo,
  p.descripcion,
  c.slug as categoria,
  p.empieza_en,
  p.termina_en,
  l.nombre as local,
  p.direccion,
  l.barrio,
  extensions.st_y(p.ubicacion::extensions.geometry) as lat,
  extensions.st_x(p.ubicacion::extensions.geometry) as lng,
  p.es_gratis,
  p.precio_desde_centimos,
  p.edad_minima,
  p.publico_edad_desde,
  p.publico_edad_hasta,
  p.modo_entradas,
  p.url_ticketera,
  (
    select f.storage_path from public.fotos_plan f
    where f.plan_id = p.id
    order by f.orden
    limit 1
  ) as foto_path,
  p.estado
from public.planes p
join public.locales l on l.id = p.local_id
join public.categorias c on c.id = p.categoria_id
where p.estado in ('publicado', 'cancelado');

grant select on public.planes_feed to anon, authenticated;
