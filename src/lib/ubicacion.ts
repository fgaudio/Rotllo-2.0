// La posición de la persona, para «Cerca de mí» (docs/cerca-de-mi.md).
//
//   · Solo se pide al tocar «Cerca de mí». La app nunca la pide al abrirse ni la sigue de fondo.
//   · Se redondea a unos 100 m y es lo único que se guarda, en la memoria del móvil y mientras
//     «Cerca de mí» esté puesto. Al quitarlo, se olvida. No va a ninguna tabla.
//   · Las pantallas la leen con useUbicacion().
import * as Location from 'expo-location';
import { useSyncExternalStore } from 'react';
import { Linking, Platform } from 'react-native';

import { redondearPunto, type Punto } from './distancia';

export type Ubicacion =
  | { estado: 'apagada' } // «Cerca de mí» no está puesto
  | { estado: 'buscando' } // esperando el permiso o la posición
  | { estado: 'lista'; punto: Punto }
  | { estado: 'denegada' } // la persona (o el móvil) no da permiso
  | { estado: 'fallo' }; // hay permiso, pero no se ha podido saber la posición

const ESPERA_MAXIMA_MS = 15 * 1000;
const POSICION_RECIENTE_MS = 5 * 60 * 1000; // vale la última posición que tenga el móvil, si es de hace poco
const POSICION_WEB_MS = 60 * 1000;

let actual: Ubicacion = { estado: 'apagada' };
let peticion = 0; // para ignorar una respuesta que llega cuando ya se ha pedido otra cosa
const oyentes = new Set<() => void>();

function poner(nueva: Ubicacion) {
  actual = nueva;
  oyentes.forEach((avisar) => avisar());
}

const esPermisoDenegado = (error: unknown) => typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 1; // navegador: PERMISSION_DENIED

// Espera a la promesa, pero no más de 15 segundos.
function conLimite<T>(promesa: Promise<T>): Promise<T> {
  let reloj: ReturnType<typeof setTimeout>;
  const limite = new Promise<never>((_, rechazar) => {
    reloj = setTimeout(() => rechazar(new Error('tiempo')), ESPERA_MAXIMA_MS);
  });
  return Promise.race([promesa, limite]).finally(() => clearTimeout(reloj));
}

// Pide el permiso (si hace falta) y lee la posición. Nunca lanza errores.
async function leerPosicion(): Promise<Ubicacion> {
  try {
    // En el navegador, pedir la posición ya enseña el aviso de permiso. En el móvil se pide antes.
    if (Platform.OS !== 'web') {
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (!permiso.granted) return { estado: 'denegada' };
      const ultima = await Location.getLastKnownPositionAsync({ maxAge: POSICION_RECIENTE_MS, requiredAccuracy: 500 }).catch(() => null);
      if (ultima) return { estado: 'lista', punto: redondearPunto({ lat: ultima.coords.latitude, lng: ultima.coords.longitude }) };
    }
    // En el navegador, por defecto vale cualquier posición guardada, por antigua que sea: se limita a 1 minuto.
    const opciones: Location.LocationOptions & { maximumAge?: number } = { accuracy: Location.Accuracy.Balanced, ...(Platform.OS === 'web' ? { maximumAge: POSICION_WEB_MS } : {}) };
    const posicion = await conLimite(Location.getCurrentPositionAsync(opciones));
    return { estado: 'lista', punto: redondearPunto({ lat: posicion.coords.latitude, lng: posicion.coords.longitude }) };
  } catch (error) {
    return { estado: esPermisoDenegado(error) ? 'denegada' : 'fallo' };
  }
}

// Pone «Cerca de mí»: busca la posición y deja el resultado en el estado.
export async function activarCerca(): Promise<void> {
  const mia = ++peticion;
  poner({ estado: 'buscando' });
  const resultado = await leerPosicion();
  if (mia === peticion) poner(resultado);
}

// Quita «Cerca de mí» y olvida la posición. También cancela una búsqueda a medias.
export function apagarCerca(): void {
  peticion++;
  poner({ estado: 'apagada' });
}

// Tocar el chip: lo pone si está quitado (o si falló) y lo quita si está puesto o buscando.
export function alternarCerca(): void {
  if (actual.estado === 'lista' || actual.estado === 'buscando') apagarCerca();
  else void activarCerca();
}

// Con «Cerca de mí» puesto, vuelve a mirar dónde está la persona (al refrescar la lista).
// Si no se consigue, se queda la posición que había.
export async function refrescarUbicacion(): Promise<void> {
  if (actual.estado !== 'lista') return;
  const mia = peticion;
  const resultado = await leerPosicion();
  if (mia !== peticion || resultado.estado !== 'lista' || actual.estado !== 'lista') return;
  if (resultado.punto.lat !== actual.punto.lat || resultado.punto.lng !== actual.punto.lng) poner(resultado);
}

// Abre los ajustes de la app en el móvil, para dar el permiso a mano. En el navegador no existe.
export const sePuedenAbrirAjustes = Platform.OS !== 'web';
export function abrirAjustes(): void {
  Linking.openSettings().catch(() => undefined);
}

function suscribir(avisar: () => void) {
  oyentes.add(avisar);
  return () => {
    oyentes.delete(avisar);
  };
}
// El estado de ahora mismo. Las pantallas usan useUbicacion(), que además se entera de los cambios.
export const leerUbicacion = (): Ubicacion => actual;

export function useUbicacion(): Ubicacion {
  return useSyncExternalStore(suscribir, leerUbicacion, leerUbicacion);
}

// El punto desde el que ordenar, o null si «Cerca de mí» no está puesto.
export function puntoDe(ubicacion: Ubicacion): Punto | null {
  return ubicacion.estado === 'lista' ? ubicacion.punto : null;
}
