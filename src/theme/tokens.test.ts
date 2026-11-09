// Comprueba que los pares de texto y fondo de docs/diseno.md cumplen WCAG AA.
// Si alguien cambia un color en tokens.ts y deja de leerse bien, este test falla.
import { describe, expect, test } from '@jest/globals';

import { parejasCategoria, parejasSerie, temas, type Modo } from './tokens';

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
const CONTROLES = 3; // bordes de controles e indicadores

describe.each<Modo>(['claro', 'oscuro'])('tema %s', (modo) => {
  const c = temas[modo];

  test.each([
    ['texto sobre fondo', c.texto, c.fondo],
    ['texto sobre superficie', c.texto, c.superficie],
    ['texto suave sobre fondo', c.textoSuave, c.fondo],
    ['texto suave sobre superficie', c.textoSuave, c.superficie],
    ['texto del botón principal', c.sobrePrincipal, c.principal],
    ['texto del precio', c.sobrePrecio, c.precio],
    ['texto de "Gratis"', c.sobreGratis, c.gratis],
    ['error sobre fondo', c.error, c.fondo],
  ])('%s llega a 4,5:1', (_nombre, texto, fondo) => {
    expect(contraste(texto, fondo)).toBeGreaterThanOrEqual(TEXTO_NORMAL);
  });

  test.each([
    ['marco sobre fondo', c.marco, c.fondo],
    ['marco sobre superficie', c.marco, c.superficie],
    ['indicador de pestaña sobre fondo', c.indicador, c.fondo],
  ])('%s llega a 3:1', (_nombre, color, fondo) => {
    expect(contraste(color, fondo)).toBeGreaterThanOrEqual(CONTROLES);
  });
});

test.each(Object.entries(parejasCategoria))('el texto sobre la categoría %s se lee', (_cat, pareja) => {
  expect(contraste(pareja.texto, pareja.fondo)).toBeGreaterThanOrEqual(TEXTO_NORMAL);
});

test.each(parejasSerie.map((p, i) => [i + 1, p] as const))('el texto sobre la pareja %i de la serie se lee', (_i, pareja) => {
  expect(contraste(pareja.texto, pareja.fondo)).toBeGreaterThanOrEqual(TEXTO_NORMAL);
});
