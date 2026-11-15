-- Tests de la foto o el flyer que un local sube como cartel de su plan.
-- No hay migración nueva: comprueban las reglas de fotos_plan y de la carpeta "planes".

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('eeeeeee1-0000-4000-8000-000000000001', 'duena3@example.com', '{"fecha_nacimiento": "1990-01-01"}'),
  ('eeeeeee2-0000-4000-8000-000000000002', 'otra3@example.com', '{"fecha_nacimiento": "1992-02-02"}');

-- Dos planes publicados de un local verificado del seed; la dueña de prueba entra como editora
insert into public.miembros_local (local_id, user_id, rol) values ('a0000000-0000-4000-8000-000000000001', 'eeeeeee1-0000-4000-8000-000000000001', 'editor');
insert into public.planes (id, local_id, categoria_id, titulo, empieza_en, estado) values
  ('fffffff1-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', (select id from public.categorias where slug = 'fiesta'), 'F·con foto', '2030-03-16 23:00 Europe/Madrid', 'publicado'),
  ('fffffff2-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', (select id from public.categorias where slug = 'fiesta'), 'F·de otro local', '2030-03-16 23:00 Europe/Madrid', 'publicado');

-- ── Quien puede editar el plan sube su foto ────────────────────────────────
select set_config('request.jwt.claims', '{"sub": "eeeeeee1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('planes', 'fffffff1-0000-4000-8000-000000000001/flyer-1.jpg') $$,
  'Sube el archivo a la carpeta de su plan');
select lives_ok(
  $$ insert into fotos_plan (plan_id, storage_path, orden) values ('fffffff1-0000-4000-8000-000000000001', 'fffffff1-0000-4000-8000-000000000001/flyer-1.jpg', 0) $$,
  'Y lo apunta como cartel del plan');
select is(
  (select foto_path from planes_feed where id = 'fffffff1-0000-4000-8000-000000000001'),
  'fffffff1-0000-4000-8000-000000000001/flyer-1.jpg', 'El feed ya devuelve la foto del plan');

-- Cambiar la foto: misma posición (orden 0), archivo nuevo
select lives_ok(
  $$ insert into storage.objects (bucket_id, name) values ('planes', 'fffffff1-0000-4000-8000-000000000001/flyer-2.jpg') $$,
  'Sube otra foto');
select lives_ok(
  $$ insert into fotos_plan (plan_id, storage_path, orden) values ('fffffff1-0000-4000-8000-000000000001', 'fffffff1-0000-4000-8000-000000000001/flyer-2.jpg', 0)
     on conflict (plan_id, orden) do update set storage_path = excluded.storage_path $$,
  'Y sustituye a la anterior');
select is((select count(*) from fotos_plan where plan_id = 'fffffff1-0000-4000-8000-000000000001')::int, 1, 'El plan sigue teniendo una sola foto de cartel');
select is(
  (select foto_path from planes_feed where id = 'fffffff1-0000-4000-8000-000000000001'),
  'fffffff1-0000-4000-8000-000000000001/flyer-2.jpg', 'Y es la nueva');
delete from storage.objects where name = 'fffffff1-0000-4000-8000-000000000001/flyer-1.jpg';
select is((select count(*) from storage.objects where name like 'fffffff1-%')::int, 1, 'Puede borrar el archivo antiguo');

-- ── Lo que no puede ────────────────────────────────────────────────────────
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('planes', 'fffffff2-0000-4000-8000-000000000002/colado.jpg') $$,
  '42501', null, 'No puede subir a la carpeta de un plan de otro local');
select throws_ok(
  $$ insert into fotos_plan (plan_id, storage_path, orden) values ('fffffff2-0000-4000-8000-000000000002', 'fffffff1-0000-4000-8000-000000000001/flyer-2.jpg', 0) $$,
  '42501', null, 'Ni ponerle una foto a un plan de otro local');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('planes', 'suelto.jpg') $$,
  '42501', null, 'Ni subir fuera de la carpeta de un plan');

-- Otra persona con cuenta
select set_config('request.jwt.claims', '{"sub": "eeeeeee2-0000-4000-8000-000000000002", "role": "authenticated"}', true);
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('planes', 'fffffff1-0000-4000-8000-000000000001/pintada.jpg') $$,
  '42501', null, 'Otra persona no puede subir fotos a un plan que no es suyo');
delete from fotos_plan where plan_id = 'fffffff1-0000-4000-8000-000000000001'; -- no borra nada
delete from storage.objects where name like 'fffffff1-%'; -- no borra nada

-- Sin cuenta: ver sí, tocar no
reset role;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;
select is((select count(*) from fotos_plan where plan_id = 'fffffff1-0000-4000-8000-000000000001')::int, 1, 'Nadie más ha podido quitar la foto, y sin cuenta se ve');
select is((select count(*) from storage.objects where name like 'fffffff1-%')::int, 1, 'Ni borrar el archivo');
select throws_ok(
  $$ insert into storage.objects (bucket_id, name) values ('planes', 'fffffff1-0000-4000-8000-000000000001/anonimo.jpg') $$,
  '42501', null, 'Sin cuenta no se puede subir nada');

-- ── La dueña quita la foto: el plan vuelve a su cartel generado ────────────
reset role;
select set_config('request.jwt.claims', '{"sub": "eeeeeee1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
set local role authenticated;
delete from fotos_plan where plan_id = 'fffffff1-0000-4000-8000-000000000001';
select is((select foto_path from planes_feed where id = 'fffffff1-0000-4000-8000-000000000001'), null, 'Sin foto, el feed no devuelve ninguna');

select * from finish();
rollback;
