# Panel del local

Dónde un bar, una discoteca o un sitio de actividades se da de alta y publica sus planes. Se construye en tres rondas.

| Ronda | Qué incluye | Estado |
|---|---|---|
| **1. El local** | Alta, estado de la revisión y la pantalla del equipo para aprobar | Hecha (13 de noviembre de 2026) |
| **2. Los planes** | Crear, editar, publicar y cancelar, con el editor de cartel | Pendiente |
| **3. El flyer** | Subir una foto o un flyer propio como cartel | Pendiente |

## Ronda 1: el local

### Cómo funciona

1. **Perfil → «¿Tienes un local?»**. Hace falta tener la cuenta completa.
2. **Alta** (`/local/nuevo`): nombre, tipo, dirección, barrio, Instagram (opcional) y email de contacto.
3. El local nace **«En revisión»**. Puede preparar planes en borrador, pero no publicarlos (regla de la base de datos).
4. El equipo de Rotllo lo revisa en **Perfil → «Locales por revisar»** (`/admin/locales`): aprobar, o rechazar con un motivo que el local ve.
5. **Mi local** (`/local`) enseña el estado: en revisión, verificado, no aprobado (con su motivo) o suspendido.

### La dirección

El local escribe la calle y el número y toca «Buscar en el mapa». La app pregunta al buscador gratuito de **OpenStreetMap** (Nominatim), solo dentro de Valencia y su área, y cambia lo escrito por la dirección encontrada, con su punto en el mapa y su barrio.

- Se busca **una vez por toque**, sin autocompletar: es lo que piden las normas de uso del buscador.
- Si Rotllo crece, se cambia por un servicio de pago. Todo está en `src/lib/geocodificar.ts`.
- En el móvil se enseña un mapa pequeño para confirmar el punto. En la web, solo el texto.

### Quién es del equipo

La tabla `admins_rotllo`. Hoy está la cuenta de Fran. Esconder la pantalla no es lo que protege los datos: aunque alguien llegue a `/admin/locales`, la base de datos solo deja ver los pendientes y aprobar a quien está en esa tabla.

### Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `src/lib/locales.ts` | Alta, mis locales, y revisar (equipo). Validación del formulario |
| `src/lib/geocodificar.ts` | De la dirección escrita al punto en el mapa |
| `src/app/local/nuevo.tsx` | Formulario de alta |
| `src/app/local/index.tsx` | Mi local |
| `src/app/admin/locales.tsx` | Locales por revisar |
| `supabase/tests/database/05_panel_local.test.sql` | Tests de quién ve y quién aprueba |

No ha hecho falta ninguna migración: las tablas y las reglas ya existían desde el diseño del sistema.

### Probado

- **Tests:** dirección web del local, Instagram, validación del alta y lectura de la respuesta del buscador (app); quién ve un local pendiente, quién puede aprobarlo y que el email de contacto es privado (base de datos).
- **Contra el Supabase real, en el navegador, con una cuenta de prueba:** el alta con una dirección real y con una inventada, los avisos del formulario, el estado «en revisión», el bloqueo de la pantalla del equipo para quien no lo es, aprobar y rechazar con motivo.
- **No probado:** en un iPhone o un Android (el mapa pequeño de confirmación solo existe ahí).

### Fuera de esta ronda

Invitar a más personas al mismo local, cambiar los datos del local después del alta, la página pública del local, el logo y la portada. Un local rechazado todavía no puede corregir y volver a enviar: tiene que escribirnos.
