import { describe, expect, jest, test } from '@jest/globals';

import { medidaParaEncoger, rutaDeFoto } from './fotos';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));
// En los tests no hay galería ni editor de imágenes.
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('expo-image-manipulator', () => ({ ImageManipulator: { manipulate: jest.fn() }, SaveFormat: { JPEG: 'jpeg' } }));

describe('encoger la foto antes de subirla', () => {
  test('una foto grande se queda en 1600 px por su lado más largo', () => {
    expect(medidaParaEncoger(4000, 3000)).toEqual({ width: 1600 }); // apaisada
    expect(medidaParaEncoger(3024, 4032)).toEqual({ height: 1600 }); // vertical, como un flyer
    expect(medidaParaEncoger(2000, 2000)).toEqual({ width: 1600 });
  });
  test('una foto pequeña no se toca (agrandarla solo la estropea)', () => {
    expect(medidaParaEncoger(1080, 1350)).toBeNull();
    expect(medidaParaEncoger(1600, 900)).toBeNull();
  });
  test('medidas que no valen', () => {
    expect(medidaParaEncoger(0, 0)).toBeNull();
    expect(medidaParaEncoger(NaN, 100)).toBeNull();
  });
});

describe('dónde se guarda', () => {
  const plan = 'b0000000-0000-4000-8000-000000000001';
  test('en la carpeta del plan, que es lo que comprueba la base de datos', () => {
    expect(rutaDeFoto(plan, 1794600000000, 0.5)).toMatch(new RegExp(`^${plan}/[a-z0-9]+-[a-z0-9]+\\.jpg$`));
  });
  test('dos fotos del mismo plan no comparten nombre', () => {
    expect(rutaDeFoto(plan, 1, 0.1)).not.toBe(rutaDeFoto(plan, 2, 0.1));
    expect(rutaDeFoto(plan, 1, 0.1)).not.toBe(rutaDeFoto(plan, 1, 0.2));
  });
});
