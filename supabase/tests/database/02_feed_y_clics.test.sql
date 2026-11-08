-- Tests del feed por páginas, el "día de noche" y el límite de clics (migración 20261108215008_v1_feed_y_clics).
-- Usan fechas fijas de marzo de 2030 para que el resultado no dependa de cuándo se ejecutan:
--   jueves 14, viernes 15, sábado 16, domingo 17 y lunes 18 de marzo de 2030.

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Planes de prueba (títulos con "T·") en un local verificado del seed
insert into public.planes (local_id, categoria_id, titulo, empieza_en, es_gratis, estado)
select 'a0000000-0000-4000-8000-000000000001', (select id from public.categorias where slug = 'fiesta'), t.titulo, t.empieza::timestamptz, t.gratis, 'publicado'
from (values
  ('T·jueves noche',        '2030-03-14 22:00 Europe/Madrid', false),
  ('T·viernes madrugada',   '2030-03-16 00:30 Europe/Madrid', false),
  ('T·sábado tarde',        '2030-03-16 20:00 Europe/Madrid', false),
  ('T·domingo madrugada',   '2030-03-18 03:00 Europe/Madrid', false),
  ('T·lunes mañana',        '2030-03-18 10:00 Europe/Madrid', false),
  ('T·lunes gratis',        '2030-03-18 12:00 Europe/Madrid', true)
) as t (titulo, empieza, gratis);
insert into public.planes (local_id, categoria_id, titulo, empieza_en, estado)
values ('a0000000-0000-4000-8000-000000000001', (select id from public.categorias where slug = 'fiesta'),
        'T·borrador', '2030-03-16 01:00 Europe/Madrid', 'borrador');

-- Todo como alguien sin cuenta, que es quien más usa el feed
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

-- Viernes 15 a las 23:30
select results_eq(
  $$ select titulo from buscar_planes('hoy', 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'T·%' $$,
  $$ values ('T·viernes madrugada') $$,
  'Viernes 23:30: "Hoy" incluye la fiesta que empieza a las 00:30 del sábado');
select results_eq(
  $$ select titulo from buscar_planes('finde', 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'T·%' $$,
  $$ values ('T·viernes madrugada'), ('T·sábado tarde'), ('T·domingo madrugada') $$,
  '"Este finde" va del viernes 06:00 al lunes 06:00 (incluye la madrugada del domingo al lunes)');
select results_eq(
  $$ select titulo from buscar_planes('gratis', 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'T·%' $$,
  $$ values ('T·lunes gratis') $$,
  '"Gratis" solo enseña los planes gratis');
select results_eq(
  $$ select titulo from buscar_planes(null, 0, 100, '2030-03-15 23:30 Europe/Madrid') where titulo like 'T·%' $$,
  $$ values ('T·viernes madrugada'), ('T·sábado tarde'), ('T·domingo madrugada'), ('T·lunes mañana'), ('T·lunes gratis') $$,
  'Sin filtro: todo lo que no ha terminado, por orden de fecha (el del jueves ya acabó y el borrador no sale)');

-- Sábado 16 a las 05:30: para la gente, sigue siendo "la noche del viernes"
select results_eq(
  $$ select titulo from buscar_planes('hoy', 0, 100, '2030-03-16 05:30 Europe/Madrid') where titulo like 'T·%' $$,
  $$ values ('T·viernes madrugada') $$,
  'Sábado 05:30: "Hoy" sigue siendo la noche del viernes');
select results_eq(
  $$ select titulo from buscar_planes('hoy', 0, 100, '2030-03-16 07:00 Europe/Madrid') where titulo like 'T·%' $$,
  $$ values ('T·sábado tarde') $$,
  'Sábado 07:00: ya es sábado, y "Hoy" enseña el plan de la tarde');

-- Miércoles 13: "Este finde" es el que viene
select results_eq(
  $$ select titulo from buscar_planes('finde', 0, 100, '2030-03-13 12:00 Europe/Madrid') where titulo like 'T·%' $$,
  $$ values ('T·viernes madrugada'), ('T·sábado tarde'), ('T·domingo madrugada') $$,
  'Un miércoles, "Este finde" es el que viene (el plan del jueves, que acaba el viernes a las 04:00, no cuenta)');

-- Paginación
select is((select count(*)::int from buscar_planes(null, 0, 2, '2030-03-15 23:30 Europe/Madrid') where titulo like 'T·%'), 2,
  'Se piden de 2 en 2: llegan 2');
select results_eq(
  $$ select titulo from buscar_planes(null, 2, 2, '2030-03-15 23:30 Europe/Madrid') where titulo like 'T·%' $$,
  $$ values ('T·domingo madrugada'), ('T·lunes mañana') $$,
  'La segunda página sigue donde acabó la primera');
select is((select count(*)::int from buscar_planes(null, 0, 1000, '2030-03-15 23:30 Europe/Madrid')), 5,
  'Aunque se pidan 1000, llega lo que hay: los 5 de prueba (los de demo son de 2026 y ya terminaron)');

-- ── Clics ────────────────────────────────────────────────────────────────────

select is(registrar_clic('b0000000-0000-4000-8000-000000000001', 'movil-1'), 'https://example.com/entradas/salsa',
  'Sin cuenta, desde un móvil: devuelve el enlace');
select is(registrar_clic('b0000000-0000-4000-8000-000000000001', 'movil-1'), 'https://example.com/entradas/salsa',
  'Pulsar otra vez sigue abriendo la ticketera');
select is(registrar_clic('b0000000-0000-4000-8000-000000000001', 'movil-2'), 'https://example.com/entradas/salsa',
  'Otro móvil también');

reset role;
select is((select count(*)::int from clics_ticketera where plan_id = 'b0000000-0000-4000-8000-000000000001'), 2,
  'Se cuentan 2 clics (uno por móvil), no 3');

insert into auth.users (id, email, raw_user_meta_data)
values ('66666666-6666-4666-8666-666666666666', 'clic@example.com', '{"fecha_nacimiento": "1998-08-08"}');
select set_config('request.jwt.claims', '{"sub": "66666666-6666-4666-8666-666666666666", "role": "authenticated"}', true);
set local role authenticated;
select registrar_clic('b0000000-0000-4000-8000-000000000001', 'movil-3');
select registrar_clic('b0000000-0000-4000-8000-000000000001', 'otro-movil-misma-persona');

reset role;
select is((select count(*)::int from clics_ticketera where plan_id = 'b0000000-0000-4000-8000-000000000001'), 3,
  'Con cuenta cuenta la persona, no el móvil: 1 clic más aunque cambie de móvil');

-- ── Reglas sin cuenta ────────────────────────────────────────────────────────

select is(
  (select count(*)::int from pg_policies
   where schemaname = 'public' and tablename in ('planes', 'locales') and cmd = 'SELECT' and 'anon' = any (roles)),
  2,
  'planes y locales tienen una regla de lectura propia para quien no tiene cuenta');

select * from finish();
rollback;
