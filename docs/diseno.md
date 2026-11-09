# Guía visual de Rotllo · Serie Warhol

> Estado: **aprobada** (2026-11-09). Es la dirección 2 de `docs/direcciones-visuales.md`. En el código vive en `src/theme/tokens.ts`: si cambias algo aquí, cámbialo también allí (y al revés). Un test (`src/theme/tokens.test.ts`) comprueba el contraste de los pares de esta guía.

**La idea:** una galería pop. Cada plan se ve como una serigrafía, con la pareja de colores de su categoría, y el plan de la noche se repite 4 veces cambiando los colores, como Warhol. El color va en las imágenes; la interfaz es papel, tinta y marcos finos, para que la app se lea fácil y se use sin pensar.

## Modos

La app sigue el modo del móvil: **claro** de día y **oscuro** de noche. El oscuro ("negro galería") es el que más se va a usar.

## Colores de la interfaz

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `fondo` | #F4F1EA (papel) | #0D0D0F (negro galería) | Fondo de pantalla |
| `superficie` | #FFFFFF | #1A1A1F | Tarjetas, barras, campos |
| `texto` | #111111 (tinta) | #F4F1EA (papel) | Texto principal |
| `textoSuave` | #4A4640 | #B9B4AA | Metadatos, texto secundario |
| `marco` | #111111 | #F4F1EA | Bordes de tarjetas y controles (2 px) |
| `separador` | #D9D4C9 | #3A3A42 | Líneas **decorativas** (no valen para controles) |
| `acento` | #FFD400 → solo con texto `tinta` | #FFD400 | Chip activo y botón principal en oscuro |
| `indicador` | #1D2B8F (azul Klein) | #FF3EA5 (rosa) | Pestaña activa, foco del teclado |
| `error` | #C81E1E | #FF6FBF | Mensajes de error |

**Botón principal y chip activo:**
- **Claro:** fondo tinta con texto papel.
- **Oscuro:** fondo amarillo con texto tinta.

## Parejas de color por categoría

Cada categoría tiene una pareja **fondo / figura** para sus ilustraciones y fotos. Son decorativas: nunca llevan texto encima, salvo la etiqueta de categoría, que siempre va en tinta o en blanco según la tabla.

| Categoría | Fondo | Figura | Texto encima |
|---|---|---|---|
| Fiesta | #FF3EA5 rosa | #1D2B8F azul Klein | tinta (5,83:1) |
| Música en directo | #FFD400 amarillo | #C81E1E rojo | tinta (13,19:1) |
| Bar y tardeo | #00B3A6 turquesa | #6B1E87 violeta | tinta (7,19:1) |
| Gastro | #C81E1E rojo | #FFD400 amarillo | blanco (5,74:1) |
| Cultura | #6B1E87 violeta | #FF3EA5 rosa | blanco (9,72:1) |
| Deporte | #1D2B8F azul Klein | #FFD400 amarillo | blanco (11,70:1) |
| Talleres | #FFD400 amarillo | #1D2B8F azul Klein | tinta (13,19:1) |
| Social | #FF3EA5 rosa | #FFD400 amarillo | tinta (5,83:1) |
| Aire libre | #00B3A6 turquesa | #FFD400 amarillo | tinta (7,19:1) |

La **serie del destacado** usa estas 4 parejas, en este orden: rosa/azul, amarillo/rojo, turquesa/violeta y azul/amarillo.

## Tipografía

- **Archivo Black** (`ArchivoBlack_400Regular`): logo, títulos de pantalla y títulos de plan. Siempre en frases normales, nunca todo en mayúsculas (menos el logo).
- **Inter** (400, 600, 700): todo lo demás.

| Token | Tamaño / interlineado | Fuente | Uso |
|---|---|---|---|
| `xl` | 30 / 34 | Archivo Black | Título de pantalla |
| `l` | 22 / 27 | Archivo Black | Título de plan y de sección |
| `m` | 17 / 24 | Inter 400-600 | Texto normal, botones (600) |
| `s` | 15 / 21 | Inter 400 | Metadatos (fecha · barrio) |
| `xs` | 13 / 17 | Inter 700 | Etiquetas (precio, edad, rótulos) |

## Espaciado, forma y sombras

- **Espacios:** escala de 4 en 4, con los valores 4, 8, 12, 16, 24, 32 y 48. El margen lateral de pantalla es 16.
- **Radios:**
  - `s` (2) para etiquetas.
  - `m` (4) para tarjetas, chips, botones y campos.
  - Nada más redondeado: es la seña de las serigrafías.
- **Bordes:** 2 px en `marco`. Dentro de una tarjeta, la foto se separa con otra línea de 2 px.
- **Sombras:** **ninguna**. La profundidad la dan los marcos y el color, no las sombras.

## Accesibilidad

- Todo lo que se pulsa mide **al menos 44 × 44**. Los botones miden 52 de alto y las pestañas 56.
- Contraste AA en todos los pares de texto. Los indicadores y bordes de controles llegan a 3:1 o más.
- La información nunca va solo con color: "Gratis" lleva texto y la edad lleva "+21".
- Las imágenes llevan texto alternativo y los botones de solo icono, etiqueta.

## Componentes

| Componente | Archivo | Cómo es |
|---|---|---|
| **Logo** | `Logo` | "ROTLLO" en Archivo Black, cada letra de un color de la serie, con un borde de tinta desplazado de 2 px |
| **Botón** | `Boton` | 52 de alto, radio 4. Primario: fondo de botón principal. Secundario: sin fondo, con marco de 2 px. Texto: sin fondo ni marco, subrayado, para la opción menos importante ("Saltar", "Mirar sin cuenta") |
| **Botón de icono** | `BotonIcono` | Icono de 24 en una zona táctil de 44×44, siempre con etiqueta para el lector de pantalla (compartir, volver) |
| **Campo de texto** | `CampoTexto` | Etiqueta en `xs` arriba, caja de 52 con marco de 2 px y radio 4. Con el foco, marco en `indicador`; con error, marco y mensaje en `error` |
| **Chip** (filtro o categoría) | `Chip` | 44 de alto, radio 4, marco de 2 px. Activo: los colores del botón principal |
| **Barra de búsqueda** | `BarraBusqueda` | 48 de alto, marco de 2 px, icono de lupa y botón de borrar. Con el foco, marco en `indicador`. Busca sin tildes ni mayúsculas en título, local y barrio |
| **Etiqueta de precio** | `BadgePrecio` | Radio 2. De pago: fondo `texto` y letra `fondo`. Gratis: turquesa con tinta |
| **Ilustración del plan** | `IlustracionPlan` | Panel con la pareja de su categoría, lunares de semitono, la figura con contorno de tinta y destellos. Se usa mientras el local no suba fotos |
| **Tarjeta de plan** | `TarjetaPlan` | Fila con la imagen de 120 px a la izquierda y la cartela a la derecha (título, metadatos, etiquetas). Marco de 2 px |
| **Destacado** | `DestacadoSerie` | El plan de la noche en una serie de 2×2 con 4 parejas de color, más su cartela: rótulo "El plan de esta noche", título y datos |
| **Aviso de prueba** | `AvisoPrueba` | Caja con marco discontinuo y texto `xs`: avisa de que una pantalla aún no hace lo que dice (el registro antes del módulo 1). Se quita cuando funcione |
| **Pasos** | bienvenida | Cuadraditos de 12 con marco de 2 px; el activo se alarga a 32 y se rellena de `indicador` |
| **Estado vacío** | `EstadoVacio` | Título `l`, texto `m` en `textoSuave` y botón principal |
| **Barra de navegación** | pestañas | Fondo `fondo`, línea superior de 2 px en `marco`, iconos de trazo. La pestaña activa lleva un subrayado de 4 px en `indicador` |

**Animaciones:**
- Al pulsar, las tarjetas y los botones bajan su opacidad al 85 %.
- **Más adelante:** el cambio de colores del destacado al aparecer (efecto serigrafía).

## Pantallas

| Pantalla | Ruta | Notas |
|---|---|---|
| Bienvenida | `/bienvenida` | 3 pasos con ilustración, solo la primera vez que se abre la app. Los enlaces a un plan (rotllo.app/p/…) no pasan por aquí |
| Entrar | `/entrar` | Apple (solo iPhone), Google y email, todos con el mismo peso. "Mirar sin cuenta" abajo |
| Email y código | `/entrar/email` | Código de 6 cifras por email, sin contraseñas |
| Fecha de nacimiento | `/entrar/edad` | Día, mes y año en tres campos de números (más rápido que un calendario). Menos de 18: mensaje amable, sin rojo |
| Feed | `/` | Logo, búsqueda, filtros, el destacado en serie y la lista |
| Ficha del plan | `/p/<id>` | Arriba solo volver y compartir; la acción principal ("Pillar entrada") abajo, al alcance del pulgar |

Capturas de la primera ronda en `prototipos/pantallas-r1/`.

## Pendiente

- **Fotos reales en duotono:** procesarlas al subirlas (con una Edge Function), porque hacerlo en el móvil no funciona igual en iOS y Android. Mientras tanto, las fotos se muestran tal cual, con su marco.
- **Logo e icono de la app** definitivos (ahora el logo es texto).
- **Botón de Apple:** en el módulo 1 se cambia por el oficial de Apple (`expo-apple-authentication`), que Apple exige con sus colores.
- **Componentes de la v2**, que se diseñan cuando lleguen sus módulos: tarjeta de entrada con QR (marco de 2 px, QR sobre blanco), burbuja de chat y tarjeta de votación (barras con las parejas de color).
