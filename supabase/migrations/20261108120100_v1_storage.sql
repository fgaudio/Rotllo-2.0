-- Rotllo · v1 · Fotos en Supabase Storage (ADR-005)
--
-- Tres "buckets" (carpetas) públicos para leer: cualquiera puede ver una foto con su
-- enlace. Para subir, cambiar o borrar, hay reglas:
--   planes/{plan_id}/...    solo quien puede editar ese plan
--   locales/{local_id}/...  solo propietarios y editores de ese local
--   avatares/{user_id}/...  solo la propia persona
-- Límite de 10 MB por archivo y solo imágenes. Las fotos ya llegan comprimidas desde
-- el móvil (1600 px y 600 px), así que normalmente pesan menos de 300 KB.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('planes', 'planes', true, 10485760, array['image/webp', 'image/jpeg', 'image/png']),
  ('locales', 'locales', true, 10485760, array['image/webp', 'image/jpeg', 'image/png']),
  ('avatares', 'avatares', true, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Convierte la primera carpeta de la ruta en un uuid (o null si no lo es).
create function public.primera_carpeta_uuid(p_nombre text) returns uuid
language sql stable set search_path = public as $$
  select case
    when (storage.foldername(p_nombre))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then ((storage.foldername(p_nombre))[1])::uuid
  end
$$;

create function public.puede_subir_foto(p_bucket text, p_nombre text) returns boolean
language sql stable security definer set search_path = public as $$
  select case p_bucket
    when 'planes' then public.puede_editar_plan(public.primera_carpeta_uuid(p_nombre))
    when 'locales' then
      public.es_admin()
      or public.es_miembro_local(
        public.primera_carpeta_uuid(p_nombre), array['propietario', 'editor']::public.rol_local[]
      )
    when 'avatares' then public.primera_carpeta_uuid(p_nombre) = (select auth.uid())
    else false
  end
$$;

create policy "fotos rotllo: ver" on storage.objects for select
  using (bucket_id in ('planes', 'locales', 'avatares'));

create policy "fotos rotllo: subir" on storage.objects for insert
  with check (bucket_id in ('planes', 'locales', 'avatares') and public.puede_subir_foto(bucket_id, name));

create policy "fotos rotllo: cambiar" on storage.objects for update
  using (bucket_id in ('planes', 'locales', 'avatares') and public.puede_subir_foto(bucket_id, name))
  with check (bucket_id in ('planes', 'locales', 'avatares') and public.puede_subir_foto(bucket_id, name));

create policy "fotos rotllo: borrar" on storage.objects for delete
  using (bucket_id in ('planes', 'locales', 'avatares') and public.puede_subir_foto(bucket_id, name));
