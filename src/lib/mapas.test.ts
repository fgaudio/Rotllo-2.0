import { describe, expect, test } from '@jest/globals';

import { appsDeMapas, enlaceComoLlegar, puntoDeEwkb } from './mapas';

// Café en Calle de Sueca 27, Valencia.
const destino = { lat: 39.462041, lng: -0.3753848, direccion: 'Calle de Sueca 27, Valencia' };

describe('enlaces de "Cómo llegar"', () => {
  test('Google Maps: formato oficial de Maps URLs, con el punto exacto', () => {
    expect(enlaceComoLlegar(destino, 'google')).toBe('https://www.google.com/maps/dir/?api=1&destination=39.462041%2C-0.375385');
  });
  test('Apple Maps: formato oficial de Map Links, con el punto exacto', () => {
    expect(enlaceComoLlegar(destino, 'apple')).toBe('https://maps.apple.com/?daddr=39.462041%2C-0.375385');
  });
  test('sin punto válido, se manda la dirección escrita', () => {
    for (const malo of [{ lat: NaN, lng: 0 }, { lat: 0, lng: 0 }, { lat: 120, lng: -0.37 }, { lat: 39.4, lng: 500 }]) {
      expect(enlaceComoLlegar({ ...malo, direccion: 'Calle de Sueca 27, Valencia' }, 'google')).toBe(
        'https://www.google.com/maps/dir/?api=1&destination=Calle%20de%20Sueca%2027%2C%20Valencia',
      );
    }
    expect(enlaceComoLlegar({ lat: NaN, lng: NaN, direccion: 'Plaça del Tossal 3' }, 'apple')).toBe('https://maps.apple.com/?daddr=Pla%C3%A7a%20del%20Tossal%203');
  });
  test('sin punto ni dirección no hay enlace', () => {
    expect(enlaceComoLlegar({ lat: NaN, lng: NaN }, 'google')).toBeNull();
    expect(enlaceComoLlegar({ lat: NaN, lng: NaN, direccion: '  ' }, 'apple')).toBeNull();
  });
  test('en iPhone va primero Apple Maps; en el resto, Google Maps. Siempre están las dos', () => {
    expect(appsDeMapas('ios')).toEqual(['apple', 'google']);
    expect(appsDeMapas('android')).toEqual(['google', 'apple']);
    expect(appsDeMapas('web')).toEqual(['google', 'apple']);
  });
});

describe('ubicación guardada en la base de datos', () => {
  test('un punto tal como lo devuelve la API', () => {
    // st_makepoint(-0.3753848, 39.462041) como geography, sacado de Postgres
    const punto = puntoDeEwkb('0101000020E61000009197DAF74D06D8BFA034D42824BB4340');
    expect(punto?.lat).toBeCloseTo(39.462041, 6);
    expect(punto?.lng).toBeCloseTo(-0.3753848, 6);
  });
  test('lo que no es un punto se ignora', () => {
    for (const malo of [null, '', 'hola', '0101', '0102000020E6100000', 42]) expect(puntoDeEwkb(malo)).toBeNull();
  });
});
