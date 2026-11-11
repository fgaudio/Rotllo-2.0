import { expect, jest, test } from '@jest/globals';

import { alternarEn } from './guardados';

// En los tests no hay móvil: se sustituye el almacenamiento por uno de mentira.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}));

test('guardar pone el plan el primero; guardar otra vez lo quita', () => {
  expect(alternarEn([], 'a')).toEqual(['a']);
  expect(alternarEn(['a'], 'b')).toEqual(['b', 'a']);
  expect(alternarEn(['b', 'a'], 'b')).toEqual(['a']);
});
