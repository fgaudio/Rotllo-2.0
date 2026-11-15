import { describe, expect, jest, test } from '@jest/globals';

import { esEmailValido, leerEnlace, limpiarEmail, tipoDeError } from './auth';

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

describe('el enlace del correo', () => {
  const llaves = 'access_token=aaa.bbb.ccc&expires_in=3600&refresh_token=r3fr3sh&token_type=bearer&type=magiclink';

  test('trae las dos llaves de la sesión detrás de la almohadilla', () => {
    const esperado = { ok: true, accessToken: 'aaa.bbb.ccc', refreshToken: 'r3fr3sh' };
    expect(leerEnlace(`https://rotllo.app/entrar/enlace#${llaves}`)).toEqual(esperado);
    expect(leerEnlace(`rotllo://entrar/enlace#${llaves}`)).toEqual(esperado);
    expect(leerEnlace(`http://localhost:8081/entrar/enlace?idioma=es#${llaves}`)).toEqual(esperado);
  });
  test('caducado o ya usado: Supabase manda un error en vez de las llaves', () => {
    const error = 'error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    expect(leerEnlace(`https://rotllo.app/entrar/enlace?${error}#${error}`)).toEqual({ ok: false });
    expect(leerEnlace(`rotllo://entrar/enlace#${error}`)).toEqual({ ok: false });
    expect(leerEnlace(`rotllo://entrar/enlace?${error}#${llaves}`)).toEqual({ ok: false });
  });
  test('incompleto o vacío no vale', () => {
    for (const malo of [null, undefined, '', 'rotllo://entrar/enlace', 'rotllo://entrar/enlace#', 'rotllo://entrar/enlace#access_token=aaa', 'rotllo://entrar/enlace#refresh_token=r3fr3sh', 'rotllo://entrar/enlace#access_token=&refresh_token=', 'rotllo://entrar/enlace#access_token=%E0%A4%A&refresh_token=x'])
      expect(leerEnlace(malo)).toEqual({ ok: false });
  });
});

describe('errores de Supabase explicados según el paso', () => {
  test('demasiados intentos, en cualquier paso', () => {
    expect(tipoDeError({ status: 429, code: 'over_email_send_rate_limit' }, 'enviar')).toBe('espera');
    expect(tipoDeError({ status: 429 }, 'entrar')).toBe('espera');
  });
  test('sin conexión o servidor caído, en cualquier paso', () => {
    expect(tipoDeError({ status: 0 }, 'enviar')).toBe('red');
    expect(tipoDeError({ status: 503 }, 'entrar')).toBe('red');
    expect(tipoDeError({ message: 'Network request failed' }, 'fecha')).toBe('red');
    expect(tipoDeError(null, 'borrar')).toBe('red');
  });
  test('al enviar: email que Supabase no acepta', () => {
    expect(tipoDeError({ status: 400, code: 'email_address_invalid' }, 'enviar')).toBe('email');
    expect(tipoDeError({ status: 400, code: 'otra_cosa' }, 'enviar')).toBe('red');
  });
  test('al entrar con el enlace: cualquier rechazo es del enlace, nunca del email', () => {
    expect(tipoDeError({ status: 403, code: 'bad_jwt' }, 'entrar')).toBe('enlace');
    expect(tipoDeError({ status: 400, code: 'validation_failed' }, 'entrar')).toBe('enlace');
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
