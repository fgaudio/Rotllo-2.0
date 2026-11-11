// Comprueba que los pares de texto y fondo de docs/diseno.md cumplen WCAG AA.
// Si alguien cambia un color en tokens.ts y deja de leerse bien, este test falla.
import { describe, expect, test } from '@jest/globals';

import { colorDeCategoria, coloresCartel, pop, temas, type Modo } from './tokens';

function luminancia(hex: string) {
  const canales = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = canales.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a: string, b: string) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

const TEXTO_NORMAL = 4.5;
const CONTROLES = 3; // indicadores y marcas que no son texto

describe.each<Modo>(['claro', 'oscuro'])('tema %s', (modo) => {
  const c = temas[modo];

  test.each([
    ['texto sobre fondo', c.texto, c.fondo],
    ['texto sobre superficie', c.texto, c.superficie],
    ['texto sobre superficie 2', c.texto, c.superficie2],
    ['texto suave sobre fondo', c.textoSuave, c.fondo],
    ['texto suave sobre superficie', c.textoSuave, c.superficie],
    ['texto tenue sobre fondo', c.textoTenue, c.fondo],
    ['texto tenue sobre superficie', c.textoTenue, c.superficie],
    ['texto del botón principal', c.sobreAcento, c.acento],
    ['rótulo sobre fondo', c.rotulo, c.fondo],
    ['rótulo sobre superficie', c.rotulo, c.superficie],
    ['pastilla de precio (fondo sobre texto)', c.fondo, c.texto],
    ['texto de "Gratis"', c.sobreGratis, c.gratis],
    ['error sobre fondo', c.error, c.fondo],
    ['error sobre superficie', c.error, c.superficie],
  ])('%s llega a 4,5:1', (_nombre, texto, fondo) => {
    expect(contraste(texto, fondo)).toBeGreaterThanOrEqual(TEXTO_NORMAL);
  });

  test.each([
    ['punto "en vivo" sobre fondo', c.vivo, c.fondo],
    ['punto "en vivo" sobre superficie', c.vivo, c.superficie],
    ['botón principal sobre fondo', c.acento, c.fondo],
  ])('%s llega a 3:1', (_nombre, color, fondo) => {
    expect(contraste(color, fondo)).toBeGreaterThanOrEqual(CONTROLES);
  });
});

// Momentos de marca con texto encima de un color pop.
test('el sello (tinta sobre papel) se lee', () => {
  expect(contraste(pop.tinta, pop.papel)).toBeGreaterThanOrEqual(TEXTO_NORMAL);
});
test('el bloque de compartir (tinta sobre rosa) se lee', () => {
  expect(contraste(pop.tinta, pop.rosa)).toBeGreaterThanOrEqual(TEXTO_NORMAL);
});

test('cada categoría tiene un color de cartel que existe', () => {
  for (const nombre of Object.values(colorDeCategoria)) expect(coloresCartel[nombre]).toBeDefined();
});
