// Tokens de diseño de Rotllo («Cartelera»): la única fuente de colores, espacios y tamaños.
// Son la versión en código de docs/diseno.md: si cambias algo aquí, cámbialo también allí.
// El contraste de los pares de texto lo comprueba src/theme/tokens.test.ts.

export type Modo = 'claro' | 'oscuro';

// Colores pop. Solo viven dentro de los carteles y en algún momento de marca;
// la interfaz usa los colores del tema de abajo.
export const pop = {
  rosa: '#FF3EA5',
  azul: '#1D2B8F',
  amarillo: '#FFD400',
  rojo: '#E5341F',
  turquesa: '#00B3A6',
  violeta: '#6B1E87',
  tinta: '#111111',
  papel: '#F4F1EA',
} as const;

export type Colores = {
  fondo: string;
  superficie: string; // tarjetas y campos
  superficie2: string; // botones secundarios, encima de una superficie
  linea: string; // separadores (decorativo)
  texto: string;
  textoSuave: string; // datos secundarios
  textoTenue: string; // lo menos importante: pestañas inactivas, notas
  acento: string; // fondo del botón principal
  sobreAcento: string;
  rotulo: string; // rótulos en mayúsculas ("HOY · 23:00") e indicador de la pestaña activa
  vivo: string; // el punto de "Empieza en 2 h"
  error: string;
  gratis: string; // fondo de la pastilla "Gratis"
  sobreGratis: string;
};

export const temas: Record<Modo, Colores> = {
  oscuro: {
    fondo: '#0B0B0D',
    superficie: '#17171B',
    superficie2: '#26262D',
    linea: '#2B2B32',
    texto: pop.papel,
    textoSuave: '#A9A49B',
    textoTenue: '#8F8A82',
    acento: pop.amarillo,
    sobreAcento: pop.tinta,
    rotulo: pop.amarillo,
    vivo: pop.rosa,
    error: '#FF8A7A',
    gratis: pop.turquesa,
    sobreGratis: pop.tinta,
  },
  claro: {
    fondo: pop.papel,
    superficie: '#FFFFFF',
    superficie2: '#E9E5DB',
    linea: '#DCD7CB',
    texto: pop.tinta,
    textoSuave: '#57524B',
    textoTenue: '#6A655E',
    acento: pop.tinta,
    sobreAcento: pop.papel,
    rotulo: pop.azul,
    vivo: '#D6157E',
    error: '#B3261E',
    gratis: pop.turquesa,
    sobreGratis: pop.tinta,
  },
};

// ── Carteles ────────────────────────────────────────────────────────────────
// Combinaciones de color de un cartel generado. Es una lista cerrada: el local elige una
// (o se le asigna la de su categoría). `tinta` es el color del texto del cartel.
export type ColorCartel = { fondo: string; figura: string; tinta: string };

export const coloresCartel = {
  rosa: { fondo: pop.rosa, figura: pop.amarillo, tinta: pop.azul },
  amarillo: { fondo: pop.amarillo, figura: pop.rojo, tinta: pop.tinta },
  turquesa: { fondo: pop.turquesa, figura: pop.amarillo, tinta: pop.violeta },
  violeta: { fondo: pop.violeta, figura: pop.rosa, tinta: pop.amarillo },
  azul: { fondo: pop.azul, figura: pop.turquesa, tinta: pop.amarillo },
  rojo: { fondo: pop.rojo, figura: pop.amarillo, tinta: pop.papel },
  papel: { fondo: pop.papel, figura: pop.rosa, tinta: pop.azul },
} as const satisfies Record<string, ColorCartel>;

export type NombreColorCartel = keyof typeof coloresCartel;

// El color de cartel de cada categoría (lista cerrada de docs/system-design.md).
export const colorDeCategoria: Record<string, NombreColorCartel> = {
  fiesta: 'rosa',
  'musica-en-directo': 'amarillo',
  'bar-y-tardeo': 'turquesa',
  gastro: 'rojo',
  cultura: 'violeta',
  deporte: 'azul',
  talleres: 'amarillo',
  social: 'papel',
  'aire-libre': 'turquesa',
};

// Las 4 celdas del cartel en serie (2×2), en orden.
export const celdasSerie = [
  { fondo: pop.rosa, figura: pop.azul },
  { fondo: pop.amarillo, figura: pop.rojo },
  { fondo: pop.turquesa, figura: pop.violeta },
  { fondo: pop.azul, figura: pop.amarillo },
] as const;

// ── Tipografía ──────────────────────────────────────────────────────────────
export const fuentes = {
  cartel: 'Anton_400Regular', // títulos, siempre en mayúsculas
  normal: 'Inter_400Regular',
  media: 'Inter_600SemiBold',
  negrita: 'Inter_700Bold',
} as const;

// Anton es muy alta: el interlineado es 1,1 veces el tamaño para que no se corten las tildes.
const cartel = (tamano: number) =>
  ({ fontFamily: fuentes.cartel, fontSize: tamano, lineHeight: Math.round(tamano * 1.1), textTransform: 'uppercase' }) as const;

export const texto = {
  titular: cartel(50), // "¿Qué hacemos esta noche?"
  titulo: cartel(40), // el plan destacado, títulos de pantalla
  seccion: cartel(26), // "Hoy también", "De qué va"
  dia: { ...cartel(17), letterSpacing: 0.5 }, // "Viernes 13" en la agenda
  l: { fontFamily: fuentes.media, fontSize: 19, lineHeight: 27 }, // entradilla
  m: { fontFamily: fuentes.normal, fontSize: 17, lineHeight: 25 },
  s: { fontFamily: fuentes.normal, fontSize: 15, lineHeight: 21 },
  xs: { fontFamily: fuentes.normal, fontSize: 13, lineHeight: 18 },
  rotulo: { fontFamily: fuentes.negrita, fontSize: 12, lineHeight: 16, letterSpacing: 1.3, textTransform: 'uppercase' },
} as const;

// ── Medidas ─────────────────────────────────────────────────────────────────
export const espacio = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const radio = {
  s: 8, // carteles pequeños
  m: 14, // campos, mapa, bloques
  l: 18, // tarjeta destacada
  pildora: 999, // botones, chips, pastillas
} as const;

// Accesibilidad: todo lo que se pulsa mide al menos esto (en puntos).
export const zonaTactilMinima = 44;
export const alturaBoton = 56;
export const alturaPestana = 60;
