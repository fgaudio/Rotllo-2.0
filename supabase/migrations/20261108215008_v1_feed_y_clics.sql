-- Rotllo · v1 · Feed por páginas con filtros "de noche", reglas ligeras para quien no tiene
-- cuenta y límite de clics (docs/revision-cto.md, puntos 2, 3, 4, 5 y 7).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. El "día de noche": de 06:00 a 06:00, siempre en hora de Valencia
--    A las 23:30 del viernes, la fiesta que abre a las 00:30 sigue siendo "hoy".
-- ─────────────────────────────────────────────────────────────────────────────

-- Un día y una hora de Valencia → el instante exacto (tiene en cuenta el cambio de hora).
create function privado.instante_valencia(p_dia date, p_hora time) returns timestamptz
language sql stable set search_path = '' as $$
  select (p_dia + p_hora) at time zone 'Europe/Madrid'
$$;

-- Qué "día de noche" es en un momento dado (antes de las 06:00 cuenta como el día anterior).
create function privado.dia_nocturno(p_ahora timestamptz) returns date
language sql stable set search_path = '' as $$
  select ((p_ahora at time zone 'Europe/Madrid') - interval '6 hours')::date
$$;

-- Feed y búsqueda con filtros, de 30 en 30. Usa las reglas RLS de quien llama
-- (no es security definer). p_ahora solo se cambia en los tests.
create function public.buscar_planes(
  p_filtro text default null, -- null (todos) | 'hoy' | 'finde' | 'gratis'
  p_desde integer default 0,
  p_limite integer default 30,
  p_ahora timestamptz default now()
) returns setof public.planes_feed
language sql stable set search_path = '' as $$
  with dia as (
    select privado.dia_nocturno(p_ahora) as d, extract(isodow from privado.dia_nocturno(p_ahora))::int as dow
  ),
  ventana as (
    select
      privado.instante_valencia(d + 1, time '06:00') as hoy_fin,
      -- viernes de este finde (si ya es viernes, sábado o domingo) o del próximo
      privado.instante_valencia(case when dow >= 5 then d - (dow - 5) else d + (5 - dow) end, time '06:00') as finde_inicio,
      privado.instante_valencia(case when dow >= 5 then d - (dow - 5) else d + (5 - dow) end + 3, time '06:00') as finde_fin
    from dia
  )
  select f.*
  from public.planes_feed f, ventana v
  where f.estado = 'publicado'
    -- que no haya terminado (sin hora de fin, se da por terminado 6 h después de empezar)
    and coalesce(f.termina_en, f.empieza_en + interval '6 hours') > p_ahora
    and case p_filtro
      when 'hoy' then f.empieza_en < v.hoy_fin
      when 'finde' then f.empieza_en < v.finde_fin
                        and coalesce(f.termina_en, f.empieza_en + interval '6 hours') > v.finde_inicio
      when 'gratis' then f.es_gratis
      else true
    end
  order by f.empieza_en, f.id
  offset greatest(p_desde, 0)
  limit least(greatest(p_limite, 1), 100)
$$;

grant execute on function public.buscar_planes(text, integer, integer, timestamptz) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Reglas de lectura separadas: sin cuenta (lo mínimo) y con cuenta
--    Para quien no tiene cuenta ya no se comprueba plan a plan si es miembro o admin.
-- ─────────────────────────────────────────────────────────────────────────────

drop policy "locales: ver" on public.locales;
create policy "locales: ver (sin cuenta)" on public.locales for select to anon
  using (estado_verificacion = 'verificado');
create policy "locales: ver (con cuenta)" on public.locales for select to authenticated
  using (estado_verificacion = 'verificado' or privado.es_miembro_local(id) or (select privado.es_admin()));

drop policy "planes: ver" on public.planes;
create policy "planes: ver (sin cuenta)" on public.planes for select to anon
  using (
    estado <> 'borrador'
    and exists (select 1 from public.locales l where l.id = local_id and l.estado_verificacion = 'verificado')
  );
create policy "planes: ver (con cuenta)" on public.planes for select to authenticated
  using (
    (estado <> 'borrador' and privado.local_verificado(local_id))
    or privado.es_miembro_local(local_id)
    or (select privado.es_admin())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Clics: como mucho 1 por persona (o por móvil, sin cuenta), plan y hora
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.clics_ticketera
  add column dispositivo text check (char_length(dispositivo) <= 64);
create index clics_ticketera_plan_fecha_idx on public.clics_ticketera (plan_id, creado_en);

drop function public.registrar_clic(uuid);

create function public.registrar_clic(p_plan uuid, p_dispositivo text default null) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_url text;
  v_usuario uuid := auth.uid();
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

  if not exists (
    select 1 from public.clics_ticketera c
    where c.plan_id = p_plan
      and c.creado_en > now() - interval '1 hour'
      and (
        (v_usuario is not null and c.user_id = v_usuario)
        or (v_usuario is null and p_dispositivo is not null and c.dispositivo = p_dispositivo)
      )
  ) then
    insert into public.clics_ticketera (plan_id, user_id, dispositivo)
    values (p_plan, v_usuario, left(p_dispositivo, 64));
  end if;

  return v_url;
end
$$;

grant execute on function public.registrar_clic(uuid, text) to anon, authenticated;
