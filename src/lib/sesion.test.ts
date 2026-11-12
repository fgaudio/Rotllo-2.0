import { expect, jest, test } from '@jest/globals';

import { siguientePaso } from './sesion';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

const conSesion = (perfil: 'cargando' | 'incompleto' | 'activo' | 'bloqueado' | 'sin-datos') =>
  ({ estado: 'con-sesion', userId: 'u1', email: 'a@b.es', perfil }) as const;

test('qué toca hacer según la sesión', () => {
  expect(siguientePaso({ estado: 'cargando' })).toBe('esperar');
  expect(siguientePaso({ estado: 'sin-sesion' })).toBe('entrar');
  expect(siguientePaso(conSesion('cargando'))).toBe('esperar');
  expect(siguientePaso(conSesion('incompleto'))).toBe('fecha-nacimiento');
  expect(siguientePaso(conSesion('activo'))).toBe('listo');
  expect(siguientePaso(conSesion('bloqueado'))).toBe('listo');
  // Sin conexión no se sabe si el perfil está completo: no se pide la fecha otra vez.
  expect(siguientePaso(conSesion('sin-datos'))).toBe('listo');
});
