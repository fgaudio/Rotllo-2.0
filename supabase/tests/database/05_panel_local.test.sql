-- Tests del panel del local y de la revisión por el equipo de Rotllo.
-- No hay migración nueva: comprueban que las reglas que ya existían hacen lo que la app necesita.

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('ccccccc1-0000-4000-8000-000000000001', 'duena@example.com', '{"nombre": "Dueña", "fecha_nacimiento": "1990-01-01"}'),
  ('ccccccc2-0000-4000-8000-000000000002', 'vecino@example.com', '{"nombre": "Vecino", "fecha_nacimiento": "1992-02-02"}'),
  ('ccccccc3-0000-4000-8000-000000000003', 'equipo@example.com', '{"nombre": "Equipo", "fecha_nacimiento": "1988-08-08"}');
insert into public.admins_rotllo (user_id) values ('ccccccc3-0000-4000-8000-000000000003');

-- ── La dueña da de alta su local ────────────────────────────────────────────
select set_config('request.jwt.claims', '{"sub": "ccccccc1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ select crear_local('Bar Panel', 'bar-panel', 'bar', 'Calle de Sueca 27, Valencia', 39.4620, -0.3754,
                        'Ruzafa', 'bar.panel', null, null, 'hola@barpanel.es') $$,
  'Alta del local con barrio, Instagram y email de contacto');
select throws_ok(
  $$ select crear_local('Bar Panel Dos', 'bar-panel', 'bar', 'Otra calle 1, Valencia', 39.47, -0.37) $$,
  '23505', null, 'Dos locales no pueden tener la misma dirección web (la app prueba con otra)');

select results_eq(
  $$ select l.nombre, l.estado_verificacion::text, m.rol::text
     from miembros_local m join locales l on l.id = m.local_id
     where m.user_id = 'ccccccc1-0000-4000-8000-000000000001' $$,
  $$ values ('Bar Panel'::text, 'pendiente'::text, 'propietario'::text) $$,
  'La dueña ve su local (pendiente) y es su propietaria');
select is((select count(*) from admins_rotllo)::int, 0, 'Quien no es del equipo no ve la lista de admins');
select throws_ok(
  $$ update locales set estado_verificacion = 'verificado' where slug = 'bar-panel' $$,
  '42501', null, 'La dueña no puede aprobar su propio local');

-- ── Otra persona no ve nada de un local pendiente ──────────────────────────
select set_config('request.jwt.claims', '{"sub": "ccccccc2-0000-4000-8000-000000000002", "role": "authenticated"}', true);
select is((select count(*) from locales where slug = 'bar-panel')::int, 0, 'Un local pendiente no lo ve otra persona con cuenta');
select is((select count(*) from locales_privado)::int, 0, 'Ni su email de contacto');
select is((select count(*) from locales where estado_verificacion = 'pendiente')::int, 0, 'Quien no es del equipo no puede listar los pendientes');

-- ── El equipo lo revisa ────────────────────────────────────────────────────
select set_config('request.jwt.claims', '{"sub": "ccccccc3-0000-4000-8000-000000000003", "role": "authenticated"}', true);
select is((select count(*) from admins_rotllo where user_id = 'ccccccc3-0000-4000-8000-000000000003')::int, 1, 'Un admin sabe que lo es');
select results_eq(
  $$ select l.nombre, p.email_contacto from locales l join locales_privado p on p.local_id = l.id
     where l.estado_verificacion = 'pendiente' and l.slug = 'bar-panel' $$,
  $$ values ('Bar Panel'::text, 'hola@barpanel.es'::text) $$,
  'El equipo ve los locales pendientes con su email de contacto');
select lives_ok(
  $$ update locales set estado_verificacion = 'rechazado', motivo_rechazo = 'Falta el número de la calle' where slug = 'bar-panel' $$,
  'El equipo rechaza el local con un motivo');

-- La dueña ve el motivo
select set_config('request.jwt.claims', '{"sub": "ccccccc1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
select is((select motivo_rechazo from locales where slug = 'bar-panel'), 'Falta el número de la calle', 'La dueña ve por qué no se aprobó');

-- El equipo lo aprueba después
select set_config('request.jwt.claims', '{"sub": "ccccccc3-0000-4000-8000-000000000003", "role": "authenticated"}', true);
select lives_ok(
  $$ update locales set estado_verificacion = 'verificado', motivo_rechazo = null where slug = 'bar-panel' $$,
  'El equipo aprueba el local');
select is((select verificado_por from locales where slug = 'bar-panel'), 'ccccccc3-0000-4000-8000-000000000003'::uuid, 'Queda apuntado quién lo aprobó');

-- Ya verificado, lo ve cualquiera
select set_config('request.jwt.claims', '{"sub": "ccccccc2-0000-4000-8000-000000000002", "role": "authenticated"}', true);
select is((select count(*) from locales where slug = 'bar-panel')::int, 1, 'Un local verificado lo ve cualquiera');
select is((select count(*) from locales_privado)::int, 0, 'Pero su email de contacto sigue siendo privado');

select * from finish();
rollback;
