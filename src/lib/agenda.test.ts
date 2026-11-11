import { describe, expect, test } from '@jest/globals';

import { agruparPorDia, diaDe, inminencia, momentoDelDia } from './agenda';
import { instanteValencia } from './filtros';

// Miércoles 11 de noviembre de 2026, 21:00 en Valencia.
const ahora = instanteValencia(2026, 11, 11, 21);
const plan = (d: number, h: number, fin?: Date) => ({ empiezaEn: instanteValencia(2026, 11, d, h).toISOString(), terminaEn: fin ? fin.toISOString() : null });

describe('cuándo es un plan', () => {
  test('esta noche y de madrugada son "hoy"', () => {
    expect(diaDe(plan(11, 23), ahora).cuando).toBe('hoy');
    expect(diaDe(plan(12, 2), ahora).cuando).toBe('hoy'); // las 02:00 del jueves siguen siendo la noche del miércoles
  });
  test('mañana empieza a las 06:00', () => {
    expect(diaDe(plan(12, 6), ahora).cuando).toBe('manana');
    expect(diaDe(plan(13, 3), ahora).cuando).toBe('manana'); // madrugada del viernes = noche del jueves
  });
  test('el resto', () => {
    const { cuando, dia } = diaDe(plan(13, 23), ahora);
    expect(cuando).toBe('otro');
    expect(dia.toISOString().slice(0, 10)).toBe('2026-11-13');
  });
  test('un plan que empezó ayer y sigue abierto cuenta como de hoy', () => {
    expect(diaDe(plan(10, 23), ahora).cuando).toBe('hoy');
  });
});

describe('empieza pronto', () => {
  test('faltan 2 horas', () => {
    expect(inminencia(plan(11, 23), ahora)).toEqual({ estado: 'pronto', horas: 2, minutos: 0 });
  });
  test('faltan 40 minutos', () => {
    const p = { empiezaEn: new Date(ahora.getTime() + 40 * 60000).toISOString(), terminaEn: null };
    expect(inminencia(p, ahora)).toEqual({ estado: 'pronto', horas: 0, minutos: 40 });
  });
  test('faltan más de 6 horas: no se avisa', () => {
    expect(inminencia(plan(12, 13), ahora)).toBeNull();
  });
  test('ya ha empezado', () => {
    expect(inminencia(plan(11, 20), ahora)).toEqual({ estado: 'en-curso' });
  });
  test('ya ha terminado (sin hora de fin: 6 h después)', () => {
    expect(inminencia(plan(11, 14), ahora)).toBeNull();
    expect(inminencia(plan(11, 14, instanteValencia(2026, 11, 11, 22)), ahora)).toEqual({ estado: 'en-curso' });
  });
});

test('agrupa por día de noche, en orden', () => {
  const grupos = agruparPorDia([plan(11, 23), plan(12, 1), plan(13, 23), plan(14, 11), plan(14, 13)], ahora);
  expect(grupos.map((g) => [g.clave, g.cuando, g.planes.length])).toEqual([
    ['2026-11-11', 'hoy', 2],
    ['2026-11-13', 'otro', 1],
    ['2026-11-14', 'otro', 2],
  ]);
});

test('momento del día para el titular', () => {
  expect(momentoDelDia(instanteValencia(2026, 11, 11, 10))).toBe('hoy');
  expect(momentoDelDia(instanteValencia(2026, 11, 11, 17))).toBe('tarde');
  expect(momentoDelDia(instanteValencia(2026, 11, 11, 22))).toBe('noche');
  expect(momentoDelDia(instanteValencia(2026, 11, 12, 3))).toBe('noche');
});
