// Planes guardados. Se guardan en el móvil, así que funcionan sin cuenta: tocas el corazón y ya.
// Cuando haya cuentas (módulo 1), se copiarán a la tabla `favoritos` para tenerlos en cualquier móvil.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const CLAVE = 'rotllo.guardados';
const VACIO: readonly string[] = [];

let ids: readonly string[] = VACIO;
let leido = false;
const oyentes = new Set<() => void>();

function avisar() {
  oyentes.forEach((oyente) => oyente());
}

// Añade el plan si no estaba (el más reciente, primero) o lo quita si estaba.
export function alternarEn(lista: readonly string[], id: string): string[] {
  return lista.includes(id) ? lista.filter((otro) => otro !== id) : [id, ...lista];
}

async function leer() {
  if (leido) return;
  leido = true;
  try {
    const guardado = JSON.parse((await AsyncStorage.getItem(CLAVE)) ?? '[]');
    if (Array.isArray(guardado)) ids = guardado.filter((id): id is string => typeof id === 'string');
  } catch {
    ids = VACIO; // si el dato está roto, se empieza de cero
  }
  avisar();
}

export function alternarGuardado(id: string) {
  ids = alternarEn(ids, id);
  avisar();
  AsyncStorage.setItem(CLAVE, JSON.stringify(ids)).catch(() => undefined);
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  leer();
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
