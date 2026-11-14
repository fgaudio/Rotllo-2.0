// "Cómo llegar" (ADR-004): no calculamos rutas, abrimos una app de mapas con el destino puesto.
// Es gratis y la gente ya sabe usarla. Se puede elegir entre Google Maps y Apple Maps.
//
// Los formatos son los oficiales de cada una (comprobados el 14 de noviembre de 2026):
//   · Google "Maps URLs": https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>
//     Abre la app de Google Maps si está instalada (iPhone y Android) y, si no, el navegador.
//   · Apple "Map Links": https://maps.apple.com/?daddr=<lat>,<lng>
//     En iPhone abre la app Mapas (cualquier versión de iOS). En Android o en un ordenador abre
//     Apple Maps en el navegador; la propia Apple lo redirige a su formato nuevo (/directions).
// No se fija el modo (a pie, en bici, en metro): cada persona lo elige en su app de mapas.
import { Linking, Platform } from 'react-native';

export type AppMapas = 'google' | 'apple';
export type Destino = { lat: number; lng: number; direccion?: string };

// En iPhone, primero Apple Maps (es la que viene con el móvil); en el resto, primero Google Maps.
export function appsDeMapas(plataforma: string = Platform.OS): AppMapas[] {
  return plataforma === 'ios' ? ['apple', 'google'] : ['google', 'apple'];
}

const esCoordenada = (n: number, limite: number) => Number.isFinite(n) && Math.abs(n) <= limite;

// El destino como "39.462041,-0.375385" (6 decimales: unos 10 cm de precisión). Si por lo que sea
// no hay un punto válido, se usa la dirección escrita y la app de mapas la busca.
function destinoEnTexto({ lat, lng, direccion }: Destino): string | null {
  if (esCoordenada(lat, 90) && esCoordenada(lng, 180) && !(lat === 0 && lng === 0)) return `${Number(lat.toFixed(6))},${Number(lng.toFixed(6))}`;
  return direccion?.trim() || null;
}

export function enlaceComoLlegar(destino: Destino, app: AppMapas): string | null {
  const texto = destinoEnTexto(destino);
  if (!texto) return null;
  const valor = encodeURIComponent(texto);
  return app === 'apple' ? `https://maps.apple.com/?daddr=${valor}` : `https://www.google.com/maps/dir/?api=1&destination=${valor}`;
}

// Abre la app de mapas elegida. Devuelve false si no se ha podido abrir.
export async function abrirComoLlegar(destino: Destino, app: AppMapas): Promise<boolean> {
  const url = enlaceComoLlegar(destino, app);
  if (!url) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

// La base de datos guarda la ubicación como un punto geográfico y la API lo devuelve en
// formato EWKB (texto hexadecimal). Esto lo convierte en { lat, lng }. Solo entiende puntos.
export function puntoDeEwkb(hex: unknown): { lat: number; lng: number } | null {
  if (typeof hex !== 'string' || !/^[0-9a-f]+$/i.test(hex) || hex.length < 42) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  const vista = new DataView(bytes.buffer);
  const pequeno = bytes[0] === 1; // orden de los bytes
  const tipo = vista.getUint32(1, pequeno);
  if ((tipo & 0xff) !== 1) return null; // 1 = punto
  const inicio = tipo & 0x20000000 ? 9 : 5; // con SRID (sistema de coordenadas) hay 4 bytes más
  if (bytes.length < inicio + 16) return null;
  const lng = vista.getFloat64(inicio, pequeno);
  const lat = vista.getFloat64(inicio + 8, pequeno);
  return esCoordenada(lat, 90) && esCoordenada(lng, 180) ? { lat, lng } : null;
}
