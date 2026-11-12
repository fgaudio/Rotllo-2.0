-- Tests del cartel del plan (migración 20261112174225_v1_cartel_del_plan).

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- Un plan de prueba en un local verificado del seed, con el cartel personalizado
insert into public.planes (local_id, categoria_id, titulo, empieza_en, estado, cartel)
values ('a0000000-0000-4000-8000-000000000001', (select id from public.categorias where slug = 'fiesta'),
        'C·con cartel', '2030-03-16 23:00 Europe/Madrid', 'publicado',
        '{"estilo": "cinta", "color": "azul", "texto": "Techno hasta las 6"}');
insert into public.planes (local_id, categoria_id, titulo, empieza_en, estado)
values ('a0000000-0000-4000-8000-000000000001', (select id from public.categorias where slug = 'fiesta'),
        'C·sin cartel', '2030-03-16 23:30 Europe/Madrid', 'publicado');

select lives_ok(
  $$ update public.planes set cartel = '{"color": "rosa"}' where titulo = 'C·sin cartel' $$,
  'vale elegir solo una cosa (el resto lo decide la app)');
select lives_ok(
  $$ update public.planes set cartel = null where titulo = 'C·sin cartel' $$,
  'vale quitar el cartel personalizado');

-- Al rehacer la vista no se ha perdido su filtro: los borradores siguen fuera, también para
-- quien se salta las reglas RLS (este test corre como administrador de la base de datos).
insert into public.planes (local_id, categoria_id, titulo, empieza_en, estado)
values ('a0000000-0000-4000-8000-000000000001', (select id from public.categorias where slug = 'fiesta'),
        'C·borrador', '2030-03-16 22:00 Europe/Madrid', 'borrador');
select is((select count(*) from planes_feed where titulo = 'C·borrador')::int, 0, 'un borrador no sale en la vista del feed');

-- Lo que no vale
select throws_ok(
  $$ update public.planes set cartel = '{"estilo": "neon"}' where titulo = 'C·sin cartel' $$,
  '23514', null, 'un estilo que no existe se rechaza');
select throws_ok(
  $$ update public.planes set cartel = '{"color": "fucsia"}' where titulo = 'C·sin cartel' $$,
  '23514', null, 'un color fuera de la lista se rechaza');
select throws_ok(
  $$ update public.planes set cartel = jsonb_build_object('texto', repeat('a', 41)) where titulo = 'C·sin cartel' $$,
  '23514', null, 'un texto de más de 40 letras se rechaza');
select throws_ok(
  $$ update public.planes set cartel = '{"texto": "   "}' where titulo = 'C·sin cartel' $$,
  '23514', null, 'un texto vacío se rechaza');
select throws_ok(
  $$ update public.planes set cartel = '{"texto": 7}' where titulo = 'C·sin cartel' $$,
  '23514', null, 'el texto tiene que ser texto');
select throws_ok(
  $$ update public.planes set cartel = '{"enlace": "https://ejemplo.com"}' where titulo = 'C·sin cartel' $$,
  '23514', null, 'no se admiten datos que la app no conoce');
select throws_ok(
  $$ update public.planes set cartel = '["cinta"]' where titulo = 'C·sin cartel' $$,
  '23514', null, 'tiene que ser un objeto');

-- Lo ve cualquiera en el feed, también sin cuenta
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

select is(
  (select cartel ->> 'texto' from planes_feed where titulo = 'C·con cartel'),
  'Techno hasta las 6', 'la vista del feed enseña el cartel');
select is(
  (select cartel from planes_feed where titulo = 'C·sin cartel'),
  null, 'sin personalizar, el cartel va vacío');
select results_eq(
  $$ select titulo, cartel ->> 'color' from buscar_planes(null, 0, 100, '2030-03-16 20:00 Europe/Madrid') where titulo like 'C·%' order by titulo $$,
  $$ values ('C·con cartel'::text, 'azul'::text), ('C·sin cartel', null) $$,
  'buscar_planes también lo devuelve');

select * from finish();
rollback;
