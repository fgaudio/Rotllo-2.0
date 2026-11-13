import { describe, expect, jest, test } from '@jest/globals';

import { crearSlug, limpiarInstagram, validarAlta, type DatosAlta } from './locales';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

describe('dirección web del local', () => {
  test('sin tildes, en minúsculas y con guiones', () => {
    expect(crearSlug('Café Mercedes Jazz')).toBe('cafe-mercedes-jazz');
    expect(crearSlug("  L'Umbracle & Mya!  ")).toBe('l-umbracle-mya');
    expect(crearSlug('Ñam Ñam Bar')).toBe('nam-nam-bar');
  });
  test('nombres muy largos se cortan sin dejar un guion al final', () => {
    const slug = crearSlug('a'.repeat(58) + ' bar de la esquina');
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith('-')).toBe(false);
  });
  test('nombres sin letras válidas tienen un respaldo que la base de datos acepta', () => {
    for (const raro of ['!!!', 'Ω', 'a']) expect(crearSlug(raro)).toMatch(/^[a-z0-9-]{2,80}$/);
  });
});

describe('Instagram', () => {
  test('acepta la cuenta con @, sin @ o como enlace', () => {
    expect(limpiarInstagram('@Mercedes.Jazz')).toBe('mercedes.jazz');
    expect(limpiarInstagram('mercedes_jazz')).toBe('mercedes_jazz');
    expect(limpiarInstagram('https://www.instagram.com/mercedes.jazz/?hl=es')).toBe('mercedes.jazz');
  });
  test('vacío vale (es opcional)', () => {
    expect(limpiarInstagram('   ')).toBe('');
  });
  test('lo que no puede ser una cuenta se rechaza', () => {
    for (const malo of ['mercedes jazz', 'café', 'a'.repeat(31), 'https://tiktok.com/@x']) expect(limpiarInstagram(malo)).toBeNull();
  });
});

describe('alta del local', () => {
  const bien: DatosAlta = {
    nombre: 'Bar La Placeta',
    tipo: 'bar',
    direccion: 'Plaça del Tossal 3, Valencia',
    punto: { lat: 39.4766, lng: -0.3798 },
    barrio: 'el Carmen',
    instagram: '',
    emailContacto: 'hola@laplaceta.es',
  };
  test('todo bien', () => {
    expect(validarAlta(bien)).toEqual([]);
  });
  test('dice qué campos faltan', () => {
    expect(validarAlta({ ...bien, nombre: ' ', tipo: null, emailContacto: 'hola@' })).toEqual(['nombre', 'tipo', 'emailContacto']);
  });
  test('la dirección tiene que estar encontrada en el mapa', () => {
    expect(validarAlta({ ...bien, punto: null })).toEqual(['direccion']);
  });
  test('Instagram mal escrito', () => {
    expect(validarAlta({ ...bien, instagram: 'la placeta bar' })).toEqual(['instagram']);
  });
});
