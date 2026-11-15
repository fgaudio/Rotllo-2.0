# Panel del local

Dónde un bar, una discoteca o un sitio de actividades se da de alta y publica sus planes. Se construye en tres rondas.

| Ronda | Qué incluye | Estado |
|---|---|---|
| **1. El local** | Alta, estado de la revisión y la pantalla del equipo para aprobar | Hecha (13 de noviembre de 2026) |
| **2. Los planes** | Crear, editar, publicar y cancelar, con el editor de cartel | Hecha (14 de noviembre de 2026) |
| **3. El flyer** | Subir una foto o un flyer propio como cartel | Hecha (15 de noviembre de 2026) |

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

## Ronda 3: la foto o el flyer

### Cómo funciona

1. En el formulario del plan, sección «El cartel»: **«Subir foto o flyer»** abre la galería del móvil.
2. Con una imagen elegida, el formulario enseña **los dos recortes**: cómo sale en la ficha (vertical) y cómo sale en el feed (apaisado). Así el local ve antes de publicar si se le corta algo.
3. Las opciones de estilo, color y texto desaparecen: **con foto, el cartel es su imagen, tal cual**, sin nada encima.
4. Al guardar, la imagen se sube. Se puede **cambiar** por otra o **quitar** para volver al cartel generado.

### Decisiones

- **Se encoge antes de subir:** 1600 px por su lado más largo y en JPEG. Un flyer de 3000 × 3750 px se queda en 1280 × 1600 y unos 50 KB. Gasta pocos datos al local y al que lo ve.
- **Se le quitan los datos ocultos** (dónde y con qué móvil se hizo la foto), porque la imagen se guarda de nuevo desde cero.
- **Una sola foto de cartel por plan.** Subir otra sustituye a la anterior y borra el archivo viejo.
- **Primero se guarda el plan y después se sube la foto.** Si la subida falla, el plan no se pierde: el formulario avisa y se puede reintentar sin crear el plan dos veces.
- **Dónde se guarda:** Supabase Storage, carpeta `planes/<id del plan>/`. Cualquiera puede ver la imagen con su enlace; solo puede subirla, cambiarla o borrarla quien puede editar ese plan (regla de la base de datos, pensada desde el diseño inicial).
- **Solo galería:** no se pide permiso de cámara ni de micrófono.

### Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `src/lib/fotos.ts` | Elegir, encoger, subir, sustituir y quitar la foto |
| `src/app/local/plan/[id].tsx` | La sección «El cartel» del formulario |
| `app.config.ts` | El texto que enseña el iPhone al pedir permiso para ver las fotos |
| `supabase/tests/database/07_fotos_del_plan.test.sql` | Tests de quién puede subir y borrar |

Paquete nuevo: `expo-image-picker`. Es un paquete nativo, así que **hay que rehacer la app de pruebas (development build)** para verlo en el móvil.

### Probado

- **Tests:** 141 de la app y 161 de la base de datos, todos pasan.
- **Contra el Supabase real, en el navegador** (12 comprobaciones): subir un flyer al crear un plan, que quede apuntado y se pueda ver sin cuenta, que salga en el feed y en la ficha, cambiarlo por otro (y que el viejo se borre), quitarlo, y que alguien sin cuenta no pueda subir nada a la carpeta del plan.
- **No probado:** la galería de un iPhone o un Android de verdad (aquí se probó con el selector de archivos del navegador).

### Fuera de esta ronda

Varias fotos por plan (la tabla admite hasta 6), recortar la imagen dentro de la app, hacer la foto con la cámara y el efecto de dos tintas para las fotos, que quedó como idea en la guía de diseño.
