# Rotllo

App de planes y actividades en Valencia para gente de 18 años en adelante, con el núcleo entre los 18 y los 35. Los bares, discotecas y sitios de actividades publican sus planes. La gente los descubre en un feed y un mapa, los filtra (hoy, este finde, gratis, cerca de mí, tipo de plan), ve cómo llegar, pilla la entrada en la web del local y comparte el plan en Instagram.

- **Producto, público y reglas de trabajo:** [`CLAUDE.md`](CLAUDE.md)
- **Diseño y decisiones:** [`docs/`](docs/) (índice abajo)
- **Para los locales:** [`docs/guia-locales.md`](docs/guia-locales.md)

## Qué hay hecho (v1)

| Parte | Estado |
|---|---|
| Feed con filtros (hoy, finde, gratis, tipo de plan, cerca de mí) y agenda por días | ✅ |
| Ficha del plan con cartel, «Cómo llegar» (Google Maps o Apple Maps) y «Pillar entrada» | ✅ |
| Búsqueda, guardados y mapa | ✅ (el mapa de verdad, solo en el móvil) |
| Cuentas: entrar con un enlace por email, fecha de nacimiento (+18), borrar la cuenta | ✅ |
| Panel del local: alta, revisión por el equipo, crear y editar planes, cartel y fotos | ✅ |
| Imagen para stories de Instagram | ✅ |
| Probado en un móvil de verdad | ❌ Falta la app de pruebas (ver [`docs/lo-que-tienes-que-hacer.md`](docs/lo-que-tienes-que-hacer.md)) |

Después (v2): «Me apunto», entradas propias con QR, jam (chat y votaciones) y notificaciones.

## Cómo está hecho

- **App:** Expo (React Native + TypeScript) con Expo Router. Una sola base de código para iPhone, Android y web.
- **Servidor:** Supabase (Postgres con PostGIS, Auth, Storage), en la Unión Europea. La seguridad está en las reglas de la base de datos (RLS).
- **Textos:** i18next, en español, inglés e italiano.

El porqué de cada elección está en [`docs/adr/`](docs/adr/).

## Arrancar en tu ordenador

Necesitas [Node.js](https://nodejs.org) 22 o más nuevo.

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea tu archivo de claves a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

   Rellena los valores (siguiente apartado). **El `.env` nunca se sube a git.** Sin `.env`, la app funciona igual con 8 planes de ejemplo.

3. Abre la app en el navegador:

   ```bash
   npm run web
   ```

### Variables de entorno

| Variable | Para qué | Dónde se saca | ¿Secreta? |
|---|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | La dirección del proyecto de Supabase | Supabase → Project Settings → API | No |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | La clave publicable de Supabase | Supabase → Project Settings → API Keys | No: está hecha para ir dentro de la app. Lo que protege los datos son las reglas RLS |
| `GOOGLE_MAPS_ANDROID_API_KEY` | El mapa en Android | Google Cloud → Credenciales, restringida a la app `app.rotllo` | Casi: restríngela |

Todo lo que empieza por `EXPO_PUBLIC_` acaba dentro de la app y cualquiera lo puede leer. **La clave `service_role` (o «secret») de Supabase no va nunca aquí ni en ningún archivo del proyecto.**

### En el móvil

La app usa piezas nativas (mapa, ubicación, fotos), así que no vale Expo Go: hace falta una **development build** (una app de pruebas propia):

```bash
npx eas-cli@latest build --profile development --platform android
```

Con la app de pruebas instalada en el móvil:

```bash
npm start
```

Hay que rehacer la app de pruebas cada vez que cambian `app.config.ts` o los paquetes nativos.

## Comprobaciones y tests

| Qué | Comando |
|---|---|
| Lógica de la app (Jest) | `npm test` |
| Tipos de TypeScript | `npm run typecheck` |
| Estilo del código | `npm run lint` |
| Base de datos: migraciones y reglas RLS (Postgres 16 + PostGIS + pgTAP) | `sudo -u postgres bash scripts/db/probar.sh` |
| Prueba de humo en el navegador (con `EXPO_NO_DOTENV=1 npx expo start --web --port 8081` abierto) | `npm run e2e` |

GitHub las ejecuta todas (menos la de humo) cada vez que se sube un cambio. Más detalles en [`docs/test-plan.md`](docs/test-plan.md).

## Carpetas

```
src/app/         Pantallas y rutas (Expo Router). Cada archivo es una dirección: src/app/p/[id].tsx = rotllo.app/p/123
src/components/  Piezas reutilizables (Boton, Chip, Cartel, FilaPlan…). Un archivo .web.tsx es la versión para navegador
src/lib/         Lógica: conexión con Supabase, sesión, filtros, fechas, mapas, ubicación, fotos… (con sus tests *.test.ts)
src/i18n/        Textos: es.ts (el principal), en.ts, it.ts
src/theme/       Colores, medidas y tipografía. Ningún color ni medida fuera de aquí
supabase/        Migraciones SQL, datos de prueba (seed.sql) y tests de la base de datos
scripts/db/      Probar la base de datos en local
scripts/e2e/     Prueba de humo en el navegador
docs/            Diseño, decisiones (ADR), guías y revisiones
prototipos/      Capturas y previsualizaciones de cada módulo
```

## Documentos

| Documento | De qué va |
|---|---|
| [`docs/lo-que-tienes-que-hacer.md`](docs/lo-que-tienes-que-hacer.md) | Lo que solo puede hacer el dueño del proyecto (cuentas, dominio, pagos) |
| [`docs/checklist-lanzamiento.md`](docs/checklist-lanzamiento.md) | Qué tiene que estar listo antes de abrir Rotllo al público |
| [`docs/runbook.md`](docs/runbook.md) | Qué hacer cuando algo va mal |
| [`docs/guia-locales.md`](docs/guia-locales.md) | Guía para bares y locales, sin jerga |
| [`docs/system-design.md`](docs/system-design.md) | Diseño del sistema completo (v1 y v2) |
| [`docs/adr/`](docs/adr/) | Decisiones técnicas y su porqué |
| [`docs/diseno.md`](docs/diseno.md) | Guía visual «Cartelera» |
| [`docs/login.md`](docs/login.md), [`docs/panel-local.md`](docs/panel-local.md), [`docs/cerca-de-mi.md`](docs/cerca-de-mi.md), [`docs/compartir-instagram.md`](docs/compartir-instagram.md) | Cada módulo: cómo funciona y qué se ha probado |
| [`docs/test-plan.md`](docs/test-plan.md), [`docs/revision-seguridad.md`](docs/revision-seguridad.md), [`docs/revision-cto.md`](docs/revision-cto.md) | Tests y revisiones |
| [`docs/legal-checklist.md`](docs/legal-checklist.md) | Lo legal (RGPD, LSSI, tiendas) |
