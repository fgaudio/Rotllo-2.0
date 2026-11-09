import { describe, expect, test } from '@jest/globals';

import { buscarEnPlanes, normalizar } from './busqueda';
import type { Plan } from './tipos';

const plan = (id: string, titulo: string, local: string, barrio: string) => ({ id, titulo, local, barrio }) as Plan;
const planes = [
  plan('a', 'Noche de salsa', 'Café Mercedes Jazz', 'Russafa'),
  plan('b', 'Música en directo', 'Sala Moon', 'Benimaclet'),
  plan('c', 'Vermut y vinilos', 'Bar La Placeta', 'el Carmen'),
];
const ids = (lista: Plan[]) => lista.map((p) => p.id);

describe('búsqueda del feed', () => {
  test('sin texto, salen todos', () => {
    expect(ids(buscarEnPlanes(planes, '   '))).toEqual(['a', 'b', 'c']);
  });
  test('sin tildes ni mayúsculas', () => {
    expect(ids(buscarEnPlanes(planes, 'MUSICA'))).toEqual(['b']);
    expect(ids(buscarEnPlanes(planes, 'cafe'))).toEqual(['a']);
  });
  test('busca en el local y en el barrio', () => {
    expect(ids(buscarEnPlanes(planes, 'russafa'))).toEqual(['a']);
    expect(ids(buscarEnPlanes(planes, 'placeta'))).toEqual(['c']);
  });
  test('varias palabras: tienen que estar todas', () => {
    expect(ids(buscarEnPlanes(planes, 'vermut carmen'))).toEqual(['c']);
    expect(ids(buscarEnPlanes(planes, 'vermut russafa'))).toEqual([]);
  });
  test('normalizar quita signos', () => {
    expect(normalizar('¡Vóley, en la PLAYA!')).toBe('voley en la playa');
  });
});
