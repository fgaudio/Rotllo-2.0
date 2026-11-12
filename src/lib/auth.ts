// Entrar, salir y borrar la cuenta (Supabase Auth, ADR-002).
// Se entra con el email y un código de 6 cifras que llega al correo: sin contraseñas.
// Estas funciones nunca lanzan errores: devuelven { ok } o { ok: false, error } con un motivo
// que las pantallas saben explicar.
import { supabase } from './supabase';

export type ErrorAuth =
  | 'sin-servicio' // la app está en modo de ejemplo (sin claves de Supabase)
  | 'email' // el email no vale
  | 'espera' // demasiados intentos seguidos: hay que esperar
  | 'codigo' // el código no es correcto o ha caducado
  | 'menor' // la fecha de nacimiento es de menor de 18 (lo dice la base de datos)
  | 'local' // es la única persona propietaria de un local: no puede borrar la cuenta
  | 'red'; // sin conexión o fallo del servidor

export type Resultado = { ok: true } | { ok: false; error: ErrorAuth };

const OK: Resultado = { ok: true };
const fallo = (error: ErrorAuth): Resultado => ({ ok: false, error });

// Supabase manda códigos de 6 cifras por defecto, pero se puede configurar hasta 10:
// la app acepta cualquiera de esos largos para no depender de ese ajuste.
export const CODIGO_MIN = 6;
export const CODIGO_MAX = 10;
const ES_CODIGO = new RegExp(`^\\d{${CODIGO_MIN},${CODIGO_MAX}}$`);

export function esCodigoValido(codigo: string): boolean {
  return ES_CODIGO.test(codigo);
}
export const ESPERA_REENVIO_S = 60; // Supabase deja pedir un código por email cada 60 segundos

// Comprobación básica para avisar de erratas antes de enviar nada.
const PARECE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function limpiarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function esEmailValido(email: string): boolean {
  return PARECE_EMAIL.test(limpiarEmail(email));
}

type ErrorSupabase = { code?: string; status?: number; message?: string } | null;

type Paso = 'enviar' | 'verificar' | 'fecha' | 'borrar';

// Traduce un error de Supabase a uno de los nuestros. El mismo código significa cosas distintas
// según lo que se estuviera haciendo, por eso hace falta saber el paso.
export function tipoDeError(error: ErrorSupabase, paso: Paso): ErrorAuth {
  const { code, status } = error ?? {};
  if (status === 429 || code?.includes('rate_limit')) return 'espera';
  if (status === 0 || status === undefined || status >= 500) return 'red';
  switch (paso) {
    case 'enviar':
      return code === 'email_address_invalid' || code === 'validation_failed' || code === 'email_address_not_authorized' ? 'email' : 'red';
    case 'verificar':
      return 'codigo'; // cualquier rechazo aquí es que el código no vale o ha caducado
    case 'fecha':
      return code === '23514' ? 'menor' : 'red'; // 23514 = la regla de los 18 años
    case 'borrar':
      // RT001 lo lanza borrar_mi_cuenta; 23514, el trigger que protege a los locales (por si dos
      // propietarios se borran a la vez).
      return code === 'RT001' || code === '23514' ? 'local' : 'red';
  }
}

// Paso 1: manda el código al email. Si la cuenta no existe, se crea.
export async function enviarCodigo(email: string): Promise<Resultado> {
  if (!supabase) return fallo('sin-servicio');
  if (!esEmailValido(email)) return fallo('email');
  try {
    const { error } = await supabase.auth.signInWithOtp({ email: limpiarEmail(email), options: { shouldCreateUser: true } });
    return error ? fallo(tipoDeError(error, 'enviar')) : OK;
  } catch {
    return fallo('red');
  }
}

// Paso 2: comprueba el código. Si es correcto, la sesión queda abierta y guardada en el móvil.
export async function verificarCodigo(email: string, codigo: string): Promise<Resultado> {
  if (!supabase) return fallo('sin-servicio');
  if (!esCodigoValido(codigo)) return fallo('codigo');
  try {
    const { error } = await supabase.auth.verifyOtp({ email: limpiarEmail(email), token: codigo, type: 'email' });
    return error ? fallo(tipoDeError(error, 'verificar')) : OK;
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
    if (!id) return fallo('codigo');
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
