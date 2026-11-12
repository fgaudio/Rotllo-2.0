-- Borrar la propia cuenta desde la app.
-- Lo exigen Apple (App Review 5.1.1), Google Play y el derecho de supresión del RGPD.
--
-- Qué pasa al borrar (lo deciden las claves foráneas que ya existen):
--   · Se borran: el perfil público y el privado, los guardados, los reportes hechos por esa
--     persona y su pertenencia a locales.
--   · Se quedan sin autor (no se borran): los planes que creó, los locales que dio de alta y
--     los clics en "Pillar entrada", que pasan a ser anónimos.
--
-- Una persona que es la única propietaria de un local no puede borrar su cuenta: el local se
-- quedaría sin nadie que lo gestione. Antes tiene que pasar el local a otra persona o escribir
-- a soporte. Se avisa con un código propio (RT001) para que la app lo explique bien.

create function public.borrar_mi_cuenta() returns void
language plpgsql security definer set search_path = '' as $$
declare
  yo uuid := (select auth.uid());
begin
  if yo is null then
    raise exception 'Hace falta iniciar sesión' using errcode = 'insufficient_privilege';
  end if;

  if exists (
    select 1
    from public.miembros_local mio
    where mio.user_id = yo
      and mio.rol = 'propietario'
      and not exists (
        select 1 from public.miembros_local otro
        where otro.local_id = mio.local_id and otro.rol = 'propietario' and otro.user_id <> yo
      )
  ) then
    raise exception 'Eres la única persona propietaria de un local' using errcode = 'RT001';
  end if;

  -- Borrar la cuenta de Supabase Auth arrastra todo lo demás (on delete cascade / set null).
  delete from auth.users where id = yo;
end
$$;

comment on function public.borrar_mi_cuenta() is 'Borra la cuenta de quien la llama. No recibe ningún id: nadie puede borrar la cuenta de otra persona.';

revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;
