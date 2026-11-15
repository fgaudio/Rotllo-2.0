import { expect, jest, test } from '@jest/globals';

import { conOrigenRotllo } from './planes';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

test('el enlace a la ticketera lleva el origen "rotllo"', () => {
  expect(conOrigenRotllo('https://entradas.milocal.es/salsa')).toBe('https://entradas.milocal.es/salsa?utm_source=rotllo');
  expect(conOrigenRotllo('https://xceed.me/event/x?lang=es')).toBe('https://xceed.me/event/x?lang=es&utm_source=rotllo');
});
test('si el local ya puso su propio origen, se respeta', () => {
  expect(conOrigenRotllo('https://entradas.es/x?utm_source=instagram')).toBe('https://entradas.es/x?utm_source=instagram');
});
test('sin enlace, o con uno raro, no se rompe', () => {
  expect(conOrigenRotllo(null)).toBeNull();
  expect(conOrigenRotllo('no es un enlace')).toBe('no es un enlace');
});
