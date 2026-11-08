# Supabase

Todo el backend de Rotllo (ADR-002).

```
migrations/                       Cambios de la base de datos, en orden. Cada cambio = un archivo nuevo.
  20261108120000_v1_esquema.sql   Tablas de la v1, reglas RLS, triggers, crear_local, registrar_clic, vistas
  20261108120100_v1_storage.sql   Buckets de fotos (planes, locales, avatares) y quién puede subir
  20261108212249_v1_ajustes_seguridad.sql
                                  Perfil público/privado, funciones de ayuda al esquema `privado`,
                                  índices y reglas sin solapes (avisos del panel de Supabase)
  20261108215008_v1_feed_y_clics.sql
                                  buscar_planes (feed por páginas, "día de noche" en hora de
                                  Valencia), reglas ligeras sin cuenta y 1 clic por persona/hora
seed.sql                          Las 9 categorías + locales y planes de demo (solo desarrollo)
tests/database/                   Tests automáticos de las reglas (pgTAP)
```

## Qué hay en la base de datos (v1)

- **Tablas:** perfiles, perfiles_privados, admins_rotllo, locales, locales_privado, miembros_local, categorias, planes, fotos_plan, favoritos, reportes y clics_ticketera. Son las de `docs/system-design.md`.
- **Perfil en dos tablas:**
  - `perfiles`: lo público (nombre, usuario, foto). Lo ve cualquiera con cuenta.
  - `perfiles_privados`: fecha de nacimiento, idioma y estado. Solo lo ve su dueño.
- **Reglas que se comprueban solas:**
  - Mayores de 18 al registrarse.
  - La fecha de nacimiento se pone una sola vez.
  - Solo Rotllo verifica locales.
  - Solo se publica con el local verificado.
  - Un plan cancelado no se vuelve a publicar.
  - Un local nunca se queda sin propietario.
- **Funciones de ayuda de las reglas** (`es_admin`, `es_miembro_local`...): están en el esquema `privado`, que la API no publica, así que no se pueden llamar desde fuera.
- **Funciones para la app:**
  - `crear_local(...)`: da de alta un local y pone a quien lo crea como propietario. Solo con cuenta.
  - `buscar_planes(filtro, desde, limite)`: el feed, de 30 en 30. Filtros `hoy`, `finde` y `gratis`, en hora de Valencia y con el día de 06:00 a 06:00.
  - `registrar_clic(plan, dispositivo)`: cuenta como mucho 1 clic por persona (o por móvil) y por hora, y devuelve el enlace de la ticketera.
- **Vista** `planes_feed`: lo que pinta el feed y la ficha.

## Probar en local, sin cuenta

```bash
bash scripts/db/probar.sh   # como usuario postgres; necesita Postgres 16 + PostGIS + pgTAP
```

Crea una base de datos que imita a Supabase, aplica las migraciones y el seed y pasa los tests. Ahora mismo son **77 tests**, y todos pasan.

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
7. Si te registraste sin fecha de nacimiento, tu perfil queda "incompleto". Complétalo en el SQL Editor:
   `update perfiles_privados set fecha_nacimiento = 'AAAA-MM-DD' where id = (select id from auth.users where email = 'tu@email');`

## Avisos del panel que quedan (a propósito)

- `registrar_clic` se puede llamar sin cuenta: "Pillar entrada" tiene que funcionar para todos.
- `crear_local` se puede llamar con cuenta: es como un local se da de alta.
- "Leaked password protection": es un interruptor del panel (Authentication > Email).
- "Unused index": sale mientras la base de datos esté vacía.

## Nombres de las migraciones

Si una migración se aplica desde el panel o con un asistente, Supabase le pone su propia hora. Renombra el archivo local con esa misma versión (mira `supabase migration list`) para que `supabase db push` no intente aplicarla otra vez.

## Pendiente

- Programar con `pg_cron` el paso de los planes que ya han pasado a `finalizado`.
- Límite de clics por persona en `registrar_clic`, si alguien abusa.
- Generar los tipos de TypeScript desde la base de datos (`supabase gen types typescript`).
