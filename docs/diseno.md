# Guía visual de Rotllo

> Estado: **aprobada** (2026-11-08). Sale del borrador que se probó con la skill `rotllo-estilo`. En el código vive en `src/theme/tokens.ts`: si cambias algo aquí, cámbialo también allí (y al revés).

## Paleta

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `fondo` | #FFF7ED | Fondo de la app (arena) | — |
| `superficie` | #FFFFFF | Tarjetas, barras, hojas | — |
| `tinta` | #1C1917 | Texto principal | 16,47:1 sobre fondo · 17,49:1 sobre blanco |
| `tintaSuave` | #57534E | Texto secundario, iconos inactivos | 7,19:1 sobre fondo · 7,63:1 sobre blanco |
| `taronja` | #FF5A1F | Color de marca. Solo como **fondo** de acento, con texto `tinta` encima. Nunca como color de texto sobre claro | tinta encima: 5,61:1 |
| `taronjaFuerte` | #C2410C | Botón principal (texto blanco), pestaña activa, enlaces | blanco encima: 5,18:1 |
| `mar` | #0E4D64 | Secundario: chips activos (texto blanco), mapa | blanco encima: 9,27:1 |
| `exito` | #15803D | "Gratis", confirmaciones (texto blanco) | blanco encima: 5,02:1 |
| `error` | #B91C1C | Errores | 6,09:1 sobre fondo |
| `borde` | #E7E5E4 | Separadores **decorativos** | 1,18:1: no vale para bordes de controles |
| `bordeControl` | #57534E | Bordes de chips y de controles | 7,19:1 (el mínimo para controles es 3:1) |

**Regla**: cualquier combinación nueva de texto y fondo se comprueba con `.claude/skills/rotllo-estilo/scripts/contraste.py` antes de usarla.

## Tipografía

- Títulos: **Bricolage Grotesque** 700/800. Cuerpo: **Inter** 400/600. Mientras no carguemos las fuentes, se usa la del sistema.
- Escala:

| Token | Tamaño / interlineado | Uso |
|---|---|---|
| `xl` | 28 / 32 | Título de pantalla |
| `l` | 22 / 26 | Título de tarjeta y de sección |
| `m` | 17 / 24 | Texto normal y botones |
| `s` | 15 / 21 | Metadatos (fecha · barrio) |
| `xs` | 13 / 17 | Solo etiquetas pequeñas (precio, edad, notas) |

## Espaciado y forma

- Escala de 4 en 4: `1` 4 · `2` 8 · `3` 12 · `4` 16 · `6` 24 · `8` 32 · `12` 48.
- Margen lateral de pantalla: `4` (16).
- Radios: `s` 8 · `m` 16 (tarjetas) · `pill` 999 (botones, chips, etiquetas).
- Sombra de tarjeta: tinta al 8 %, desenfoque 12, desplazamiento vertical 2.

## Accesibilidad

- Todo lo que se pulsa mide **al menos 44 × 44**. Los botones miden 52 de alto.
- La información nunca va solo con color: "Gratis" lleva texto, y la edad mínima lleva "+21".
- Imágenes con texto alternativo y botones de solo icono con etiqueta.

## Componentes

| Componente | Archivo | Cómo es |
|---|---|---|
| **Botón primario** | `Boton` (`variante="primario"`) | Píldora, fondo `taronjaFuerte`, texto blanco 600 tamaño `m`, 52 de alto. Para la acción principal, a lo ancho y abajo |
| **Botón secundario** | `Boton` (`variante="secundario"`) | Píldora sin fondo, borde de 2 en `tinta`, texto `tinta`, 52 de alto |
| **Chip de filtro** | `Chip` | Píldora de 44 de alto, borde de 1 en `bordeControl`, fondo blanco. Activo: fondo `mar` y texto blanco |
| **Tarjeta de plan** | `TarjetaPlan` | Fondo blanco, radio `m`, sombra. Foto 16:9 arriba; debajo, precio y edad, título `l` y metadatos `s` en `tintaSuave` |
| **Etiqueta de precio** | `BadgePrecio` | Píldora pequeña: "Gratis" en `exito` o "Desde 8 €" en `tinta`, con texto blanco |
| **Foto sin imagen** | `FotoPlan` | Fondo `taronja` con un icono en `tinta`, mientras el local no suba fotos |
| **Estado vacío** | `EstadoVacio` | Título `l`, texto `m` en `tintaSuave` y botón primario con la siguiente acción |
| **Barra de acción inferior** | En la ficha del plan | Fija abajo, fondo blanco, borde superior `borde`, margen `4`; contiene la acción principal y una nota `xs` |

## Pendiente

- Logo, icono de la app y pantalla de inicio (ahora son los de la plantilla de Expo).
- Cargar las fuentes Bricolage Grotesque e Inter.
- Modo oscuro (de momento, solo claro).
- Estilo del mapa con los colores de Rotllo (en Android).
