// Entrar, salir y borrar la cuenta (Supabase Auth, ADR-002).
// Se entra con el email y un enlace que llega al correo: sin contraseñas ni códigos (docs/login.md).
// Estas funciones nunca lanzan errores: devuelven { ok } o { ok: false, error } con un motivo
// que las pantallas saben explicar.
import * as Linking from 'expo-linking';

import { supabase } from './supabase';

export type ErrorAuth =
  | 'sin-servicio' // la app está en modo de ejemplo (sin claves de Supabase)
  | 'email' // el email no vale
  | 'espera' // demasiados intentos seguidos: hay que esperar
  | 'enlace' // el enlace del correo ha caducado, ya se usó o está incompleto
  | 'menor' // la fecha de nacimiento es de menor de 18 (lo dice la base de datos)
  | 'local' // es la única persona propietaria de un local: no puede borrar la cuenta
  | 'red'; // sin conexión o fallo del servidor

export type Resultado = { ok: true } | { ok: false; error: ErrorAuth };

const OK: Resultado = { ok: true };
const fallo = (error: ErrorAuth): Resultado => ({ ok: false, error });

export const ESPERA_REENVIO_S = 60; // Supabase deja pedir un enlace por email cada 60 segundos

// Comprobación básica para avisar de erratas antes de enviar nada.
const PARECE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function limpiarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function esEmailValido(email: string): boolean {
  return PARECE_EMAIL.test(limpiarEmail(email));
}

type ErrorSupabase = { code?: string; status?: number; message?: string } | null;

type Paso = 'enviar' | 'entrar' | 'fecha' | 'borrar';

// Traduce un error de Supabase a uno de los nuestros. El mismo código significa cosas distintas
// según lo que se estuviera haciendo, por eso hace falta saber el paso.
export function tipoDeError(error: ErrorSupabase, paso: Paso): ErrorAuth {
  const { code, status } = error ?? {};
  if (status === 429 || code?.includes('rate_limit')) return 'espera';
  if (status === 0 || status === undefined || status >= 500) return 'red';
  switch (paso) {
    case 'enviar':
      return code === 'email_address_invalid' || code === 'validation_failed' || code === 'email_address_not_authorized' ? 'email' : 'red';
    case 'entrar':
      return 'enlace'; // cualquier rechazo aquí es que el enlace no vale o ha caducado
    case 'fecha':
      return code === '23514' ? 'menor' : 'red'; // 23514 = la regla de los 18 años
    case 'borrar':
      // RT001 lo lanza borrar_mi_cuenta; 23514, el trigger que protege a los locales (por si dos
      // propietarios se borran a la vez).
      return code === 'RT001' || code === '23514' ? 'local' : 'red';
  }
}

// Ruta de la app que recibe el enlace del correo (src/app/entrar/enlace.tsx).
export const RUTA_ENLACE = '/entrar/enlace';

// Dirección a la que Supabase devuelve a la persona después de tocar el enlace del correo.
// En el navegador es https://<la web>/entrar/enlace; en la app instalada, rotllo://entrar/enlace.
// Tiene que estar en la lista de «Redirect URLs» de Supabase (docs/login.md).
export function urlDeVuelta(): string {
  return Linking.createURL(RUTA_ENLACE);
}

// Paso 1: manda el enlace al email. Si la cuenta no existe, se crea.
export async function enviarEnlace(email: string): Promise<Resultado> {
  if (!supabase) return fallo('sin-servicio');
  if (!esEmailValido(email)) return fallo('email');
  try {
    const { error } = await supabase.auth.signInWithOtp({ email: limpiarEmail(email), options: { shouldCreateUser: true, emailRedirectTo: urlDeVuelta() } });
    return error ? fallo(tipoDeError(error, 'enviar')) : OK;
  } catch {
    return fallo('red');
  }
}

export type Enlace = { ok: true; accessToken: string; refreshToken: string } | { ok: false };

// Lee los datos que Supabase añade a la dirección de vuelta. Si todo ha ido bien, vienen las dos
// llaves de la sesión detrás de la almohadilla (#access_token=…&refresh_token=…). Si el enlace ha
// caducado o ya se usó, viene un error (error_code=otp_expired) y ninguna llave.
export function leerEnlace(url: string | null | undefined): Enlace {
  if (!url) return { ok: false };
  const datos = new Map<string, string>();
  const [antes, ...resto] = url.split('#');
  const consulta = antes.includes('?') ? antes.slice(antes.indexOf('?') + 1) : '';
  for (const trozo of [consulta, resto.join('#')]) {
    for (const par of trozo.split('&')) {
      const igual = par.indexOf('=');
      if (igual <= 0) continue;
      try {
        datos.set(par.slice(0, igual), decodeURIComponent(par.slice(igual + 1).replace(/\+/g, ' ')));
      } catch {
        // Un valor mal escrito se ignora: el enlace se dará por no válido.
      }
    }
  }
  const accessToken = datos.get('access_token');
  const refreshToken = datos.get('refresh_token');
  if (datos.has('error') || datos.has('error_code') || !accessToken || !refreshToken) return { ok: false };
  return { ok: true, accessToken, refreshToken };
}

// Paso 2: la app se abre con el enlace del correo. Si trae las llaves, la sesión queda abierta
// y guardada en el móvil.
export async function entrarConEnlace(url: string | null | undefined): Promise<Resultado> {
  if (!supabase) return fallo('sin-servicio');
  const enlace = leerEnlace(url);
  if (!enlace.ok) return fallo('enlace');
  try {
    const { error } = await supabase.auth.setSession({ access_token: enlace.accessToken, refresh_token: enlace.refreshToken });
    return error ? fallo(tipoDeError(error, 'entrar')) : OK;
  } catch {
    return fallo('red');
  }
}

// La fecha de nacimiento se guarda una sola vez. La base de datos comprueba los 18 años y,
// si está bien, pasa el perfil a "activo".
export async function guardarFechaNacimiento(fechaIso: string): Promise<Resultado> {
  if (!supabase) return fallo('sin-servicio');
  try {
    const { data: sesion } = await supabase.auth.getSession();
    const id = sesion.session?.user.id;
    if (!id) return fallo('red');
    // Con .select() la base de datos devuelve la fila cambiada: así se sabe que se ha guardado de verdad.
    const { data, error, status } = await supabase.from('perfiles_privados').update({ fecha_nacimiento: fechaIso }).eq('id', id).select('estado');
    if (error) return fallo(tipoDeError({ ...error, status }, 'fecha'));
    return data.length === 1 ? OK : fallo('red');
  } catch {
    return fallo('red');
  }
}

export async function cerrarSesion(): Promise<void> {
  // 'local': cierra la sesión de este móvil aunque no haya conexión.
  await supabase?.auth.signOut({ scope: 'local' }).catch(() => undefined);
}

// Borra la cuenta y todos sus datos (función borrar_mi_cuenta de la base de datos).
export async function borrarCuenta(): Promise<Resultado> {
  if (!supabase) return fallo('sin-servicio');
  try {
    const { error, status } = await supabase.rpc('borrar_mi_cuenta');
    if (error) return fallo(tipoDeError({ ...error, status }, 'borrar'));
    await cerrarSesion();
    return OK;
  } catch {
    return fallo('red');
  }
}
