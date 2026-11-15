-- Tests de «Cerca de mí» (migración …_v1_cerca_de_mi): el feed ordenado por cercanía.
-- Fechas fijas de marzo de 2030 (jueves 14, viernes 15, sábado 16), como en 02_feed_y_clics.
-- Los mismos casos están en src/lib/filtros.test.ts, para que la app con datos de ejemplo
-- ordene igual que la base de datos.
--
-- Sitios de Valencia que se usan:
--   Ayuntamiento  39.4699, -0.3763  (donde está la persona en casi todos los casos)
--   el Carmen     39.4760, -0.3790  (a unos 0,7 km)
--   Russafa       39.4620, -0.3740  (a unos 0,9 km)
--   Benimaclet    39.4850, -0.3620  (a unos 2,1 km)
--   Malva-rosa    39.4780, -0.3250  (a unos 4,5 km)

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into public.planes (local_id, categoria_id, titulo, empieza_en, termina_en, es_gratis, estado, ubicacion)
select 'a0000000-0000-4000-8000-000000000001', c.id, t.titulo, t.empieza::timestamptz, t.termina::timestamptz, t.gratis, 'publicado',
       extensions.st_setsrid(extensions.st_makepoint(t.lng, t.lat), 4326)::extensions.geography
from (values
  ('D·jueves abierto',  'fiesta',            '2030-03-14 23:00 Europe/Madrid', '2030-03-16 01:00 Europe/Madrid', false, 39.4760, -0.3790),
  ('D·viernes medio',   'fiesta',            '2030-03-15 20:00 Europe/Madrid', null,                             false, 39.4850, -0.3620),
  ('D·viernes lejos',   'fiesta',            '2030-03-15 22:00 Europe/Madrid', null,                             false, 39.4780, -0.3250),
  ('D·viernes cerca',   'fiesta',            '2030-03-16 00:30 Europe/Madrid', null,                             false, 39.4620, -0.3740),
  ('D·sábado gratis',   'musica-en-directo', '2030-03-16 18:00 Europe/Madrid', null,                             true,  39.4780, -0.3250),
  ('D·sábado tarde',    'fiesta',            '2030-03-16 19:00 Europe/Madrid', null,                             false, 39.4700, -0.3760),
  ('D·sábado noche',    'fiesta',            '2030-03-16 23:00 Europe/Madrid', null,                             false, 39.4700, -0.3760)
) as t (titulo, slug, empieza, termina, gratis, lat, lng)
join public.categorias c on c.slug = t.slug;

-- Todo como alguien sin cuenta, que es quien más usa el feed
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

-- Viernes 15 a las 23:30, en el Ayuntamiento
select results_eq(
  $$ select titulo from buscar_planes_cerca(39.4699, -0.3763, null, 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'D·%' $$,
  $$ values ('D·jueves abierto'), ('D·viernes cerca'), ('D·viernes medio'), ('D·viernes lejos'), ('D·sábado tarde'), ('D·sábado noche'), ('D·sábado gratis') $$,
  'Cerca de mí: primero el día y, dentro del día, lo más cercano (lo que empezó ayer y sigue abierto cuenta como de hoy)');
select results_eq(
  $$ select titulo from buscar_planes(null, 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'D·%' $$,
  $$ values ('D·jueves abierto'), ('D·viernes medio'), ('D·viernes lejos'), ('D·viernes cerca'), ('D·sábado gratis'), ('D·sábado tarde'), ('D·sábado noche') $$,
  'El feed de siempre sigue por orden de fecha');

-- La misma noche, desde la Malva-rosa: cambia el orden dentro de cada día
select results_eq(
  $$ select titulo from buscar_planes_cerca(39.4780, -0.3250, null, 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'D·%' $$,
  $$ values ('D·viernes lejos'), ('D·viernes medio'), ('D·viernes cerca'), ('D·jueves abierto'), ('D·sábado gratis'), ('D·sábado tarde'), ('D·sábado noche') $$,
  'Desde otro sitio, el orden dentro de cada día cambia');

-- Con los filtros de siempre
select results_eq(
  $$ select titulo from buscar_planes_cerca(39.4699, -0.3763, 'hoy', 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'D·%' $$,
  $$ values ('D·jueves abierto'), ('D·viernes cerca'), ('D·viernes medio'), ('D·viernes lejos') $$,
  'Cerca de mí y "hoy" a la vez');
select results_eq(
  $$ select titulo from buscar_planes_cerca(39.4699, -0.3763, 'gratis', 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'D·%' $$,
  $$ values ('D·sábado gratis') $$,
  'Cerca de mí y "gratis" a la vez');
select results_eq(
  $$ select titulo from buscar_planes_cerca(39.4699, -0.3763, 'finde', 0, 100, '2030-03-15 23:30 Europe/Madrid', 'musica-en-directo') where titulo like 'D·%' $$,
  $$ values ('D·sábado gratis') $$,
  'Cerca de mí, "este finde" y un tipo de plan a la vez');

-- Mismo día y mismo sitio: por hora
select results_eq(
  $$ select titulo from buscar_planes_cerca(39.4699, -0.3763, null, 0, 100, '2030-03-16 12:00 Europe/Madrid') where titulo like 'D·%' $$,
  $$ values ('D·sábado tarde'), ('D·sábado noche'), ('D·sábado gratis') $$,
  'Dos planes del mismo día en el mismo sitio salen por hora');

-- Paginación
select results_eq(
  $$ select titulo from (select * from buscar_planes_cerca(39.4699, -0.3763, 'hoy', 2, 2, '2030-03-15 23:30 Europe/Madrid')) p where titulo like 'D·%' $$,
  $$ values ('D·viernes medio'), ('D·viernes lejos') $$,
  'La segunda página sigue donde acabó la primera');

-- Posiciones que no existen
select is((select count(*)::int from buscar_planes_cerca(91, -0.3763, null, 0, 100, '2030-03-15 23:30 Europe/Madrid')), 0,
  'Una latitud imposible no devuelve nada');
select is((select count(*)::int from buscar_planes_cerca(39.4699, 181, null, 0, 100, '2030-03-15 23:30 Europe/Madrid')), 0,
  'Una longitud imposible no devuelve nada');
select is((select count(*)::int from buscar_planes_cerca(null, null, null, 0, 100, '2030-03-15 23:30 Europe/Madrid')), 0,
  'Sin posición no devuelve nada');

-- No enseña nada que el feed normal no enseñe
select is(
  (select count(*)::int from buscar_planes_cerca(39.4699, -0.3763, null, 0, 100, '2030-03-15 23:30 Europe/Madrid')),
  (select count(*)::int from buscar_planes(null, 0, 100, '2030-03-15 23:30 Europe/Madrid')),
  'Salen los mismos planes que en el feed normal, solo cambia el orden');

reset role;
select is(
  (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.proname in ('buscar_planes', 'buscar_planes_cerca') and p.prosecdef),
  0, 'Las dos búsquedas usan los permisos de quien llama (ninguna es security definer)');

select * from finish();
rollback;
