import { expect, jest, test } from '@jest/globals';

import { accionAlCambiarSesion, alternarEn, mezclarGuardados } from './guardados';

// En los tests no hay móvil: se sustituye el almacenamiento por uno de mentira.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

test('guardar pone el plan el primero; guardar otra vez lo quita', () => {
  expect(alternarEn([], 'a')).toEqual(['a']);
  expect(alternarEn(['a'], 'b')).toEqual(['b', 'a']);
  expect(alternarEn(['b', 'a'], 'b')).toEqual(['a']);
});

test('al entrar se juntan los del móvil y los de la cuenta, sin repetir', () => {
  expect(mezclarGuardados(['a', 'b'], ['b', 'c'])).toEqual(['a', 'b', 'c']);
  expect(mezclarGuardados([], ['c'])).toEqual(['c']);
  expect(mezclarGuardados(['a'], [])).toEqual(['a']);
});

test('al cambiar la sesión: sincronizar al entrar, vaciar al salir', () => {
  // Entra una cuenta completa
  expect(accionAlCambiarSesion({ habiaSesion: false, cuentaAntes: null, haySesion: true, cuentaAhora: 'ana' })).toBe('sincronizar');
  // Se renueva la sesión de la misma cuenta: nada
  expect(accionAlCambiarSesion({ habiaSesion: true, cuentaAntes: 'ana', haySesion: true, cuentaAhora: 'ana' })).toBe('nada');
  // Cierra sesión una cuenta completa
  expect(accionAlCambiarSesion({ habiaSesion: true, cuentaAntes: 'ana', haySesion: false, cuentaAhora: null })).toBe('vaciar');
  // Cierra sesión alguien con el perfil a medias: sus guardados tampoco se quedan en el móvil
  expect(accionAlCambiarSesion({ habiaSesion: true, cuentaAntes: null, haySesion: false, cuentaAhora: null })).toBe('vaciar');
  // Perfil a medias que se completa: ahora sí se sincroniza
  expect(accionAlCambiarSesion({ habiaSesion: true, cuentaAntes: null, haySesion: true, cuentaAhora: 'ana' })).toBe('sincronizar');
  // Alguien sin cuenta que abre la app: sus guardados del móvil no se tocan
  expect(accionAlCambiarSesion({ habiaSesion: false, cuentaAntes: null, haySesion: false, cuentaAhora: null })).toBe('nada');
});
