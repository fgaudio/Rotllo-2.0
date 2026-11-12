# Rotllo

App de planes y actividades en Valencia para gente joven, estudiantes y gente sociable con ganas de salir.

## Público y tono

- **Público:** solo mayores de 18 (edad mínima para tener cuenta), sin límite superior; el núcleo es de 18-35 años. Cada local fija la edad mínima (+18, +21...) y el público al que apunta en sus planes. Móvil primero.
- **Idiomas:** español primero; preparado para inglés e italiano (nada de textos fijos en el código, todo traducible).
- **Tono de marca:** cercano, vivaz, social, valenciano e internacional, friendly, sin vueltas.

## Tipos de usuario

1. **Usuarios:** descubren planes, ven la ubicación y cómo llegar, filtran por tipo de plan, compran entradas (discotecas/boliches), chatean y votan en la "jam".
2. **Locales** (bares, discotecas, lugares de actividades): crean su perfil y publican planes con fecha, hora, tipo, precio y ubicación.

## Funcionalidades

### v1 (primero)
- **Feed y mapa** de planes en Valencia, con filtros: hoy, este finde, tipo de plan, gratis/pago, cerca de mí.
- **Ficha del plan:** fotos, descripción, ubicación y botón "Cómo llegar" (abre Google Maps / Apple Maps).
- **Entradas:** enlace a la ticketera del local.
- **Panel para locales:** crear y editar planes.
- **Promoción en Instagram:** cada plan genera una imagen/enlace para compartir en stories.

### Después (v2 y siguientes)
- **«Me apunto»:** apuntarse a un plan sin pagar; el plan enseña cuántos van y el local ve la lista. Va antes que la venta de entradas (ADR-003).
- **Entradas propias:** compra dentro de la app con QR para mostrar en la puerta; el panel de locales muestra las entradas vendidas.
- **Jam:** chat en tiempo real por plan o por zona, con votaciones (ej. "¿A dónde vamos el viernes?").
- **Notificaciones.**

## Stack

Decidido en la Fase 1. El porqué de cada decisión está en `docs/adr/`.

- **App:** Expo (React Native + TypeScript) con **Expo Router**; development build, no Expo Go. Se compila y se publica con **EAS Build / EAS Submit** (ADR-001).
- **Deep links:** dominio `rotllo.app` (universal links + App Links) y web de respaldo con las mismas rutas de Expo Router (ADR-001).
- **Backend:** **Supabase**, en una región de la UE: Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions y pg_cron. Seguridad con RLS (ADR-002).
- **Entradas:** v1, enlace a la ticketera del local con contador de clics; v2, **Stripe Connect** (cuentas Express). Gastos de gestión con la **tarifa A: 4 % + 1,60 € por entrada**, sacada de la tabla `tarifas_gestion` (ADR-003).
- **Mapa:** `react-native-maps` (Apple Maps en iOS, Google Maps en Android). "Cómo llegar" abre la app de mapas con un enlace (ADR-004).
- **Imágenes:** Supabase Storage, comprimidas en el móvil con `expo-image-manipulator` y mostradas con `expo-image` (ADR-005).
- **Push:** servicio de push de Expo (`expo-notifications`), después de la v1 (ADR-006).
- **Textos:** `i18next` + `react-i18next`, con `es` primero y `en` e `it` preparados.

### Estructura de carpetas

```
src/app/        Pantallas y rutas (Expo Router). Cada archivo es una URL: src/app/p/[id].tsx = rotllo.app/p/123.
src/components/ Componentes reutilizables (Boton, Chip, Cartel, FilaPlan...). Un archivo .web.tsx es la versión para navegador.
src/lib/        Conexiones (supabase.ts), sesión y login (sesion.ts, auth.ts), tipos, formatos, filtros y mapas.
src/i18n/       Textos: es.ts (principal), en.ts, it.ts.
src/theme/      Tokens de diseño (colores, espacios, tipografía). Ningún color o medida fuera de aquí.
supabase/       Migraciones SQL, Edge Functions y datos de prueba.
docs/           Diseño del sistema, ADR, competencia.
```

### Comandos

- `npm start`: arranca el servidor de desarrollo (para la development build).
- `npm run web`: abre la app en el navegador.
- `npm run typecheck`: comprueba los tipos de TypeScript.
- `npm run lint`: revisa el estilo del código.
- `npm test`: tests de la lógica de la app (Jest). Los filtros del feed tienen los mismos casos que los tests de la base de datos.
- Dependencias nativas: `npx expo install <paquete>`. Si la red bloquea a Expo, se usan las versiones de `node_modules/expo/bundledNativeModules.json`.
- Cambios en `app.config.ts` o paquetes nativos: hay que rehacer la development build.
- `bash scripts/db/probar.sh` (como usuario postgres): prueba las migraciones y las reglas RLS en un Postgres local que imita a Supabase. Cualquier cambio en `supabase/` tiene que pasar estos tests.

## Reglas de trabajo para Claude

- **Antes de un cambio grande**, muestra el plan y espera mi OK.
- **Explica las decisiones técnicas en lenguaje simple:** estoy aprendiendo.
- **Cambios pequeños y probados;** un commit por cada cosa que funcione.
- **Nunca guardes claves secretas en el código:** usa variables de entorno (`.env`) y asegúrate de que `.env` está en el `.gitignore`.
- **Documenta** las decisiones de producto y técnicas en `/docs`.
