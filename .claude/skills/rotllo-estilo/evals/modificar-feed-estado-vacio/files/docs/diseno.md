# Guía visual de Rotllo (BORRADOR para pruebas)

## Paleta
| Token | Valor | Uso |
|---|---|---|
| `--color-fondo` | #FFF7ED | Fondo de la app (arena) |
| `--color-superficie` | #FFFFFF | Tarjetas, hojas |
| `--color-tinta` | #1C1917 | Texto principal |
| `--color-tinta-suave` | #57534E | Texto secundario |
| `--color-taronja` | #FF5A1F | Marca. Fondos de acento con texto `--color-tinta`. No usar como color de texto sobre claro. |
| `--color-taronja-fuerte` | #C2410C | Botón primario (texto blanco), enlaces |
| `--color-mar` | #0E4D64 | Secundario: mapa, chips activos (texto blanco) |
| `--color-exito` | #15803D | "Gratis", confirmaciones |
| `--color-error` | #B91C1C | Errores |
| `--color-borde` | #E7E5E4 | Bordes y separadores |

## Tipografía
- Títulos: "Bricolage Grotesque", 700. Cuerpo: "Inter", 400/600. Fallback: system-ui.
- Escala: `--texto-xl` 28px/1.15 · `--texto-l` 22px/1.2 · `--texto-m` 17px/1.4 · `--texto-s` 15px/1.4 · `--texto-xs` 13px/1.3 (solo metadatos).

## Espaciado y forma
- Escala de 4px: `--esp-1` 4 · `--esp-2` 8 · `--esp-3` 12 · `--esp-4` 16 · `--esp-6` 24 · `--esp-8` 32 · `--esp-12` 48.
- Márgenes laterales de pantalla: `--esp-4`.
- Radios: `--radio-s` 8px · `--radio-m` 16px (tarjetas) · `--radio-pill` 999px (botones, chips).
- Sombra tarjeta: `0 2px 12px rgba(28,25,23,.08)`.

## Componentes
- **Botón primario**: pill, fondo `--color-taronja-fuerte`, texto blanco 600 `--texto-m`, alto 52px, ancho completo en acciones principales.
- **Botón secundario**: pill, fondo transparente, borde 2px `--color-tinta`, texto `--color-tinta`, alto 52px.
- **Chip de filtro**: pill, alto 44px, borde 1px `--color-borde`; activo: fondo `--color-mar`, texto blanco.
- **Tarjeta de plan**: superficie blanca, `--radio-m`, foto 16:9 arriba, título `--texto-l`, metadatos (fecha · hora · zona) `--texto-s` `--color-tinta-suave`, badge de precio.
- **Badge de precio**: pill pequeño; "Gratis" fondo `--color-exito` texto blanco; de pago fondo `--color-tinta` texto blanco ("Desde 12 €").
- **Barra de acción inferior**: fija abajo, fondo superficie, borde superior, padding `--esp-4`, contiene la acción principal.
