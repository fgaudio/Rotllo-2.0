import { describe, expect, jest, test } from '@jest/globals';

import { esCodigoValido, esEmailValido, limpiarEmail, tipoDeError } from './auth';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

describe('email', () => {
  test('se limpia antes de usarlo', () => {
    expect(limpiarEmail('  Fran@Ejemplo.COM ')).toBe('fran@ejemplo.com');
  });
  test('avisa de erratas evidentes', () => {
    expect(esEmailValido('fran@ejemplo.com')).toBe(true);
    for (const malo of ['', 'fran', 'fran@', 'fran@ejemplo', 'fran @ejemplo.com', '@ejemplo.com']) expect(esEmailValido(malo)).toBe(false);
  });
});

test('el código tiene de 6 a 10 cifras', () => {
  for (const bueno of ['123456', '12345678', '1234567890']) expect(esCodigoValido(bueno)).toBe(true);
  for (const malo of ['', '12345', '12345678901', '12a456', '123 456']) expect(esCodigoValido(malo)).toBe(false);
});

describe('errores de Supabase explicados según el paso', () => {
  test('demasiados intentos, en cualquier paso', () => {
    expect(tipoDeError({ status: 429, code: 'over_email_send_rate_limit' }, 'enviar')).toBe('espera');
    expect(tipoDeError({ status: 429 }, 'verificar')).toBe('espera');
  });
  test('sin conexión o servidor caído, en cualquier paso', () => {
    expect(tipoDeError({ status: 0 }, 'enviar')).toBe('red');
    expect(tipoDeError({ status: 503 }, 'verificar')).toBe('red');
    expect(tipoDeError({ message: 'Network request failed' }, 'fecha')).toBe('red');
    expect(tipoDeError(null, 'borrar')).toBe('red');
  });
  test('al enviar: email que Supabase no acepta', () => {
    expect(tipoDeError({ status: 400, code: 'email_address_invalid' }, 'enviar')).toBe('email');
    expect(tipoDeError({ status: 400, code: 'otra_cosa' }, 'enviar')).toBe('red');
  });
  test('al verificar: cualquier rechazo es del código, nunca del email', () => {
    expect(tipoDeError({ status: 403, code: 'otp_expired' }, 'verificar')).toBe('codigo');
    expect(tipoDeError({ status: 400, code: 'validation_failed' }, 'verificar')).toBe('codigo');
  });
  test('al guardar la fecha: menor de 18', () => {
    expect(tipoDeError({ status: 400, code: '23514' }, 'fecha')).toBe('menor');
    expect(tipoDeError({ status: 403, code: '42501' }, 'fecha')).toBe('red');
  });
  test('al borrar la cuenta: única propietaria de un local', () => {
    expect(tipoDeError({ status: 400, code: 'RT001' }, 'borrar')).toBe('local');
    expect(tipoDeError({ status: 400, code: '23514' }, 'borrar')).toBe('local');
  });
});
