# Panel del local

Dónde un bar, una discoteca o un sitio de actividades se da de alta y publica sus planes. Se construye en tres rondas.

| Ronda | Qué incluye | Estado |
|---|---|---|
| **1. El local** | Alta, estado de la revisión y la pantalla del equipo para aprobar | Hecha (13 de noviembre de 2026) |
| **2. Los planes** | Crear, editar, publicar y cancelar, con el editor de cartel | Hecha (14 de noviembre de 2026) |
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

## Ronda 2: los planes

### Cómo funciona

1. **Mi local → «Tus planes» → «Crear plan»** (`/local/plan/nuevo`).
2. El formulario tiene cuatro partes:
   - **Lo básico:** título, tipo de plan y de qué va.
   - **Cuándo:** una fila con los próximos 45 días («Hoy», «Mañana», «vie 20»…), la hora de inicio y, si se quiere, la de fin.
   - **Precio y entrada:** gratis o de pago (con el precio «desde»), sin entrada anticipada o con el enlace a su ticketera, y la edad mínima.
   - **El cartel:** estilo, color y texto, con la vista previa cambiando mientras se elige.
3. **Guardar borrador** (solo lo ve el local) o **Publicar** (hace falta el local verificado).
4. Un plan publicado se puede **editar** y **cancelar**; un borrador se puede **borrar**.
5. La lista enseña cada plan con su estado (borrador, publicado, cancelado o terminado) y cuántas veces se ha tocado «Pillar entrada».

### Decisiones

- **La hora se escribe con números** («23:00», «2330» o «23») y siempre es hora de Valencia, tenga el móvil la hora que tenga.
- **Si la hora de fin es anterior a la de inicio**, se entiende que termina al día siguiente (empieza a las 23:00 y termina a las 05:00).
- **Planes de madrugada:** si empieza antes de las 06:00, el formulario avisa de en qué noche saldrá en la app («la 01:00 del jueves sale en la noche del miércoles»).
- **Un plan cancelado no se borra:** deja de salir en el feed, pero su ficha sigue existiendo y dice «Cancelado», para avisar a quien lo había guardado o tiene el enlace. No se puede volver a publicar.
- **El enlace a la ticketera lleva `utm_source=rotllo`** (ADR-003), para que el local vea en sus propias estadísticas la gente que le llega desde Rotllo.
- **El cartel se guarda solo si el local elige algo.** Si lo deja en automático, lo decide la app.

### Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `src/lib/planesLocal.ts` | Leer la hora, el precio y el enlace; validar el formulario; guardar, cancelar y borrar |
| `src/app/local/plan/[id].tsx` | El formulario (crear y editar) |
| `src/components/PlanesDelLocal.tsx` | La lista «Tus planes» |
| `src/components/SelectorColorCartel.tsx` | Los círculos para elegir el color del cartel |
| `supabase/tests/database/06_planes_del_local.test.sql` | Tests de quién puede crear, editar, publicar, cancelar y ver los clics |

Tampoco ha hecho falta ninguna migración.

### Probado

- **Tests:** 136 de la app y 145 de la base de datos, todos pasan.
- **Contra el Supabase real, en el navegador, con la cuenta de prueba** (22 comprobaciones): los avisos del formulario; guardar un borrador y que no se vea fuera; editarlo y que vuelva con sus datos; publicarlo y que salga en el feed y en su ficha con el precio, el +21 y el cartel elegido; «Pillar entrada» y «Cómo llegar»; el clic contado en el panel; guardar el plan con cuenta (llega a la tabla `favoritos`); editar un plan publicado; el aviso de madrugada; borrar un borrador; y cancelar un plan (deja el feed, su ficha avisa y en Guardados sale como cancelado).
- **No probado:** en un iPhone o un Android.

### Fuera de esta ronda

Subir una foto o un flyer (ronda 3), repetir un plan cada semana, duplicar un plan y cambiar la dirección de un plan concreto (hoy usa siempre la del local).
