// Planes guardados (el corazón).
//   · Sin cuenta: se guardan en el móvil. Tocas el corazón y ya.
//   · Con cuenta (perfil completo): además se guardan en la tabla `favoritos`, para tenerlos en
//     cualquier móvil. Al entrar, se juntan los del móvil con los de la cuenta.
//   · Al cerrar sesión se vacían los del móvil, para no mezclarlos con los de otra persona.
// La pantalla siempre lee la lista del móvil, así el corazón responde al instante aunque no haya red.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { alCambiarSesion } from './sesion';
import { supabase } from './supabase';

const CLAVE = 'rotllo.guardados';
const VACIO: readonly string[] = [];
const MAX_GUARDADOS = 500;
const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i; // los planes de ejemplo no lo son

let ids: readonly string[] = VACIO;
let lectura: Promise<void> | null = null;
let cuenta: string | null = null; // la cuenta con la que se sincroniza ahora mismo, si hay
let habiaSesion = false;
const oyentes = new Set<() => void>();

function fijar(nuevos: readonly string[]) {
  ids = nuevos;
  oyentes.forEach((oyente) => oyente());
  AsyncStorage.setItem(CLAVE, JSON.stringify(ids)).catch(() => undefined);
}

// Añade el plan si no estaba (el más reciente, primero) o lo quita si estaba.
export function alternarEn(lista: readonly string[], id: string): string[] {
  return lista.includes(id) ? lista.filter((otro) => otro !== id) : [id, ...lista];
}

// Qué hacer con los guardados cuando cambia la sesión.
//   · 'vaciar': se ha cerrado una sesión (con el perfil completo o a medias). Lo guardado en el
//     móvil era de esa persona y no puede acabar en la cuenta de la siguiente que entre.
//   · 'sincronizar': hay una cuenta completa nueva con la que juntar los guardados.
export type Cambio = { habiaSesion: boolean; cuentaAntes: string | null; haySesion: boolean; cuentaAhora: string | null };

export function accionAlCambiarSesion({ habiaSesion, cuentaAntes, haySesion, cuentaAhora }: Cambio): 'vaciar' | 'sincronizar' | 'nada' {
  if (habiaSesion && !haySesion) return 'vaciar';
  if (cuentaAhora && cuentaAhora !== cuentaAntes) return 'sincronizar';
  return 'nada';
}

// Al entrar: primero lo guardado en este móvil y después lo que ya había en la cuenta, sin repetir.
export function mezclarGuardados(delMovil: readonly string[], deLaCuenta: readonly string[]): string[] {
  return [...new Set([...delMovil, ...deLaCuenta])];
}

function leer(): Promise<void> {
  lectura ??= (async () => {
    try {
      const guardado = JSON.parse((await AsyncStorage.getItem(CLAVE)) ?? '[]');
      if (Array.isArray(guardado)) ids = guardado.filter((id): id is string => typeof id === 'string');
    } catch {
      ids = VACIO; // si el dato está roto, se empieza de cero
    }
    oyentes.forEach((oyente) => oyente());
  })();
  return lectura;
}

// Junta los guardados del móvil con los de la cuenta y sube los que faltan.
async function sincronizar(userId: string) {
  if (!supabase) return;
  await leer();
  const { data, error } = await supabase.from('favoritos').select('plan_id').order('creado_en', { ascending: false }).limit(MAX_GUARDADOS);
  if (error || cuenta !== userId) return; // sin red o cambió la sesión: se intentará la próxima vez
  const deLaCuenta = data.map((fila) => fila.plan_id as string);
  const porSubir = ids.filter((id) => ES_UUID.test(id) && !deLaCuenta.includes(id));
  fijar(mezclarGuardados(ids, deLaCuenta));
  // De uno en uno: si un plan ya no existe, ese falla y los demás se guardan igual.
  await Promise.allSettled(porSubir.map((id) => supabase!.from('favoritos').insert({ user_id: userId, plan_id: id })));
}

function seguirSesion() {
  alCambiarSesion((sesion) => {
    if (sesion.estado === 'cargando') return; // todavía no se sabe quién hay
    const haySesion = sesion.estado === 'con-sesion';
    const cuentaAhora = sesion.estado === 'con-sesion' && sesion.perfil === 'activo' ? sesion.userId : null;
    const accion = accionAlCambiarSesion({ habiaSesion, cuentaAntes: cuenta, haySesion, cuentaAhora });
    habiaSesion = haySesion;
    cuenta = cuentaAhora;
    if (accion === 'vaciar') fijar(VACIO);
    if (accion === 'sincronizar' && cuentaAhora) sincronizar(cuentaAhora);
  });
}

export function alternarGuardado(id: string) {
  const guardar = !ids.includes(id);
  fijar(alternarEn(ids, id));
  if (!supabase || !cuenta || !ES_UUID.test(id)) return;
  // En la cuenta, sin esperar: si falla (sin red), al volver a entrar se vuelven a juntar.
  const tabla = supabase.from('favoritos');
  const peticion = guardar ? tabla.insert({ user_id: cuenta, plan_id: id }) : tabla.delete().eq('user_id', cuenta).eq('plan_id', id);
  peticion.then(undefined, () => undefined);
}

let siguiendo = false;
function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  leer();
  if (!siguiendo) {
    siguiendo = true;
    seguirSesion();
  }
  return () => {
    oyentes.delete(oyente);
  };
}

const instantanea = () => ids;

// Los ids guardados, del más reciente al más antiguo. La pantalla se actualiza sola al cambiar.
export function useGuardados(): readonly string[] {
  return useSyncExternalStore(suscribir, instantanea, instantanea);
}

export function useEstaGuardado(id: string): boolean {
  return useGuardados().includes(id);
}
