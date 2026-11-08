// Tokens de diseño de Rotllo: la única fuente de colores, espacios y tamaños de la app.
// Son la versión en código de docs/diseno.md: si cambias algo aquí, cámbialo también allí.
// Contraste comprobado con .claude/skills/rotllo-estilo/scripts/contraste.py.

export const colores = {
  fondo: '#FFF7ED', // arena: fondo de la app
  superficie: '#FFFFFF', // tarjetas y barras
  tinta: '#1C1917', // texto principal (16,47:1 sobre fondo)
  tintaSuave: '#57534E', // texto secundario (7,19:1 sobre fondo)
  taronja: '#FF5A1F', // marca: solo fondos de acento con texto tinta (5,61:1); nunca como texto sobre claro
  taronjaFuerte: '#C2410C', // botón principal con texto blanco (5,18:1) y pestaña activa
  mar: '#0E4D64', // chips activos con texto blanco (9,27:1) y mapa
  exito: '#15803D', // "Gratis" con texto blanco (5,02:1)
  error: '#B91C1C', // errores (6,09:1 sobre fondo)
  borde: '#E7E5E4', // separadores decorativos (no sirve para bordes de controles)
  bordeControl: '#57534E', // bordes de chips y botones secundarios (7,19:1, mínimo 3:1)
  blanco: '#FFFFFF',
} as const;

export const espacio = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
} as const;

export const radio = {
  s: 8,
  m: 16,
  pill: 999,
} as const;

export const texto = {
  xl: { fontSize: 28, lineHeight: 32 },
  l: { fontSize: 22, lineHeight: 26 },
  m: { fontSize: 17, lineHeight: 24 },
  s: { fontSize: 15, lineHeight: 21 },
  xs: { fontSize: 13, lineHeight: 17 }, // solo metadatos
} as const;

// Accesibilidad: todo lo que se pulsa mide al menos esto (en puntos).
export const zonaTactilMinima = 44;

export const alturaBoton = 52;

export const sombraTarjeta = {
  shadowColor: colores.tinta,
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;
