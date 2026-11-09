import { describe, expect, test } from '@jest/globals';

import { aFechaIso, comprobarNacimiento, hoyEnValencia } from './edad';

const hoy = { dia: 9, mes: 11, anio: 2026 };

describe('fecha de nacimiento (+18)', () => {
  test('cumple 18 hoy: puede entrar', () => {
    expect(comprobarNacimiento('9', '11', '2008', hoy)).toEqual({ estado: 'ok', edad: 18 });
  });
  test('cumple 18 mañana: todavía no', () => {
    expect(comprobarNacimiento('10', '11', '2008', hoy).estado).toBe('menor');
  });
  test('adulto de cualquier edad', () => {
    expect(comprobarNacimiento('01', '02', '1990', hoy)).toEqual({ estado: 'ok', edad: 36 });
    expect(comprobarNacimiento('3', '4', '1950', hoy)).toEqual({ estado: 'ok', edad: 76 });
  });
  test('nacido un 29 de febrero: cumple el 1 de marzo si el año no es bisiesto', () => {
    expect(comprobarNacimiento('29', '2', '2008', { dia: 28, mes: 2, anio: 2026 }).estado).toBe('menor');
    expect(comprobarNacimiento('29', '2', '2008', { dia: 1, mes: 3, anio: 2026 }).estado).toBe('ok');
  });
  test('fechas que no existen o están mal escritas', () => {
    for (const [d, m, a] of [
      ['31', '2', '1999'],
      ['29', '2', '2001'],
      ['0', '5', '1999'],
      ['12', '13', '1999'],
      ['', '5', '1999'],
      ['5', '5', '99'],
      ['1a', '5', '1999'],
      ['1', '1', '1850'],
      ['1', '1', '2030'],
    ]) {
      expect(comprobarNacimiento(d, m, a, hoy).estado).toBe('invalida');
    }
  });
  test('hoy se cuenta en hora de Valencia', () => {
    // 31/12 a las 23:30 UTC ya es 1 de enero en Valencia
    expect(hoyEnValencia(new Date('2026-12-31T23:30:00Z'))).toEqual({ dia: 1, mes: 1, anio: 2027 });
  });
  test('formato de la base de datos', () => {
    expect(aFechaIso({ dia: 3, mes: 4, anio: 1999 })).toBe('1999-04-03');
  });
});
