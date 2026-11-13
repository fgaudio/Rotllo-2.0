// De una dirección escrita ("Calle de Sueca 27") al punto en el mapa.
// Usa Nominatim, el buscador gratuito de OpenStreetMap. Sus normas piden pocas búsquedas y
// nada de autocompletar: por eso se busca solo cuando la persona toca "Buscar", una vez.
// Si Rotllo crece, se cambia por un servicio de pago (está todo en este archivo).
import { Platform } from 'react-native';

export type Lugar = {
  lat: number;
  lng: number;
  direccion: string; // "Calle de Sueca 27, Valencia"
  barrio: string | null; // "Ruzafa"
};

export type ResultadoBusqueda = { ok: true; lugar: Lugar } | { ok: false; error: 'no-encontrada' | 'red' };

// Solo se busca dentro de Valencia y su área (oeste, norte, este, sur).
const ZONA_VALENCIA = '-0.52,39.60,-0.25,39.36';
const URL_BUSCADOR = 'https://nominatim.openstreetmap.org/search';

type Fila = {
  lat?: string;
  lon?: string;
  display_name?: string;
  address?: Record<string, string | undefined>;
};

// Convierte la respuesta del buscador en un Lugar (o null si no sirve). Sin red: se puede probar.
export function interpretar(respuesta: unknown): Lugar | null {
  const fila = Array.isArray(respuesta) ? (respuesta[0] as Fila | undefined) : undefined;
  if (!fila) return null;
  const lat = Number(fila.lat);
  const lng = Number(fila.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const a = fila.address ?? {};
  const calle = a.road ?? a.pedestrian ?? a.square ?? a.footway;
  const ciudad = a.city ?? a.town ?? a.village ?? a.municipality;
  const direccion = calle
    ? [[calle, a.house_number].filter(Boolean).join(' '), ciudad].filter(Boolean).join(', ')
    : (fila.display_name ?? '').split(',').slice(0, 2).join(',').trim();
  if (!direccion) return null;
  return { lat, lng, direccion, barrio: a.neighbourhood ?? a.quarter ?? a.suburb ?? null };
}

export async function buscarDireccion(texto: string): Promise<ResultadoBusqueda> {
  const consulta = texto.trim();
  if (consulta.length < 4) return { ok: false, error: 'no-encontrada' };
  const parametros = new URLSearchParams({
    q: /valencia|val[eè]ncia/i.test(consulta) ? consulta : `${consulta}, Valencia`,
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'es',
    viewbox: ZONA_VALENCIA,
    bounded: '1',
    addressdetails: '1',
    'accept-language': 'es',
  });
  try {
    const respuesta = await fetch(`${URL_BUSCADOR}?${parametros}`, {
      // El buscador pide que la app se identifique. En la web lo hace el navegador (no deja cambiarlo).
      headers: Platform.OS === 'web' ? undefined : { 'User-Agent': 'Rotllo/0.1 (app de planes en Valencia)' },
    });
    if (!respuesta.ok) return { ok: false, error: 'red' };
    const lugar = interpretar(await respuesta.json());
    return lugar ? { ok: true, lugar } : { ok: false, error: 'no-encontrada' };
  } catch {
    return { ok: false, error: 'red' };
  }
}
