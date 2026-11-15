import { expect, jest, test } from '@jest/globals';

import { nombreDeArchivo, tamanoDeTitulo } from './historia';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));
// En los tests no hay pantalla que fotografiar ni menú de compartir.
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

test('el archivo se llama como el plan, sin tildes ni espacios', () => {
  expect(nombreDeArchivo('Noche de salsa')).toBe('rotllo-noche-de-salsa.png');
  expect(nombreDeArchivo('Vóley en la playa ☀️')).toBe('rotllo-voley-en-la-playa.png');
  expect(nombreDeArchivo('!!!')).toBe('rotllo-plan-rotllo.png');
});

test('el título se hace más pequeño cuanto más largo es', () => {
  expect(tamanoDeTitulo('Noche de salsa')).toBe(46);
  expect(tamanoDeTitulo('Taller de paella valenciana')).toBe(38);
  expect(tamanoDeTitulo('Intercambio de idiomas con cena incluida')).toBe(31);
  expect(tamanoDeTitulo('a'.repeat(80))).toBe(26);
});
