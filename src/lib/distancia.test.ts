import { describe, expect, test } from '@jest/globals';

import { distanciaEnMetros, distanciaRedonda, esPuntoValido, redondearPunto } from './distancia';

const ayuntamiento = { lat: 39.4699, lng: -0.3763 };
const malvarrosa = { lat: 39.478, lng: -0.325 };

describe('distancia entre dos puntos', () => {
  test('del Ayuntamiento a la Malva-rosa hay unos 4,5 km', () => {
    const metros = distanciaEnMetros(ayuntamiento, malvarrosa);
    expect(metros).toBeGreaterThan(4400);
    expect(metros).toBeLessThan(4600);
  });
  test('da igual el sentido, y de un punto a sí mismo es 0', () => {
    expect(distanciaEnMetros(malvarrosa, ayuntamiento)).toBeCloseTo(distanciaEnMetros(ayuntamiento, malvarrosa), 6);
    expect(distanciaEnMetros(ayuntamiento, ayuntamiento)).toBe(0);
  });
  test('de Valencia a Madrid hay unos 300 km', () => {
    expect(Math.round(distanciaEnMetros(ayuntamiento, { lat: 40.4168, lng: -3.7038 }) / 1000)).toBeGreaterThan(295);
    expect(Math.round(distanciaEnMetros(ayuntamiento, { lat: 40.4168, lng: -3.7038 }) / 1000)).toBeLessThan(310);
  });
});

describe('la distancia, como se dice en la calle', () => {
  test('menos de 1 km: en metros, de 50 en 50', () => {
    expect(distanciaRedonda(0)).toEqual({ unidad: 'm', valor: 50 });
    expect(distanciaRedonda(30)).toEqual({ unidad: 'm', valor: 50 });
    expect(distanciaRedonda(130)).toEqual({ unidad: 'm', valor: 150 });
    expect(distanciaRedonda(612)).toEqual({ unidad: 'm', valor: 600 });
    expect(distanciaRedonda(974)).toEqual({ unidad: 'm', valor: 950 });
  });
  test('de 1 a 10 km: con un decimal', () => {
    expect(distanciaRedonda(975)).toEqual({ unidad: 'km', valor: 1 });
    expect(distanciaRedonda(1240)).toEqual({ unidad: 'km', valor: 1.2 });
    expect(distanciaRedonda(4490)).toEqual({ unidad: 'km', valor: 4.5 });
    expect(distanciaRedonda(9940)).toEqual({ unidad: 'km', valor: 9.9 });
  });
  test('más de 10 km: sin decimales', () => {
    expect(distanciaRedonda(9960)).toEqual({ unidad: 'km', valor: 10 });
    expect(distanciaRedonda(302400)).toEqual({ unidad: 'km', valor: 302 });
  });
});

describe('la posición que sale del móvil', () => {
  test('se redondea a unos 100 m antes de mandarla', () => {
    expect(redondearPunto({ lat: 39.469912, lng: -0.376288 })).toEqual({ lat: 39.47, lng: -0.376 });
  });
  test('solo vale si es un punto del mapa', () => {
    expect(esPuntoValido(ayuntamiento)).toBe(true);
    for (const malo of [null, undefined, { lat: 91, lng: 0 }, { lat: 0, lng: -181 }, { lat: NaN, lng: 0 }]) expect(esPuntoValido(malo)).toBe(false);
  });
});
