import { describe, expect, test } from '@jest/globals';

import { interpretar } from './geocodificar';

// Una respuesta real del buscador para "Calle de Sueca 27, Valencia" (recortada).
const sueca = [
  {
    lat: '39.4620410',
    lon: '-0.3753848',
    display_name: '27, Calle de Sueca, Ruzafa, Ensanche, Valencia, Comunidad Valenciana, 46006, España',
    address: { house_number: '27', road: 'Calle de Sueca', neighbourhood: 'Ruzafa', suburb: 'Ensanche', city: 'Valencia' },
  },
];

describe('respuesta del buscador de direcciones', () => {
  test('dirección con número: punto, dirección limpia y barrio', () => {
    expect(interpretar(sueca)).toEqual({ lat: 39.462041, lng: -0.3753848, direccion: 'Calle de Sueca 27, Valencia', barrio: 'Ruzafa' });
  });
  test('sin número ni barrio pequeño: usa el distrito', () => {
    const lugar = interpretar([{ lat: '39.47', lon: '-0.33', address: { road: 'Carrer de la Reina', suburb: 'Poblats Marítims', city: 'València' } }]);
    expect(lugar).toMatchObject({ direccion: 'Carrer de la Reina, València', barrio: 'Poblats Marítims' });
  });
  test('una plaza o un paseo también valen', () => {
    expect(interpretar([{ lat: '39.47', lon: '-0.38', address: { square: 'Plaça del Tossal', house_number: '3', city: 'Valencia' } }])?.direccion).toBe('Plaça del Tossal 3, Valencia');
  });
  test('sin calle: el principio del nombre largo', () => {
    expect(interpretar([{ lat: '39.46', lon: '-0.32', display_name: 'La Marina de València, Poblats Marítims, Valencia', address: {} }])?.direccion).toBe('La Marina de València, Poblats Marítims');
  });
  test('sin resultados o con datos rotos: nada', () => {
    expect(interpretar([])).toBeNull();
    expect(interpretar(null)).toBeNull();
    expect(interpretar({ error: 'x' })).toBeNull();
    expect(interpretar([{ lat: 'abc', lon: '-0.3', address: { road: 'X' } }])).toBeNull();
  });
});
