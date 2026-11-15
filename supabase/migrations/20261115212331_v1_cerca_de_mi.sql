-- «Cerca de mí»: el feed ordenado por cercanía.
--
-- buscar_planes_cerca hace lo mismo que buscar_planes (mismos filtros), pero recibe la posición
-- de la persona y, dentro de cada día, pone primero los planes que le quedan más cerca. Los días
-- siguen en su orden (hoy, mañana...) para que la agenda de la app se lea igual.
--
-- La posición solo se usa para ordenar: no se guarda en ninguna tabla.
--
-- Para no escribir dos veces las reglas de los filtros, se sacan a una función interna
-- (privado.planes_filtrados) que usan las dos búsquedas. buscar_planes no cambia por fuera:
-- mismos datos de entrada, mismo resultado y mismo orden.

-- Los planes publicados que no han terminado y cumplen el filtro, sin ordenar ni paginar.
create function privado.planes_filtrados(
  p_filtro text, -- null (todos) | 'hoy' | 'finde' | 'gratis'
  p_ahora timestamptz,
  p_categoria text -- null (todas) | 'fiesta' | 'musica-en-directo' | ...
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
    and (p_categoria is null or f.categoria = p_categoria)
    and case p_filtro
      when 'hoy' then f.empieza_en < v.hoy_fin
      when 'finde' then f.empieza_en < v.finde_fin
                        and coalesce(f.termina_en, f.empieza_en + interval '6 hours') > v.finde_inicio
      when 'gratis' then f.es_gratis
      else true
    end
$$;

-- El feed de siempre, por orden de fecha. Solo cambia por dentro.
create or replace function public.buscar_planes(
  p_filtro text default null,
  p_desde integer default 0,
  p_limite integer default 30,
  p_ahora timestamptz default now(),
  p_categoria text default null
) returns setof public.planes_feed
language sql stable set search_path = '' as $$
  select f.*
  from privado.planes_filtrados(p_filtro, p_ahora, p_categoria) f
  order by f.empieza_en, f.id
  offset greatest(p_desde, 0)
  limit least(greatest(p_limite, 1), 100)
$$;

-- El feed por cercanía: primero el día (un plan que empezó ayer y sigue abierto cuenta como de
-- hoy) y, dentro del día, lo más cercano a la posición que se da. Con una posición que no existe
-- (latitud fuera de -90..90 o longitud fuera de -180..180) no devuelve nada.
create function public.buscar_planes_cerca(
  p_lat double precision,
  p_lng double precision,
  p_filtro text default null,
  p_desde integer default 0,
  p_limite integer default 30,
  p_ahora timestamptz default now(),
  p_categoria text default null
) returns setof public.planes_feed
language sql stable set search_path = '' as $$
  select f.*
  from privado.planes_filtrados(p_filtro, p_ahora, p_categoria) f
  where p_lat between -90 and 90 and p_lng between -180 and 180
  order by
    greatest(privado.dia_nocturno(f.empieza_en), privado.dia_nocturno(p_ahora)),
    extensions.st_distance(
      extensions.st_setsrid(extensions.st_makepoint(f.lng, f.lat), 4326)::extensions.geography,
      extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography
    ),
    f.empieza_en,
    f.id
  offset greatest(p_desde, 0)
  limit least(greatest(p_limite, 1), 100)
$$;

grant execute on function public.buscar_planes_cerca(double precision, double precision, text, integer, integer, timestamptz, text) to anon, authenticated;
