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

describe('el enlace del correo (PKCE)', () => {
  const codigo = '3f1c2b9a-7d4e-4a1b-9c2d-5e6f7a8b9c0d';
  const flujo = '0123456789abcdef0123456789abcdef';

  test('trae un código de un solo uso y el flujo al que pertenece', () => {
    const esperado = { tipo: 'codigo', codigo, flujo };
    expect(leerEnlace(`https://rotllo.app/entrar/enlace?sb_flow_id=${flujo}&code=${codigo}`)).toEqual(esperado);
    expect(leerEnlace(`rotllo://entrar/enlace?code=${codigo}&sb_flow_id=${flujo}`)).toEqual(esperado);
    expect(leerEnlace(`http://localhost:8081/entrar/enlace?code=${codigo}`)).toEqual({ tipo: 'codigo', codigo, flujo: null });
  });
  test('un flujo con formato raro se ignora (la librería usa entonces la última clave guardada)', () => {
    expect(leerEnlace(`rotllo://entrar/enlace?code=${codigo}&sb_flow_id=../../otra`)).toEqual({ tipo: 'codigo', codigo, flujo: null });
  });
  test('caducado o ya usado: Supabase manda un error en vez del código', () => {
    const error = 'error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired';
    expect(leerEnlace(`https://rotllo.app/entrar/enlace?${error}#${error}`)).toEqual({ tipo: 'no-vale' });
    expect(leerEnlace(`rotllo://entrar/enlace?code=${codigo}#${error}`)).toEqual({ tipo: 'no-vale' });
  });
  test('unas llaves de sesión en la dirección NO valen: así nadie te mete en su cuenta (S3)', () => {
    const llaves = 'access_token=aaa.bbb.ccc&expires_in=3600&refresh_token=r3fr3sh&token_type=bearer&type=magiclink';
    expect(leerEnlace(`https://rotllo.app/entrar/enlace#${llaves}`)).toEqual({ tipo: 'no-vale' });
    expect(leerEnlace(`rotllo://entrar/enlace?${llaves}`)).toEqual({ tipo: 'no-vale' });
  });
  test('incompleto, vacío o con un código raro no vale', () => {
    for (const malo of [null, undefined, '', 'rotllo://entrar/enlace', 'rotllo://entrar/enlace?code=', 'rotllo://entrar/enlace?code=corto', 'rotllo://entrar/enlace?code=<script>alert(1)</script>', 'rotllo://entrar/enlace?code=%E0%A4%A'])
      expect(leerEnlace(malo)).toEqual({ tipo: 'no-vale' });
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
  test('al entrar con el enlace: si falta la clave del móvil, es que se pidió en otro dispositivo', () => {
    expect(tipoDeError({ status: 400, code: 'pkce_code_verifier_not_found' }, 'entrar')).toBe('otro-dispositivo');
    expect(tipoDeError({ status: 400, code: 'bad_code_verifier' }, 'entrar')).toBe('otro-dispositivo');
  });
  test('al entrar con el enlace: cualquier otro rechazo es del enlace, nunca del email', () => {
    expect(tipoDeError({ status: 404, code: 'flow_state_not_found' }, 'entrar')).toBe('enlace');
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
