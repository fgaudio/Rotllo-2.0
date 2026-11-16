-- Tests de la revisión de seguridad de la Fase 3 (docs/revision-seguridad.md).
-- Cada uno intenta lo que haría alguien con mala intención y comprueba que no puede.

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('5eeeeee1-0000-4000-8000-000000000001', 'mala@example.com', '{"fecha_nacimiento": "1990-01-01"}'),
  ('5eeeeee2-0000-4000-8000-000000000002', 'victima@example.com', '{"fecha_nacimiento": "1992-02-02"}'),
  ('5eeeeee3-0000-4000-8000-000000000003', 'equipo@example.com', '{"fecha_nacimiento": "1988-08-08"}');
insert into public.admins_rotllo (user_id) values ('5eeeeee3-0000-4000-8000-000000000003');

select set_config('request.jwt.claims', '{"sub": "5eeeeee1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
set local role authenticated;
select crear_local('Bar Malo', 'bar-malo', 'bar', 'Calle de Sueca 1, Valencia', 39.47, -0.37) is not null as creado;

-- S1 ──────────────────────────────────────────────────────────────────────────
select throws_ok(
  $$ insert into miembros_local (local_id, user_id, rol)
     select id, '5eeeeee2-0000-4000-8000-000000000002', 'propietario' from locales where slug = 'bar-malo' $$,
  '42501', null, 'S1 · La dueña no puede meter a otra persona en su local sin pasar por el equipo');

-- S6 ──────────────────────────────────────────────────────────────────────────
select lives_ok($$ select crear_local('Bar Malo 2', 'bar-malo-2', 'bar', 'Calle 2, Valencia', 39.47, -0.37) $$, 'S6 · Un segundo local, sí');
select lives_ok($$ select crear_local('Bar Malo 3', 'bar-malo-3', 'bar', 'Calle 3, Valencia', 39.47, -0.37) $$, 'S6 · Un tercero, también');
select throws_ok($$ select crear_local('Bar Malo 4', 'bar-malo-4', 'bar', 'Calle 4, Valencia', 39.47, -0.37) $$,
  'RT003', null, 'S6 · El cuarto local esperando revisión, no');

-- S7 ──────────────────────────────────────────────────────────────────────────
insert into planes (id, local_id, categoria_id, titulo, empieza_en, creado_por)
select '5ddddddd-0000-4000-8000-000000000001', l.id, c.id, 'Plan de Mala', now() + interval '1 day', '5eeeeee2-0000-4000-8000-000000000002'
from locales l, categorias c where l.slug = 'bar-malo' and c.slug = 'fiesta';
select is((select creado_por from planes where id = '5ddddddd-0000-4000-8000-000000000001'), '5eeeeee1-0000-4000-8000-000000000001'::uuid,
  'S7 · Un plan nuevo lo firma quien lo crea, aunque diga otra cosa');
update planes set creado_por = '5eeeeee2-0000-4000-8000-000000000002' where id = '5ddddddd-0000-4000-8000-000000000001';
select is((select creado_por from planes where id = '5ddddddd-0000-4000-8000-000000000001'), '5eeeeee1-0000-4000-8000-000000000001'::uuid,
  'S7 · La firma de un plan no se cambia');

-- S8 ──────────────────────────────────────────────────────────────────────────
select throws_ok(
  $$ insert into fotos_plan (plan_id, storage_path, orden) values ('5ddddddd-0000-4000-8000-000000000001', '../avatares/otra/foto.webp', 0) $$,
  '23514', null, 'S8 · Una foto no puede apuntar fuera de la carpeta del plan');
select throws_ok(
  $$ insert into fotos_plan (plan_id, storage_path, orden) values ('5ddddddd-0000-4000-8000-000000000001', 'https://sitio-malo.example/pixel.png', 0) $$,
  '23514', null, 'S8 · Ni a otra web');
select throws_ok(
  $$ insert into fotos_plan (plan_id, storage_path, orden) values ('5ddddddd-0000-4000-8000-000000000001', '5ddddddd-0000-4000-8000-000000000001/../x.jpg', 0) $$,
  '23514', null, 'S8 · Ni salir de la carpeta con ..');
select lives_ok(
  $$ insert into fotos_plan (plan_id, storage_path, orden) values ('5ddddddd-0000-4000-8000-000000000001', '5ddddddd-0000-4000-8000-000000000001/mhz3k2-1a2b3c.jpg', 0) $$,
  'S8 · Una foto como las que sube la app, sí');

-- S9 ──────────────────────────────────────────────────────────────────────────
select throws_ok(
  $$ update planes set url_ticketera = 'javascript:alert(1)' where id = '5ddddddd-0000-4000-8000-000000000001' $$,
  '23514', null, 'S9 · Un enlace de entradas que no es https no se guarda, ni con el modo «sin entradas»');
select lives_ok(
  $$ update planes set url_ticketera = 'https://entradas.example.com/fiesta' where id = '5ddddddd-0000-4000-8000-000000000001' $$,
  'S9 · Uno https, sí');

-- S4 ──────────────────────────────────────────────────────────────────────────
insert into reportes (reportado_por, tipo_objetivo, objetivo_id, motivo, estado, revisado_por, revisado_en, resolucion)
values ('5eeeeee1-0000-4000-8000-000000000001', 'plan', 'b0000000-0000-4000-8000-000000000001', 'spam',
        'pendiente', '5eeeeee3-0000-4000-8000-000000000003', now(), 'resuelto por mí');
select results_eq(
  $$ select revisado_por, revisado_en, resolucion from reportes where reportado_por = '5eeeeee1-0000-4000-8000-000000000001' $$,
  $$ values (null::uuid, null::timestamptz, null::text) $$,
  'S4 · Quien reporta no puede dejar la revisión rellenada');
insert into reportes (reportado_por, tipo_objetivo, objetivo_id, motivo)
select '5eeeeee1-0000-4000-8000-000000000001', 'plan', gen_random_uuid(), 'spam' from generate_series(1, 19);
select throws_ok(
  $$ insert into reportes (reportado_por, tipo_objetivo, objetivo_id, motivo) values ('5eeeeee1-0000-4000-8000-000000000001', 'plan', gen_random_uuid(), 'spam') $$,
  'RT002', null, 'S4 · El reporte número 21 del día no entra');

-- S2 ──────────────────────────────────────────────────────────────────────────
select set_config('request.jwt.claims', '{"sub": "5eeeeee3-0000-4000-8000-000000000003", "role": "authenticated"}', true);
update locales set estado_verificacion = 'verificado' where slug = 'bar-malo';
select lives_ok($$ update locales set nombre = 'Bar Malo (bien escrito)' where slug = 'bar-malo' $$,
  'S2 · El equipo sí puede corregir el nombre de un local verificado');
select set_config('request.jwt.claims', '{"sub": "5eeeeee1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
select throws_ok($$ update locales set nombre = 'Café Mercedes Jazz (oficial)' where slug = 'bar-malo' $$,
  '42501', null, 'S2 · La dueña no puede cambiar el nombre de su local verificado');
select throws_ok($$ update locales set slug = 'cafe-mercedes-jazz-oficial' where slug = 'bar-malo' $$,
  '42501', null, 'S2 · Ni su dirección web');
select throws_ok($$ update locales set direccion = 'Calle de Sueca 27, Valencia' where slug = 'bar-malo' $$,
  '42501', null, 'S2 · Ni su dirección');
select lives_ok($$ update locales set instagram = 'bar.malo' where slug = 'bar-malo' $$,
  'S2 · Lo demás (Instagram, descripción...) sí lo puede cambiar');
select lives_ok($$ update locales set nombre = 'Bar Malo 2 (corregido)' where slug = 'bar-malo-2' $$,
  'S2 · Y mientras el local está pendiente, puede corregir el nombre');

-- S5 ──────────────────────────────────────────────────────────────────────────
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
select is(registrar_clic('b0000000-0000-4000-8000-000000000001'), 'https://example.com/entradas/salsa',
  'S5 · Sin cuenta ni identificador del móvil, «Pillar entrada» sigue abriendo la ticketera');
select is(registrar_clic('b0000000-0000-4000-8000-000000000001', '   '), 'https://example.com/entradas/salsa',
  'S5 · Con un identificador vacío, también');
reset role;
select is((select count(*)::int from clics_ticketera where plan_id = 'b0000000-0000-4000-8000-000000000001' and user_id is null and dispositivo is null), 0,
  'S5 · Pero esos clics no cuentan');
set local role anon;
select is(registrar_clic('b0000000-0000-4000-8000-000000000001', 'movil-de-verdad'), 'https://example.com/entradas/salsa', 'S5 · Con identificador, sí abre');
reset role;
select is((select count(*)::int from clics_ticketera where plan_id = 'b0000000-0000-4000-8000-000000000001' and dispositivo = 'movil-de-verdad'), 1,
  'S5 · Y cuenta una vez');

-- S10 ─────────────────────────────────────────────────────────────────────────
insert into auth.users (id, email, raw_user_meta_data) values
  ('5eeeeee4-0000-4000-8000-000000000004', 'clienta@example.com', '{"nombre": "Lucía", "fecha_nacimiento": "1999-02-02"}');
insert into miembros_local (local_id, user_id, rol) values ('a0000000-0000-4000-8000-000000000001', '5eeeeee2-0000-4000-8000-000000000002', 'propietario');
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "5eeeeee4-0000-4000-8000-000000000004", "role": "authenticated"}', true);
select is(registrar_clic('b0000000-0000-4000-8000-000000000001', 'movil-lucia'), 'https://example.com/entradas/salsa', 'S10 · Lucía pulsa «Pillar entrada»');
select set_config('request.jwt.claims', '{"sub": "5eeeeee2-0000-4000-8000-000000000002", "role": "authenticated"}', true);
select is((select count(*)::int from clics_ticketera where plan_id = 'b0000000-0000-4000-8000-000000000001'), 2,
  'S10 · La dueña del local cuenta los clics de su plan');
select throws_ok($$ select user_id from clics_ticketera $$, '42501', null, 'S10 · Pero no puede ver de quién son');
select throws_ok($$ select dispositivo from clics_ticketera $$, '42501', null, 'S10 · Ni el identificador del móvil');
select throws_ok($$ select * from clics_ticketera $$, '42501', null, 'S10 · Ni pedir todas las columnas');
select set_config('request.jwt.claims', '{"sub": "5eeeeee4-0000-4000-8000-000000000004", "role": "authenticated"}', true);
select is((select count(*)::int from clics_ticketera), 0, 'S10 · Quien no es del local no ve ningún clic');
reset role;
set local role anon;
select throws_ok($$ select count(*) from clics_ticketera $$, '42501', null, 'S10 · Sin cuenta, nada');
reset role;

select * from finish();
rollback;
