# Guía de diseño de Rotllo: «Cartelera»

**Idea:** cada plan es un cartel y la app es la cartelera de la ciudad.

Esta guía es la única fuente de colores y medidas. Su versión en código es `src/theme/tokens.ts`: si cambias algo aquí, cámbialo también allí. Sustituye a la «Serie Warhol» (el porqué del cambio está en `docs/rediseno-cartelera.md`).

## Principios

1. **El cartel manda.** Lo más grande de cada pantalla es el cartel del plan. La interfaz es sobria para no competir con él.
2. **Un solo color de interfaz.** El amarillo es para la acción principal de la pantalla. Los demás colores pop solo viven dentro de los carteles y en momentos de marca.
3. **Sin bordes.** Las cosas se separan con espacio y con superficies un poco más claras que el fondo.
4. **Se dice como lo diría una persona.** «Hoy · 23:00», «Empieza en 2 h», no «mié, 11 nov · 23:00».
5. **Directo a los planes.** La app se abre en el feed, sin bienvenida ni registro. La cuenta se pide solo cuando hace falta.

## Modos

La app sigue el modo del móvil. Está pensada **primero en oscuro**, porque se usa de noche. La pantalla de entrar es siempre oscura.

## Colores de la interfaz

| Token | Oscuro | Claro | Para qué |
|---|---|---|---|
| `fondo` | `#0B0B0D` | `#F4F1EA` | Fondo de la app |
| `superficie` | `#17171B` | `#FFFFFF` | Tarjetas, campos, chips |
| `superficie2` | `#26262D` | `#E9E5DB` | Botones secundarios, encima de una superficie |
| `linea` | `#2B2B32` | `#DCD7CB` | Separadores (decorativo) |
| `texto` | `#F4F1EA` | `#111111` | Texto principal |
| `textoSuave` | `#A9A49B` | `#57524B` | Datos secundarios |
| `textoTenue` | `#8F8A82` | `#6A655E` | Pestañas inactivas, notas |
| `acento` | `#FFD400` | `#111111` | Fondo del botón principal |
| `sobreAcento` | `#111111` | `#F4F1EA` | Texto del botón principal |
| `rotulo` | `#FFD400` | `#1D2B8F` | Rótulos en mayúsculas y pestaña activa |
| `vivo` | `#FF3EA5` | `#D6157E` | El punto de «Empieza en 2 h» y el corazón guardado |
| `error` | `#FF8A7A` | `#B3261E` | Errores de formulario |
| `gratis` | `#00B3A6` | `#00B3A6` | Pastilla «Gratis» (con texto en tinta) |

Todos los pares de texto y fondo llegan a 4,5:1 (WCAG AA). Lo comprueba `src/theme/tokens.test.ts` cada vez que se ejecutan los tests.

## Colores pop

Rosa `#FF3EA5` · Azul `#1D2B8F` · Amarillo `#FFD400` · Rojo `#E5341F` · Turquesa `#00B3A6` · Violeta `#6B1E87` · Tinta `#111111` · Papel `#F4F1EA`.

Solo se usan en los carteles, en el logo, en el sello y en el bloque «Mejor con tu gente». Nunca para botones ni textos de la interfaz.

## El cartel

El cartel es la publicidad del plan y lo decide el local. Componente: `Cartel`.

**1. Foto o flyer propio.** Si el local sube una imagen, se enseña tal cual, sin texto ni filtros encima.

**2. Cartel generado.** Si no hay imagen, la app genera uno. El local puede elegir tres cosas (campo `cartel` del plan):

| Opción | Valores | Si no elige |
|---|---|---|
| **Estilo** | `cinta`: el texto repetido en filas inclinadas · `inicial`: la primera letra, gigante, con un disco · `serie`: la misma letra en 2×2 colores | Uno de los tres, siempre el mismo para el mismo plan |
| **Color** | `rosa`, `amarillo`, `turquesa`, `violeta`, `azul`, `rojo`, `papel` | El de la categoría del plan |
| **Texto** | Hasta 40 letras: «2x1 hasta la 1», «Techno hasta las 6» | El título del plan |

Cada color es una combinación cerrada de fondo, figura y tinta, para que cualquier elección quede bien. La lógica está en `src/lib/cartel.ts` y la base de datos rechaza valores que no existan.

Todos los carteles generados llevan una **trama de puntos** que se desvanece en diagonal.

**Sello:** círculo de papel con el día y la hora («HOY 23:00»), girado 9°. Va en el cartel del plan destacado y en las tarjetas pequeñas.

## Tipografía

| Uso | Fuente | Tamaño / interlineado |
|---|---|---|
| `titular` (la pregunta del feed) | Anton, mayúsculas | 50 / 55 |
| `titulo` (plan destacado, pantallas) | Anton, mayúsculas | 40 / 44 (48 / 53 en la ficha) |
| `seccion` («Hoy también») | Anton, mayúsculas | 26 / 29 |
| `dia` («Viernes 13») | Anton, mayúsculas | 17 / 19 |
| `l` (entradilla) | Inter 600 | 19 / 27 |
| `m` (texto) | Inter 400 | 17 / 25 |
| `s` | Inter 400 | 15 / 21 |
| `xs` | Inter 400 | 13 / 18 |
| `rotulo` | Inter 700, mayúsculas, espaciado 1,3 | 12 / 16 |

**Anton** es condensada: cabe mucho texto y muy grande en un móvil. Solo para títulos, siempre en mayúsculas. **Inter** para todo lo que se lee de corrido.

## Medidas

- **Espacios:** 4, 8, 12, 16, 20, 24, 32, 40, 48.
- **Radios:** 8 (carteles pequeños) · 14 (campos, bloques) · 18 (tarjeta destacada) · píldora (botones, chips, pastillas).
- **Sombras:** ninguna.
- **Zona táctil mínima:** 44 × 44. Botones: 56 de alto. Pestañas: 60.

## Componentes

| Componente | Archivo | Cómo es |
|---|---|---|
| **Logo** (provisional) | `Marca` | «ROTLL» en Anton y un círculo en lugar de la última O. El círculo es el corro de gente que da nombre a la app |
| **Cartel** | `Cartel` | Ver arriba |
| **Botón** | `Boton` | Píldora de 56. `primario` (uno por pantalla), `superficie`, `linea`, `texto`; `claro` y `tinta` para ir encima de un color |
| **Botón redondo** | `BotonRedondo` | Icono en un círculo de 44. `cristal` va encima de un cartel |
| **Guardar** | `BotonGuardar` | El corazón. Guarda el plan en el móvil, sin cuenta. Lleno y en `vivo` si está guardado |
| **Chip** | `Chip` | Píldora de 44. Activo: colores invertidos |
| **Pastillas** | `Pastilla` | Precio (invertida), «Gratis» (turquesa), «+21» y categoría (con contorno) |
| **Rótulo vivo** | `RotuloVivo` | Punto encendido + «EMPIEZA EN 2 H» o «YA HA EMPEZADO». Sale si faltan menos de 6 horas |
| **Plan destacado** | `TarjetaDestacada` | Cartel ancho y, pegado debajo, rótulo, título, sitio, precio, compartir y guardar. Se ve entero sin bajar |
| **Tarjeta pequeña** | `TarjetaMini` | Cartel vertical de 164 × 212 con sello, para carruseles |
| **Fila de plan** | `FilaPlan` | Cartel de 84, título, hora y sitio, precio y corazón. Agenda, búsqueda y guardados |
| **Campo de texto** | `CampoTexto` | Etiqueta arriba y caja de 56. Foco: contorno en `rotulo`. Error: contorno y mensaje en `error` |
| **Barra de búsqueda** | `BarraBusqueda` | Píldora de 48 con lupa y botón de borrar |
| **Estado vacío** | `EstadoVacio` | Círculo de marca, qué pasa y qué hacer ahora |
| **Cargando** | `Cargando` | La silueta de lo que va a salir, en vez de una rueda |
| **Aviso de prueba** | `AvisoPrueba` | Contorno discontinuo: la pantalla aún no hace lo que dice. Se quita cuando funcione |
| **Pestañas** | `(tabs)/_layout` | Icono de trazo; la activa va rellena y con una marca arriba en `rotulo` |

Al pulsar, botones y chips bajan su opacidad y encogen un 2 %.

## Pantallas

| Pantalla | Ruta | Cómo es |
|---|---|---|
| **Feed** | `/` | Lo primero que se ve. Logo y lupa; «¿Qué hacemos esta noche?» (cambia con la hora y con el filtro); chips Todo, Hoy, Este finde y Gratis; el plan destacado; «Hoy también» en carrusel si hay dos o más; «Lo que viene» en agenda por días |
| **Búsqueda** | `/buscar` | Se abre con la lupa. Por título, local o barrio, sin tildes ni mayúsculas |
| **Ficha** | `/p/<id>` | Cartel a todo el ancho; categoría y rótulo vivo; título; cuándo, dónde, cuánto y edad; «De qué va»; bloque «Mejor con tu gente»; «Dónde es» con mapa; «Más planes». Arriba, volver, compartir y guardar. Abajo, fijo, el precio y la acción principal |
| **Guardados** | `/guardados` | Los planes con corazón |
| **Perfil** | `/perfil` | Entrar e idioma |
| **Entrar** | `/entrar` | Muro de carteles, «Valencia tiene plan.» y Apple, Google o email. Opcional: se llega desde Perfil |
| **Email y fecha de nacimiento** | `/entrar/email`, `/entrar/edad` | Código de 6 cifras; día, mes y año en tres campos |

**La acción principal de la ficha** depende del plan: «Pillar entrada» si tiene ticketera; «Cómo llegar» si no.

## Tono de los textos

Cercano, joven, con tuteo y frases cortas. Los botones empiezan por verbo y tienen de una a tres palabras. Los errores dicen qué pasa y qué hacer, sin culpar. Como mucho, un guiño valenciano por pantalla, y nunca en errores ni en textos legales. Todos los textos están en `src/i18n/` (español, inglés e italiano).

## Accesibilidad

- Contraste AA en todos los textos, comprobado con tests.
- Todo lo pulsable mide 44 × 44 o más.
- Los botones de solo icono tienen nombre para el lector de pantalla.
- «Gratis», «+21» y el estado de guardado se dicen con texto o forma, no solo con color.
- Los carteles generados son decorativos: el lector de pantalla lee «Cartel de Noche de salsa» y el título va aparte como texto.

## Pendiente

- **Editor del cartel para el local:** elegir estilo, color y texto, o subir su flyer, viendo cómo queda. Llega con el panel de locales (módulos 2 y 3). La base de datos y la app ya lo admiten.
- **Logo e icono de la app** definitivos.
- **Filtro por categoría** (Fiesta, Directos…): cuando la base de datos lo permita (módulo 3).
- **Probar en un móvil de verdad.** Este rediseño está comprobado en el navegador. En iPhone y Android hay que revisar sobre todo los carteles generados (la posición de las letras puede variar unos píxeles) y el mapa pequeño de la ficha.
- **Componentes de la v2** (entrada con QR, chat y votación): se diseñan cuando lleguen sus módulos.
