-- Tests de las reglas de la v1 (pgTAP). Cada test lleva una frase que explica qué comprueba.
-- Se ejecutan dentro de una transacción que se deshace al final: no dejan datos.
--
-- Para "hacerse pasar" por alguien se usan tres líneas:
--   reset role;                                     -- volver a ser el administrador de la base
--   select set_config('request.jwt.claims', '{"sub": "<id>", "role": "authenticated"}', true);
--   set local role authenticated;                   -- o anon, si es alguien sin cuenta
--
-- Personas de prueba:
--   Ana   11111111-…  dueña de un bar
--   Bea   22222222-…  usuaria normal
--   Gus   33333333-…  se registró con Google (sin fecha de nacimiento)
--   Admin 44444444-…  equipo de Rotllo

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-4111-8111-111111111111', 'ana@example.com', '{"nombre": "Ana", "fecha_nacimiento": "1995-05-05"}'),
  ('22222222-2222-4222-8222-222222222222', 'bea@example.com', '{"nombre": "Bea", "fecha_nacimiento": "1999-01-01"}'),
  ('33333333-3333-4333-8333-333333333333', 'gus@example.com', '{"name": "Gus"}'),
  ('44444444-4444-4444-8444-444444444444', 'admin@example.com', '{"fecha_nacimiento": "1990-01-01"}');
insert into public.admins_rotllo (user_id) values ('44444444-4444-4444-8444-444444444444');

-- ── 1. Registro y perfil ────────────────────────────────────────────────────

select is((select estado::text from perfiles where id = '11111111-1111-4111-8111-111111111111'), 'activo',
  'Registro con fecha de nacimiento: el perfil queda activo');
select is((select nombre_visible from perfiles where id = '11111111-1111-4111-8111-111111111111'), 'Ana',
  'El nombre del registro pasa al perfil');
select is((select estado::text from perfiles where id = '33333333-3333-4333-8333-333333333333'), 'incompleto',
  'Registro sin fecha (por ejemplo, con Google): el perfil queda incompleto');
select throws_ok(
  $$ insert into auth.users (id, email, raw_user_meta_data)
     values ('55555555-5555-4555-8555-555555555555', 'menor@example.com', '{"fecha_nacimiento": "2015-01-01"}') $$,
  '23514', 'Rotllo es para mayores de 18 años',
  'Un menor de 18 no puede registrarse');

-- Gus completa su perfil
select set_config('request.jwt.claims', '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated"}', true);
set local role authenticated;

select throws_ok(
  $$ select crear_local('Bar de Gus', 'bar-de-gus', 'bar', 'Calle Falsa 1, Valencia', 39.47, -0.37) $$,
  '42501', null,
  'Con el perfil incompleto no se puede dar de alta un local');
select throws_ok(
  $$ update perfiles set fecha_nacimiento = '2012-01-01' where id = '33333333-3333-4333-8333-333333333333' $$,
  '23514', null,
  'No se puede poner una fecha de nacimiento de menor');
select throws_ok(
  $$ update perfiles set estado = 'activo' where id = '33333333-3333-4333-8333-333333333333' $$,
  '42501', null,
  'Nadie puede activar su propio perfil a mano');
select lives_ok(
  $$ update perfiles set fecha_nacimiento = '2000-02-02' where id = '33333333-3333-4333-8333-333333333333' $$,
  'Gus pone su fecha de nacimiento (mayor de edad)');
select is((select estado::text from perfiles where id = '33333333-3333-4333-8333-333333333333'), 'activo',
  'Con una fecha válida, el perfil pasa solo a activo');
select throws_ok(
  $$ update perfiles set fecha_nacimiento = '2001-02-02' where id = '33333333-3333-4333-8333-333333333333' $$,
  '42501', null,
  'La fecha de nacimiento solo se pone una vez');

-- Privacidad del perfil
reset role;
select set_config('request.jwt.claims', '{"sub": "22222222-2222-4222-8222-222222222222", "role": "authenticated"}', true);
set local role authenticated;

select is((select count(*) from perfiles where id = '11111111-1111-4111-8111-111111111111')::int, 0,
  'Bea no puede ver el perfil privado de Ana (ni su fecha de nacimiento)');
select is((select nombre_visible from perfiles_publicos where id = '11111111-1111-4111-8111-111111111111'), 'Ana',
  'Pero sí su perfil público');

-- ── 2. Alta y verificación de un local ──────────────────────────────────────

reset role;
select set_config('request.jwt.claims', '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ select crear_local('Bar de Ana', 'bar-de-ana', 'bar', 'Carrer de Cuba 10, Valencia', 39.4620, -0.3740,
                        'Russafa', '@bardeana', 'Ana Bar SL', 'B12345678', 'ana@example.com', 21) $$,
  'Ana da de alta su local');
select is((select estado_verificacion::text from locales where slug = 'bar-de-ana'), 'pendiente',
  'El local nace pendiente de verificar');
select is(
  (select m.rol::text from miembros_local m join locales l on l.id = m.local_id
   where l.slug = 'bar-de-ana' and m.user_id = '11111111-1111-4111-8111-111111111111'),
  'propietario',
  'Ana queda como propietaria');
select is((select nif from locales_privado lp join locales l on l.id = lp.local_id where l.slug = 'bar-de-ana'), 'B12345678',
  'Ana ve los datos privados de su local');
select throws_ok(
  $$ update locales set estado_verificacion = 'verificado' where slug = 'bar-de-ana' $$,
  '42501', null,
  'Ana no puede verificar su propio local');
select lives_ok(
  $$ insert into planes (local_id, categoria_id, titulo, empieza_en)
     select l.id, c.id, 'Concierto acústico', now() + interval '3 days'
     from locales l, categorias c where l.slug = 'bar-de-ana' and c.slug = 'musica-en-directo' $$,
  'Con el local pendiente, Ana ya puede preparar un plan en borrador');
select is((select edad_minima from planes where titulo = 'Concierto acústico'), 21::smallint,
  'El plan hereda la edad mínima del local (+21)');
select is((select direccion from planes where titulo = 'Concierto acústico'), 'Carrer de Cuba 10, Valencia',
  'Y también su dirección');
select throws_ok(
  $$ update planes set estado = 'publicado' where titulo = 'Concierto acústico' $$,
  '23514', 'El local tiene que estar verificado para publicar',
  'Pero no puede publicarlo mientras el local esté pendiente');
select throws_ok(
  $$ insert into planes (local_id, categoria_id, titulo, empieza_en, edad_minima)
     select l.id, c.id, 'Plan para menores', now() + interval '1 day', 16
     from locales l, categorias c where l.slug = 'bar-de-ana' and c.slug = 'fiesta' $$,
  '23514', null,
  'Ningún plan puede tener una edad mínima por debajo de 18');

-- Lo que ve alguien sin cuenta
reset role;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

select is((select count(*) from locales where slug = 'bar-de-ana')::int, 0,
  'Sin cuenta no se ve un local pendiente');
select is((select count(*) from planes where titulo = 'Concierto acústico')::int, 0,
  'Ni sus planes');
select is((select count(*) from planes_feed)::int, 4,
  'Sin cuenta se ven los 4 planes de demo en el feed');
select is((select count(*) from locales_privado)::int, 0,
  'Sin cuenta no se ve ningún dato privado de locales');

-- El admin verifica
reset role;
select set_config('request.jwt.claims', '{"sub": "44444444-4444-4444-8444-444444444444", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ update locales set estado_verificacion = 'verificado' where slug = 'bar-de-ana' $$,
  'Un admin de Rotllo verifica el local');
select is((select verificado_por from locales where slug = 'bar-de-ana'), '44444444-4444-4444-8444-444444444444'::uuid,
  'Queda apuntado qué admin lo verificó');

-- Ana publica
reset role;
select set_config('request.jwt.claims', '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ update planes set estado = 'publicado' where titulo = 'Concierto acústico' $$,
  'Con el local verificado, Ana publica su plan');
select isnt((select publicado_en from planes where titulo = 'Concierto acústico'), null,
  'Se guarda cuándo se publicó');
select lives_ok(
  $$ insert into storage.objects (bucket_id, name)
     select 'planes', id::text || '/portada-1600.webp' from planes where titulo = 'Concierto acústico' $$,
  'Ana sube una foto a su plan');
select throws_ok(
  $$ delete from miembros_local where user_id = '11111111-1111-4111-8111-111111111111' $$,
  '23514', null,
  'El local no se puede quedar sin propietario');

-- ── 3. Una usuaria normal ───────────────────────────────────────────────────

reset role;
select set_config('request.jwt.claims', '{"sub": "22222222-2222-4222-8222-222222222222", "role": "authenticated"}', true);
set local role authenticated;

select is((select count(*) from planes_feed where titulo = 'Concierto acústico')::int, 1,
  'Ya publicado, Bea ve el plan de Ana en el feed');
update planes set titulo = 'Plan cambiado por Bea' where titulo = 'Concierto acústico';
select is((select count(*) from locales_privado)::int, 0,
  'Bea no ve los datos privados del local de Ana');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     select 'planes', id::text || '/intrusa.webp' from planes where titulo = 'Concierto acústico' $$,
  '42501', null,
  'Bea no puede subir fotos a un plan de Ana');
select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('avatares', '22222222-2222-4222-8222-222222222222/300.webp') $$,
  'Bea sube su avatar');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('avatares', '11111111-1111-4111-8111-111111111111/300.webp') $$,
  '42501', null,
  'Pero no el de otra persona');
select lives_ok(
  $$ insert into favoritos (user_id, plan_id)
     select '22222222-2222-4222-8222-222222222222', id from planes where titulo = 'Concierto acústico' $$,
  'Bea guarda el plan en favoritos');
select throws_ok(
  $$ insert into favoritos (user_id, plan_id)
     select '11111111-1111-4111-8111-111111111111', id from planes where titulo = 'Noche de salsa' $$,
  '42501', null,
  'Bea no puede guardar favoritos a nombre de otra persona');
select is(
  (select registrar_clic(id) from planes where titulo = 'Noche de salsa'),
  'https://example.com/entradas/salsa',
  '"Pillar entrada" devuelve el enlace de la ticketera');
select is((select count(*) from clics_ticketera)::int, 0,
  'Bea no ve los clics: son información del local');
select lives_ok(
  $$ insert into reportes (reportado_por, tipo_objetivo, objetivo_id, motivo)
     select '22222222-2222-4222-8222-222222222222', 'plan', id, 'spam' from planes where titulo = 'Techno en la Marina' $$,
  'Bea puede reportar un plan');
select throws_ok(
  $$ insert into reportes (reportado_por, tipo_objetivo, objetivo_id, motivo)
     select '22222222-2222-4222-8222-222222222222', 'plan', id, 'spam' from planes where titulo = 'Techno en la Marina' $$,
  '23505', null,
  'Pero no puede reportar dos veces lo mismo');

-- Sin cuenta
reset role;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;

select is((select registrar_clic('b0000000-0000-4000-8000-000000000001')), 'https://example.com/entradas/salsa',
  'Sin cuenta también se puede pillar entrada');
select is((select registrar_clic(id) from planes where titulo = 'Concierto acústico'), null,
  'Un plan sin ticketera no devuelve enlace (ni cuenta clic)');
select throws_ok(
  $$ insert into favoritos (user_id, plan_id) values ('11111111-1111-4111-8111-111111111111', 'b0000000-0000-4000-8000-000000000001') $$,
  '42501', null,
  'Sin cuenta no se guardan favoritos');

-- El admin ve los clics
reset role;
select set_config('request.jwt.claims', '{"sub": "44444444-4444-4444-8444-444444444444", "role": "authenticated"}', true);
set local role authenticated;

select is((select count(*) from clics_ticketera)::int, 2,
  'El admin ve los 2 clics registrados');

-- ── 4. Cancelar un plan ─────────────────────────────────────────────────────

reset role;
select set_config('request.jwt.claims', '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ update planes set estado = 'cancelado', motivo_cancelacion = 'Lluvia' where titulo = 'Concierto acústico' $$,
  'Ana cancela su plan');
select isnt((select cancelado_en from planes where titulo = 'Concierto acústico'), null,
  'Se guarda cuándo se canceló');
select throws_ok(
  $$ update planes set estado = 'publicado' where titulo = 'Concierto acústico' $$,
  '23514', null,
  'Un plan cancelado no se puede volver a publicar');

-- Comprobación final, como administrador de la base
reset role;
select is((select count(*) from planes where titulo = 'Plan cambiado por Bea')::int, 0,
  'Bea no consiguió cambiar el título del plan de Ana');

select * from finish();
rollback;
