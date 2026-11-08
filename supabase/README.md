# Supabase

Todo el backend de Rotllo (ADR-002).

```
migrations/                       Cambios de la base de datos, en orden. Cada cambio = un archivo nuevo.
  20261108120000_v1_esquema.sql   Tablas de la v1, reglas RLS, triggers, crear_local, registrar_clic, vistas
  20261108120100_v1_storage.sql   Buckets de fotos (planes, locales, avatares) y quién puede subir
seed.sql                          Las 9 categorías + locales y planes de demo (solo desarrollo)
tests/database/                   Tests automáticos de las reglas (pgTAP)
```

## Qué hay en la base de datos (v1)

- **Tablas:** perfiles, admins_rotllo, locales, locales_privado, miembros_local, categorias, planes, fotos_plan, favoritos, reportes y clics_ticketera. Son las de `docs/system-design.md`.
- **Reglas que se comprueban solas:**
  - Mayores de 18 al registrarse.
  - La fecha de nacimiento se pone una sola vez.
  - Solo Rotllo verifica locales.
  - Solo se publica con el local verificado.
  - Un plan cancelado no se vuelve a publicar.
  - Un local nunca se queda sin propietario.
- **Funciones para la app:**
  - `crear_local(...)`: da de alta un local y pone a quien lo crea como propietario.
  - `registrar_clic(plan)`: cuenta el clic y devuelve el enlace de la ticketera.
- **Vistas:**
  - `planes_feed`: lo que pinta el feed y la ficha.
  - `perfiles_publicos`: lo que se ve de otra persona.

## Probar en local, sin cuenta

```bash
bash scripts/db/probar.sh   # como usuario postgres; necesita Postgres 16 + PostGIS + pgTAP
```

Crea una base de datos que imita a Supabase, aplica las migraciones y el seed y pasa los tests. Ahora mismo son **51 tests**, y todos pasan.

Con Docker y la CLI de Supabase, lo mismo se hace con `supabase start`, `supabase db reset` y `supabase test db`.

## Ponerlo en marcha en Supabase (lo haces tú, una vez)

1. Crea el proyecto en [supabase.com](https://supabase.com): región **UE** (Frankfurt o París), plan **Pro** cuando lancemos (el gratis vale para probar).
2. En **Authentication > Providers**, activa Email (y más adelante Google y Apple).
3. Instala la CLI de Supabase y, desde la carpeta del proyecto:
   ```bash
   supabase login
   supabase init           # solo la primera vez: crea supabase/config.toml
   supabase link --project-ref <id-del-proyecto>
   supabase db push        # sube las migraciones
   ```
4. Carga las categorías: en el **SQL Editor**, pega la primera parte de `seed.sql` (la de `categorias`). Los locales y planes de demo son solo para desarrollo.
5. Copia la **URL** y la **anon key** (Project Settings > API) a tu `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<id>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   La **service_role key** no va nunca en la app ni en git.
6. Hazte admin de Rotllo: regístrate en la app y, en el SQL Editor, ejecuta
   `insert into admins_rotllo (user_id) select id from auth.users where email = 'tu@email';`

## Pendiente

- Programar con `pg_cron` el paso de los planes que ya han pasado a `finalizado`.
- Límite de clics por persona en `registrar_clic`, si alguien abusa.
- Generar los tipos de TypeScript desde la base de datos (`supabase gen types typescript`).
