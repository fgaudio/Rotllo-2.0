-- Rotllo · v1 · Arreglos de la revisión de seguridad de la Fase 3 (docs/revision-seguridad.md).
--
-- Ninguno era crítico: nadie podía hacerse admin, tocar planes ajenos ni ver datos privados.
-- Son agujeros medianos y pequeños, sobre todo de suplantación y de abuso:
--
--   S1. Meter a otra persona en tu local sin que lo sepa (y bloquearle borrar su cuenta).
--   S2. Cambiar el nombre de un local después de que Rotllo lo haya verificado.
--   S4. Reportes con la revisión ya rellenada, y sin límite.
--   S5. Inflar el contador de clics de «Pillar entrada» sin cuenta.
--   S6. Dar de alta cientos de locales de golpe.
--   S7. Firmar un plan a nombre de otra persona.
--   S8. Rutas de foto que apuntan fuera de la carpeta del plan.
--   S9. Enlaces de entradas que no son https.
--   S10. El local veía quién (nombre incluido) había pulsado «Pillar entrada» en sus planes.
--
-- (S3, el login con enlaces de otra persona, se arregla en la app, no aquí.)

-- ─────────────────────────────────────────────────────────────────────────────
-- S1. Solo el equipo de Rotllo añade personas a un local
--     En la v1 no hay invitaciones: quien da de alta un local queda como propietario
--     (crear_local) y nadie más entra sin pasar por el equipo. Cuando haya invitaciones,
--     la persona invitada tendrá que aceptarlas.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy "miembros: añadir" on public.miembros_local;
create policy "miembros: añadir" on public.miembros_local for insert
  with check ((select privado.es_admin()));

-- ─────────────────────────────────────────────────────────────────────────────
-- S2. El nombre, la dirección web (slug) y el sitio de un local verificado no se cambian
--     sin el equipo. Si no, alguien verificado como «Bar Pepe» podría pasar a llamarse
--     como otro local conocido y seguir con la marca de verificado.
-- ─────────────────────────────────────────────────────────────────────────────

create function privado.locales_proteger_identidad() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.estado_verificacion = 'verificado' and not privado.es_privilegiado() and (
       new.nombre is distinct from old.nombre
    or new.slug is distinct from old.slug
    or new.direccion is distinct from old.direccion
    or new.ubicacion::text is distinct from old.ubicacion::text
  ) then
    raise exception 'Para cambiar el nombre o la dirección de un local verificado, escribe al equipo de Rotllo'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end
$$;

create trigger locales_proteger_identidad
before update on public.locales
for each row execute function privado.locales_proteger_identidad();

-- ─────────────────────────────────────────────────────────────────────────────
-- S4. Reportes: quien reporta no puede rellenar la revisión, y como mucho 20 al día
-- ─────────────────────────────────────────────────────────────────────────────

-- Sin «security definer» a propósito: es_privilegiado() tiene que ver el rol real de quien
-- reporta, y la regla «reportes: ver los míos» ya deja contar los reportes propios.
create function privado.reportes_antes_de_crear() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not privado.es_privilegiado() then
    new.estado := 'pendiente';
    new.revisado_por := null;
    new.revisado_en := null;
    new.resolucion := null;
    new.creado_en := now();
    if (select count(*) from public.reportes r
        where r.reportado_por = new.reportado_por and r.creado_en > now() - interval '24 hours') >= 20 then
      raise exception 'Has enviado muchos reportes hoy. Prueba mañana o escríbenos'
        using errcode = 'RT002';
    end if;
  end if;
  return new;
end
$$;

create trigger reportes_antes_de_crear
before insert on public.reportes
for each row execute function privado.reportes_antes_de_crear();

-- ─────────────────────────────────────────────────────────────────────────────
-- S5. «Pillar entrada»: sin cuenta y sin identificador del móvil, el clic ya no cuenta
--     (el enlace se sigue devolviendo). Inventarse identificadores sigue siendo posible:
--     el número de clics es orientativo, y así se dice al local.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.registrar_clic(p_plan uuid, p_dispositivo text default null) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_url text;
  v_usuario uuid := auth.uid();
  v_dispositivo text := nullif(btrim(left(p_dispositivo, 64)), '');
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

  if (v_usuario is not null or v_dispositivo is not null) and not exists (
    select 1 from public.clics_ticketera c
    where c.plan_id = p_plan
      and c.creado_en > now() - interval '1 hour'
      and (
        (v_usuario is not null and c.user_id = v_usuario)
        or (v_usuario is null and c.dispositivo = v_dispositivo)
      )
  ) then
    insert into public.clics_ticketera (plan_id, user_id, dispositivo)
    values (p_plan, v_usuario, v_dispositivo);
  end if;

  return v_url;
end
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- S6. Como mucho 3 locales esperando revisión por persona
-- ─────────────────────────────────────────────────────────────────────────────

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

  if (select count(*) from public.locales l
      where l.creado_por = auth.uid() and l.estado_verificacion = 'pendiente') >= 3 then
    raise exception 'Ya tienes 3 locales esperando revisión' using errcode = 'RT003';
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

-- ─────────────────────────────────────────────────────────────────────────────
-- S7. Quien crea un plan es quien lo firma, y la firma no cambia
-- ─────────────────────────────────────────────────────────────────────────────

create function privado.planes_fijar_autor() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not privado.es_privilegiado() then
    if tg_op = 'INSERT' then
      new.creado_por := (select auth.uid());
    else
      new.creado_por := old.creado_por;
    end if;
  end if;
  return new;
end
$$;

-- Se llama «planes_fijar_autor» para que vaya después de «planes_antes_de_guardar»
-- (Postgres ejecuta los triggers por orden alfabético).
create trigger planes_fijar_autor
before insert or update on public.planes
for each row execute function privado.planes_fijar_autor();

-- ─────────────────────────────────────────────────────────────────────────────
-- S8. Cada foto vive en la carpeta de su plan: <plan_id>/<nombre de archivo>
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.fotos_plan add constraint foto_en_su_carpeta check (
  storage_path ~ ('^' || plan_id::text || '/[A-Za-z0-9][A-Za-z0-9._-]{0,99}$')
  and storage_path !~ '\.\.'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- S9. El enlace de entradas, si lo hay, siempre es https (tenga el plan el modo que tenga)
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.planes add constraint ticketera_https check (
  url_ticketera is null or url_ticketera ~ '^https://[^\s]+$'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- S10. El local cuenta los clics de sus planes, pero no sabe de quién son
--     La regla «clics: ver los de mi local» dejaba leer cada fila, con el user_id: cruzándolo
--     con los perfiles, el local sabía el nombre de quien había pulsado «Pillar entrada».
--     Ahora, desde la app, solo se pueden leer el plan y la hora de cada clic: lo justo para
--     contarlos (el panel usa «clics_ticketera (count)»). Rotllo lo sigue viendo todo desde el panel
--     de Supabase.
-- ─────────────────────────────────────────────────────────────────────────────

revoke select on public.clics_ticketera from anon, authenticated;
grant select (id, plan_id, creado_en) on public.clics_ticketera to authenticated;
