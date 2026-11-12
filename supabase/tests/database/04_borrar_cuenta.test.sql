-- Tests de borrar la propia cuenta (migración 20261112174915_v1_borrar_mi_cuenta)
-- y de los guardados, que es lo que usa la app al iniciar sesión.

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaa1-0000-4000-8000-000000000001', 'eva@example.com', '{"nombre": "Eva", "fecha_nacimiento": "1996-06-06"}'),
  ('aaaaaaa2-0000-4000-8000-000000000002', 'leo@example.com', '{"nombre": "Leo", "fecha_nacimiento": "1998-08-08"}'),
  ('aaaaaaa3-0000-4000-8000-000000000003', 'nil@example.com', '{"nombre": "Nil"}');

-- Un plan publicado de un local verificado del seed, para guardarlo
insert into public.planes (id, local_id, categoria_id, titulo, empieza_en, estado)
values ('bbbbbbb1-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
        (select id from public.categorias where slug = 'fiesta'), 'B·plan', '2030-03-16 23:00 Europe/Madrid', 'publicado');

-- ── 1. Guardados ────────────────────────────────────────────────────────────

-- Eva (perfil activo) guarda un plan
select set_config('request.jwt.claims', '{"sub": "aaaaaaa1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
set local role authenticated;

select lives_ok(
  $$ insert into favoritos (user_id, plan_id) values ('aaaaaaa1-0000-4000-8000-000000000001', 'bbbbbbb1-0000-4000-8000-000000000001') $$,
  'Con el perfil activo se puede guardar un plan');
select throws_ok(
  $$ insert into favoritos (user_id, plan_id) values ('aaaaaaa2-0000-4000-8000-000000000002', 'bbbbbbb1-0000-4000-8000-000000000001') $$,
  '42501', null, 'No se puede guardar un plan en nombre de otra persona');

-- Leo no ve los guardados de Eva
select set_config('request.jwt.claims', '{"sub": "aaaaaaa2-0000-4000-8000-000000000002", "role": "authenticated"}', true);
select is((select count(*) from favoritos)::int, 0, 'Nadie ve los guardados de otra persona');

-- Nil (sin fecha de nacimiento) todavía no puede guardar
select set_config('request.jwt.claims', '{"sub": "aaaaaaa3-0000-4000-8000-000000000003", "role": "authenticated"}', true);
select throws_ok(
  $$ insert into favoritos (user_id, plan_id) values ('aaaaaaa3-0000-4000-8000-000000000003', 'bbbbbbb1-0000-4000-8000-000000000001') $$,
  '42501', null, 'Con el perfil incompleto no se guarda en la cuenta');

-- ── 2. Borrar la cuenta ─────────────────────────────────────────────────────

-- Sin sesión no se puede llamar
reset role;
select set_config('request.jwt.claims', '{"role": "anon"}', true);
set local role anon;
select throws_ok($$ select borrar_mi_cuenta() $$, '42501', null, 'Sin sesión no se puede borrar ninguna cuenta');

-- Eva da de alta un local: es su única propietaria
reset role;
select set_config('request.jwt.claims', '{"sub": "aaaaaaa1-0000-4000-8000-000000000001", "role": "authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$ select crear_local('Bar de Eva', 'bar-de-eva', 'bar', 'Calle Falsa 2, Valencia', 39.47, -0.37) $$,
  'Eva da de alta un local');
select throws_ok($$ select borrar_mi_cuenta() $$, 'RT001', null,
  'La única propietaria de un local no puede borrar su cuenta');

-- Leo borra la suya. No recibe ningún id: solo puede ser la suya.
select set_config('request.jwt.claims', '{"sub": "aaaaaaa2-0000-4000-8000-000000000002", "role": "authenticated"}', true);
select lives_ok($$ select borrar_mi_cuenta() $$, 'Leo borra su cuenta');

reset role;
select is((select count(*) from auth.users where id = 'aaaaaaa2-0000-4000-8000-000000000002')::int, 0, 'La cuenta de Leo ya no existe');
select is((select count(*) from public.perfiles where id = 'aaaaaaa2-0000-4000-8000-000000000002')::int, 0, 'Ni su perfil público');
select is((select count(*) from public.perfiles_privados where id = 'aaaaaaa2-0000-4000-8000-000000000002')::int, 0, 'Ni su perfil privado');
select is((select count(*) from auth.users where id = 'aaaaaaa1-0000-4000-8000-000000000001')::int, 1, 'La cuenta de Eva sigue ahí');
select is((select count(*) from public.favoritos where user_id = 'aaaaaaa1-0000-4000-8000-000000000001')::int, 1, 'Y sus guardados también');

-- Nil, con el perfil a medias (por ejemplo, un menor que no llegó a entrar), también puede borrarla
select set_config('request.jwt.claims', '{"sub": "aaaaaaa3-0000-4000-8000-000000000003", "role": "authenticated"}', true);
set local role authenticated;
select lives_ok($$ select borrar_mi_cuenta() $$, 'Una cuenta con el perfil incompleto se puede borrar');
reset role;
select is((select count(*) from auth.users where id = 'aaaaaaa3-0000-4000-8000-000000000003')::int, 0, 'La cuenta de Nil ya no existe');

-- Los guardados se van con la cuenta
insert into auth.users (id, email, raw_user_meta_data) values
  ('aaaaaaa4-0000-4000-8000-000000000004', 'pau@example.com', '{"fecha_nacimiento": "1997-07-07"}');
insert into public.favoritos (user_id, plan_id) values ('aaaaaaa4-0000-4000-8000-000000000004', 'bbbbbbb1-0000-4000-8000-000000000001');
select set_config('request.jwt.claims', '{"sub": "aaaaaaa4-0000-4000-8000-000000000004", "role": "authenticated"}', true);
set local role authenticated;
select lives_ok($$ select borrar_mi_cuenta() $$, 'Pau borra su cuenta');
reset role;
select is((select count(*) from public.favoritos where user_id = 'aaaaaaa4-0000-4000-8000-000000000004')::int, 0, 'Sus guardados se borran con la cuenta');

select * from finish();
rollback;
