// Quién está usando la app: sin sesión, o con sesión y con el perfil a medias o completo.
// Las pantallas lo leen con useSesion() y se actualizan solas al entrar o salir.
import { useSyncExternalStore } from 'react';
import { AppState, Platform } from 'react-native';

import { supabase } from './supabase';

export type Sesion =
  | { estado: 'cargando' } // todavía no se sabe (se está leyendo la sesión guardada en el móvil)
  | { estado: 'sin-sesion' }
  | { estado: 'con-sesion'; userId: string; email: string; perfil: EstadoPerfil };

// 'sin-datos': hay sesión, pero no se ha podido leer el perfil (por ejemplo, sin conexión).
export type EstadoPerfil = 'cargando' | 'incompleto' | 'activo' | 'bloqueado' | 'sin-datos';

// Qué toca hacer para tener la cuenta lista.
export type Paso = 'esperar' | 'entrar' | 'fecha-nacimiento' | 'listo';

export function siguientePaso(sesion: Sesion): Paso {
  if (sesion.estado === 'cargando') return 'esperar';
  if (sesion.estado === 'sin-sesion') return 'entrar';
  if (sesion.perfil === 'cargando') return 'esperar';
  if (sesion.perfil === 'incompleto') return 'fecha-nacimiento'; // falta la fecha (mayores de 18)
  return 'listo';
}

let actual: Sesion = supabase ? { estado: 'cargando' } : { estado: 'sin-sesion' };
let arrancado = false;
const oyentes = new Set<() => void>();

function fijar(nueva: Sesion) {
  actual = nueva;
  oyentes.forEach((oyente) => oyente());
}

const REINTENTOS = [3000, 10000, 30000]; // si no hay red al abrir la app, se vuelve a probar

// Lee el estado del perfil privado (solo lo ve su dueño). Si no se puede leer, queda "sin-datos":
// no se le pide a nadie una fecha de nacimiento que quizá ya dio. En cualquier caso, la base de
// datos sigue siendo la que manda en lo que se puede hacer.
async function leerPerfil(userId: string, intento = 0) {
  if (!supabase) return;
  const sigue = () => actual.estado === 'con-sesion' && actual.userId === userId; // ¿no ha cambiado la sesión?
  let perfil: EstadoPerfil = 'sin-datos';
  try {
    const { data, error } = await supabase.from('perfiles_privados').select('estado').eq('id', userId).maybeSingle();
    if (!error) perfil = data?.estado === 'activo' ? 'activo' : !data || data.estado === 'incompleto' ? 'incompleto' : 'bloqueado';
  } catch {
    // sin conexión
  }
  if (!sigue() || actual.estado !== 'con-sesion') return;
  fijar({ ...actual, perfil });
  if (perfil === 'sin-datos' && intento < REINTENTOS.length) setTimeout(() => sigue() && leerPerfil(userId, intento + 1), REINTENTOS[intento]);
}

// Vuelve a leer el perfil (por ejemplo, justo después de guardar la fecha de nacimiento).
export async function refrescarPerfil() {
  if (actual.estado === 'con-sesion') await leerPerfil(actual.userId);
}

function arrancar() {
  if (arrancado || !supabase) return;
  arrancado = true;
  const cliente = supabase;

  // Supabase avisa al abrir la app (con la sesión guardada, si la hay) y cada vez que se entra o se sale.
  cliente.auth.onAuthStateChange((_evento, session) => {
    if (!session) return fijar({ estado: 'sin-sesion' });
    const mismo = actual.estado === 'con-sesion' && actual.userId === session.user.id;
    if (mismo) return; // solo se ha renovado el token
    fijar({ estado: 'con-sesion', userId: session.user.id, email: session.user.email ?? '', perfil: 'cargando' });
    // Fuera de este aviso: Supabase no deja hacer otras llamadas dentro de él.
    setTimeout(() => leerPerfil(session.user.id), 0);
  });

  // En el móvil, la sesión se renueva sola solo mientras la app está abierta.
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (estado) => {
      if (estado === 'active') cliente.auth.startAutoRefresh();
      else cliente.auth.stopAutoRefresh();
    });
  }
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  arrancar();
  return () => {
    oyentes.delete(oyente);
  };
}

const instantanea = () => actual;

export function useSesion(): Sesion {
  return useSyncExternalStore(suscribir, instantanea, instantanea);
}

// Para el resto de src/lib (los guardados): enterarse de los cambios de sesión sin ser una pantalla.
export function alCambiarSesion(oyente: (sesion: Sesion) => void): () => void {
  const envuelto = () => oyente(actual);
  const quitar = suscribir(envuelto);
  envuelto();
  return quitar;
}
