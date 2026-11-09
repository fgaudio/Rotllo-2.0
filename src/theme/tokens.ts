// Tokens de diseño de Rotllo (Serie Warhol): la única fuente de colores, espacios y tamaños.
// Son la versión en código de docs/diseno.md: si cambias algo aquí, cámbialo también allí.
// El contraste de los pares de texto lo comprueba src/theme/tokens.test.ts.

export type Modo = 'claro' | 'oscuro';

// Colores sueltos de la serie (las ilustraciones y las parejas de categoría salen de aquí)
export const serie = {
  rosa: '#FF3EA5',
  azul: '#1D2B8F',
  amarillo: '#FFD400',
  rojo: '#C81E1E',
  turquesa: '#00B3A6',
  violeta: '#6B1E87',
  tinta: '#111111',
  papel: '#F4F1EA',
  blanco: '#FFFFFF',
} as const;

export type Colores = {
  fondo: string;
  superficie: string;
  texto: string;
  textoSuave: string;
  marco: string;
  separador: string; // solo decorativo
  principal: string; // fondo del botón principal y del chip activo
  sobrePrincipal: string; // texto encima de `principal`
  indicador: string; // pestaña activa y foco
  error: string;
  precio: string; // fondo de la etiqueta de precio
  sobrePrecio: string;
  gratis: string;
  sobreGratis: string;
};

export const temas: Record<Modo, Colores> = {
  claro: {
    fondo: serie.papel,
    superficie: serie.blanco,
    texto: serie.tinta,
    textoSuave: '#4A4640',
    marco: serie.tinta,
    separador: '#D9D4C9',
    principal: serie.tinta,
    sobrePrincipal: serie.papel,
    indicador: serie.azul,
    error: serie.rojo,
    precio: serie.tinta,
    sobrePrecio: serie.papel,
    gratis: serie.turquesa,
    sobreGratis: serie.tinta,
  },
  oscuro: {
    fondo: '#0D0D0F',
    superficie: '#1A1A1F',
    texto: serie.papel,
    textoSuave: '#B9B4AA',
    marco: serie.papel,
    separador: '#3A3A42',
    principal: serie.amarillo,
    sobrePrincipal: serie.tinta,
    indicador: serie.rosa,
    error: '#FF6FBF',
    precio: serie.papel,
    sobrePrecio: serie.tinta,
    gratis: serie.turquesa,
    sobreGratis: serie.tinta,
  },
};

// Pareja fondo / figura de cada categoría (lista cerrada de docs/system-design.md).
export type Pareja = { fondo: string; figura: string; texto: string };

export const parejasCategoria: Record<string, Pareja> = {
  fiesta: { fondo: serie.rosa, figura: serie.azul, texto: serie.tinta },
  'musica-en-directo': { fondo: serie.amarillo, figura: serie.rojo, texto: serie.tinta },
  'bar-y-tardeo': { fondo: serie.turquesa, figura: serie.violeta, texto: serie.tinta },
  gastro: { fondo: serie.rojo, figura: serie.amarillo, texto: serie.blanco },
  cultura: { fondo: serie.violeta, figura: serie.rosa, texto: serie.blanco },
  deporte: { fondo: serie.azul, figura: serie.amarillo, texto: serie.blanco },
  talleres: { fondo: serie.amarillo, figura: serie.azul, texto: serie.tinta },
  social: { fondo: serie.rosa, figura: serie.amarillo, texto: serie.tinta },
  'aire-libre': { fondo: serie.turquesa, figura: serie.amarillo, texto: serie.tinta },
};

export function parejaDe(categoria: string): Pareja {
  return parejasCategoria[categoria] ?? parejasCategoria.fiesta;
}

// Las 4 parejas del destacado, en orden.
export const parejasSerie: Pareja[] = [
  { fondo: serie.rosa, figura: serie.azul, texto: serie.tinta },
  { fondo: serie.amarillo, figura: serie.rojo, texto: serie.tinta },
  { fondo: serie.turquesa, figura: serie.violeta, texto: serie.tinta },
  { fondo: serie.azul, figura: serie.amarillo, texto: serie.blanco },
];

// Letras del logo, cada una de un color de la serie.
export const coloresLogo = [serie.rosa, serie.amarillo, serie.turquesa, serie.azul, serie.rosa, serie.amarillo];

export const fuentes = {
  titulo: 'ArchivoBlack_400Regular',
  normal: 'Inter_400Regular',
  media: 'Inter_600SemiBold',
  negrita: 'Inter_700Bold',
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
  s: 2,
  m: 4,
} as const;

export const borde = 2;

export const texto = {
  xl: { fontFamily: fuentes.titulo, fontSize: 30, lineHeight: 34 },
  l: { fontFamily: fuentes.titulo, fontSize: 22, lineHeight: 27 },
  m: { fontFamily: fuentes.normal, fontSize: 17, lineHeight: 24 },
  s: { fontFamily: fuentes.normal, fontSize: 15, lineHeight: 21 },
  xs: { fontFamily: fuentes.negrita, fontSize: 13, lineHeight: 17 },
} as const;

// Accesibilidad: todo lo que se pulsa mide al menos esto (en puntos).
export const zonaTactilMinima = 44;
export const alturaBoton = 52;
export const alturaPestana = 56;
