-- El cartel del plan.
-- Cada plan se enseña con un cartel. Si el local sube una foto o un flyer (fotos_plan), ese es
-- su cartel. Si no, la app genera uno, y aquí se guarda cómo lo quiere el local:
--   estilo: 'cinta' (el texto repetido), 'inicial' (una letra gigante) o 'serie' (2×2 de colores)
--   color:  una combinación de la lista cerrada de la app (src/theme/tokens.ts, coloresCartel)
--   texto:  lo que se lee en el cartel; si falta, el título del plan. Máximo 40 letras.
-- Todo es opcional: lo que falte lo decide la app (src/lib/cartel.ts).
-- Lo edita quien puede editar el plan (regla "planes: editar"); no hacen falta permisos nuevos.

alter table public.planes add column cartel jsonb;

alter table public.planes add constraint cartel_valido check (
  cartel is null
  or (
    jsonb_typeof(cartel) = 'object'
    and (cartel - 'estilo' - 'color' - 'texto') = '{}'::jsonb -- ninguna clave que no conozcamos
    and (not cartel ? 'estilo' or coalesce(cartel ->> 'estilo', '') in ('cinta', 'inicial', 'serie'))
    and (not cartel ? 'color' or coalesce(cartel ->> 'color', '') in ('rosa', 'amarillo', 'turquesa', 'violeta', 'azul', 'rojo', 'papel'))
    and (
      not cartel ? 'texto'
      or (jsonb_typeof(cartel -> 'texto') = 'string' and char_length(btrim(cartel ->> 'texto')) between 1 and 40)
    )
  )
);

comment on column public.planes.cartel is 'Cómo quiere el local su cartel generado: {estilo, color, texto}. Null = lo decide la app.';

-- La vista del feed, con el cartel al final (una vista solo admite columnas nuevas al final).
create or replace view public.planes_feed
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
  p.estado,
  p.cartel
from public.planes p
join public.locales l on l.id = p.local_id
join public.categorias c on c.id = p.categoria_id
where p.estado in ('publicado', 'cancelado'); -- los borradores no salen nunca en el feed
