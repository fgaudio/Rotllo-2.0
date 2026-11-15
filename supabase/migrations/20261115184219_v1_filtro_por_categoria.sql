-- Filtro por tipo de plan en el feed (Fiesta, Música en directo, Bar y tardeo...).
-- buscar_planes gana un quinto dato, p_categoria (el "slug" de la categoría, o null = todas),
-- que se puede combinar con el filtro de siempre (hoy, finde, gratis).
--
-- Una función no admite un dato nuevo sin más: hay que quitarla y volver a crearla. Los cuatro
-- primeros datos siguen igual y en el mismo orden, así que las llamadas antiguas siguen valiendo.

drop function public.buscar_planes(text, integer, integer, timestamptz);

create function public.buscar_planes(
  p_filtro text default null, -- null (todos) | 'hoy' | 'finde' | 'gratis'
  p_desde integer default 0,
  p_limite integer default 30,
  p_ahora timestamptz default now(),
  p_categoria text default null -- null (todas) | 'fiesta' | 'musica-en-directo' | ...
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
  order by f.empieza_en, f.id
  offset greatest(p_desde, 0)
  limit least(greatest(p_limite, 1), 100)
$$;

grant execute on function public.buscar_planes(text, integer, integer, timestamptz, text) to anon, authenticated;
