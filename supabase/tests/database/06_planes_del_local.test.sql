-- Tests de los planes vistos desde el panel del local (crear, editar, publicar, cancelar, borrar
-- y ver los clics). No hay migración nueva: comprueban las reglas que ya existían.

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('ddddddd1-0000-4000-8000-000000000001', 'duena2@example.com', '{"fecha_nacimiento": "1990-01-01"}'),
  ('ddddddd2-0000-4000-8000-000000000002', 'otra@example.com', '{"fecha_nacimiento": "1992-02-02"}'),
  ('ddddddd3-0000-4000-8000-000000000003', 'equipo2@example.com', '{"fecha_nacimiento": "1988-08-08"}');
insert into public.admins_rotllo (user_id) values ('ddddddd3-0000-4000-8000-000000000003');

-- La dueña da de alta su local y el equipo lo aprueba
select set_config('request.jwt.claims', '{"sub": "ddddddd1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
set local role authenticated;
select crear_local('Sala Panel', 'sala-panel', 'discoteca', 'Calle de Sueca 27, Valencia', 39.4620, -0.3754);
select set_config('request.jwt.claims', '{"sub": "ddddddd3-0000-4000-8000-000000000003", "role": "authenticated"}', true);
update locales set estado_verificacion = 'verificado' where slug = 'sala-panel';

-- ── La dueña crea un plan como lo hace la app (sin dirección ni punto: los pone el local) ──
select set_config('request.jwt.claims', '{"sub": "ddddddd1-0000-4000-8000-000000000001", "role": "authenticated"}', true);

select lives_ok(
  $$ insert into planes (local_id, categoria_id, titulo, descripcion, empieza_en, termina_en, es_gratis, precio_desde_centimos,
                         edad_minima, modo_entradas, url_ticketera, cartel)
     select l.id, c.id, 'P·Noche de panel', 'Tres DJ.', '2030-03-16 23:30 Europe/Madrid', '2030-03-17 05:00 Europe/Madrid', false, 1250,
            21, 'enlace_externo', 'https://example.com/entradas', '{"estilo": "cinta", "color": "azul", "texto": "Hasta las 5"}'
     from locales l, categorias c where l.slug = 'sala-panel' and c.slug = 'fiesta' $$,
  'La dueña guarda un plan');
select results_eq(
  $$ select p.estado::text, p.direccion, p.edad_minima::int, p.creado_por
     from planes p where p.titulo = 'P·Noche de panel' $$,
  $$ values ('borrador'::text, 'Calle de Sueca 27, Valencia'::text, 21, 'ddddddd1-0000-4000-8000-000000000001'::uuid) $$,
  'Nace como borrador, con la dirección del local y apuntando quién lo creó');
select throws_ok(
  $$ update planes set modo_entradas = 'enlace_externo', url_ticketera = 'http://sin-https.es' where titulo = 'P·Noche de panel' $$,
  '23514', null, 'El enlace de la ticketera tiene que ser https');
select throws_ok(
  $$ update planes set es_gratis = true where titulo = 'P·Noche de panel' $$,
  '23514', null, 'Un plan gratis no puede llevar precio');

select lives_ok($$ update planes set estado = 'publicado' where titulo = 'P·Noche de panel' $$, 'Con el local verificado, lo publica');
select isnt((select publicado_en from planes where titulo = 'P·Noche de panel'), null, 'Queda apuntado cuándo se publicó');
select lives_ok($$ update planes set titulo = 'P·Noche de panel (editada)' where titulo = 'P·Noche de panel' $$, 'Un plan publicado se puede editar');

-- ── Otra persona con cuenta no puede tocarlo ───────────────────────────────
select set_config('request.jwt.claims', '{"sub": "ddddddd2-0000-4000-8000-000000000002", "role": "authenticated"}', true);
update planes set titulo = 'P·robado' where titulo like 'P·%'; -- no cambia ninguna fila
select is((select count(*) from planes where titulo = 'P·robado')::int, 0, 'Otra persona no puede editar el plan');
delete from planes where titulo like 'P·%'; -- no borra ninguna fila
select is((select count(*) from planes where titulo = 'P·Noche de panel (editada)')::int, 1, 'Ni borrarlo');
select throws_ok(
  $$ insert into planes (local_id, categoria_id, titulo, empieza_en)
     select l.id, c.id, 'P·colado', '2030-03-20 20:00 Europe/Madrid' from locales l, categorias c where l.slug = 'sala-panel' and c.slug = 'fiesta' $$,
  '42501', null, 'Ni crear planes en un local que no es suyo');

-- Alguien sin cuenta toca "Pillar entrada"
reset role;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;
select is(
  (select registrar_clic((select id from planes_feed where titulo = 'P·Noche de panel (editada)'), 'movil-de-prueba-1')),
  'https://example.com/entradas', 'Tocar "Pillar entrada" devuelve el enlace del local');
select is((select count(*) from clics_ticketera)::int, 0, 'Quien no es del local no ve los clics');

-- ── La dueña ve sus clics, borra un borrador y cancela el plan ─────────────
reset role;
select set_config('request.jwt.claims', '{"sub": "ddddddd1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
set local role authenticated;
select is(
  (select count(*) from clics_ticketera c join planes p on p.id = c.plan_id where p.titulo = 'P·Noche de panel (editada)')::int,
  1, 'La dueña ve los clics de su plan');

insert into planes (local_id, categoria_id, titulo, empieza_en)
select l.id, c.id, 'P·borrador', '2030-03-20 20:00 Europe/Madrid' from locales l, categorias c where l.slug = 'sala-panel' and c.slug = 'social';
delete from planes where titulo = 'P·borrador';
select is((select count(*) from planes where titulo = 'P·borrador')::int, 0, 'Un borrador se puede borrar');
delete from planes where titulo = 'P·Noche de panel (editada)'; -- no borra nada
select is((select count(*) from planes where titulo = 'P·Noche de panel (editada)')::int, 1, 'Un plan publicado no se borra: se cancela');

select lives_ok(
  $$ update planes set estado = 'cancelado', motivo_cancelacion = 'Se ha roto el equipo de sonido' where titulo = 'P·Noche de panel (editada)' $$,
  'La dueña cancela el plan');
select isnt((select cancelado_en from planes where titulo = 'P·Noche de panel (editada)'), null, 'Queda apuntado cuándo se canceló');
select throws_ok(
  $$ update planes set estado = 'publicado' where titulo = 'P·Noche de panel (editada)' $$,
  '23514', null, 'Un plan cancelado no se puede volver a publicar');
select throws_ok(
  $$ update planes set titulo = 'P·otra vez' where titulo = 'P·Noche de panel (editada)' $$,
  '23514', null, 'Ni editar');

-- Cancelado: ya no sale en el feed, pero su ficha sigue existiendo para quien lo tenía guardado
reset role;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;
select is(
  (select count(*) from buscar_planes(null, 0, 100, '2030-03-16 20:00 Europe/Madrid') where titulo like 'P·%')::int,
  0, 'Un plan cancelado no sale en el feed');
select is(
  (select estado::text from planes_feed where titulo = 'P·Noche de panel (editada)'),
  'cancelado', 'Pero su ficha se puede abrir y dice que está cancelado');

select * from finish();
rollback;
