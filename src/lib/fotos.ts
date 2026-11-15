// La foto o el flyer que un local sube como cartel de su plan (ADR-005).
//   1. Se elige de la galería del móvil.
//   2. Se encoge a 1600 px como mucho y se guarda como JPEG: pesa poco y, de paso, se le quitan
//      los datos ocultos de la foto (dónde y con qué móvil se hizo).
//   3. Se sube a Supabase Storage, a la carpeta del plan: planes/<id del plan>/<nombre>.jpg.
//      Solo puede subirla quien puede editar ese plan (regla de la base de datos).
// Un plan tiene una sola foto de cartel: subir otra sustituye a la anterior.
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from './supabase';

export type FotoElegida = { uri: string; ancho: number; alto: number };
export type ErrorFoto = 'sin-servicio' | 'permiso' | 'formato' | 'grande' | 'red';
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: ErrorFoto };

export const LADO_MAXIMO = 1600; // px del lado más largo
export const PESO_MAXIMO = 10 * 1024 * 1024; // 10 MB, el límite de la carpeta en Supabase
const CARPETA = 'planes';

// ── Sin red ─────────────────────────────────────────────────────────────────

// A qué tamaño encoger la foto para que su lado más largo mida 1600 px. Null = ya es pequeña.
export function medidaParaEncoger(ancho: number, alto: number): { width: number } | { height: number } | null {
  if (!(ancho > 0) || !(alto > 0) || Math.max(ancho, alto) <= LADO_MAXIMO) return null;
  return ancho >= alto ? { width: LADO_MAXIMO } : { height: LADO_MAXIMO };
}

// planes/<plan>/<nombre>.jpg. El nombre lleva la hora para que una foto nueva no pise a la
// anterior ni se quede guardada la vieja en la memoria del móvil.
export function rutaDeFoto(planId: string, ahora = Date.now(), azar = Math.random()): string {
  return `${planId}/${ahora.toString(36)}-${Math.floor(azar * 1e9).toString(36)}.jpg`;
}

export function urlDeFoto(ruta: string | null | undefined): string | null {
  if (!ruta || !supabase) return null;
  return supabase.storage.from(CARPETA).getPublicUrl(ruta).data.publicUrl;
}

// ── Con el móvil y la base de datos ─────────────────────────────────────────

// Abre la galería. Null si la persona cierra sin elegir.
export async function elegirFoto(): Promise<Resultado<FotoElegida | null>> {
  try {
    const eleccion = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, exif: false });
    const foto = eleccion.canceled ? null : eleccion.assets[0];
    if (!foto) return { ok: true, valor: null };
    if (!(foto.width > 0) || !(foto.height > 0)) return { ok: false, error: 'formato' };
    return { ok: true, valor: { uri: foto.uri, ancho: foto.width, alto: foto.height } };
  } catch {
    return { ok: false, error: 'permiso' };
  }
}

// Encoge la foto y la deja en JPEG. Devuelve los datos listos para subir.
async function preparar(foto: FotoElegida): Promise<ArrayBuffer> {
  const medida = medidaParaEncoger(foto.ancho, foto.alto);
  const contexto = ImageManipulator.manipulate(foto.uri);
  const imagen = await (medida ? contexto.resize(medida) : contexto).renderAsync();
  const guardada = await imagen.saveAsync({ compress: 0.82, format: SaveFormat.JPEG });
  return (await fetch(guardada.uri)).arrayBuffer();
}

// Sube la foto y la deja como cartel del plan. Devuelve su ruta.
export async function subirFotoDePlan(planId: string, foto: FotoElegida): Promise<Resultado<string>> {
  if (!supabase) return { ok: false, error: 'sin-servicio' };
  let datos: ArrayBuffer;
  try {
    datos = await preparar(foto);
  } catch {
    return { ok: false, error: 'formato' };
  }
  if (datos.byteLength === 0) return { ok: false, error: 'formato' };
  if (datos.byteLength > PESO_MAXIMO) return { ok: false, error: 'grande' };
  try {
    const almacen = supabase.storage.from(CARPETA);
    const { data: anteriores } = await supabase.from('fotos_plan').select('storage_path').eq('plan_id', planId);
    const ruta = rutaDeFoto(planId);
    const subida = await almacen.upload(ruta, datos, { contentType: 'image/jpeg', cacheControl: '31536000' });
    if (subida.error) return { ok: false, error: 'red' };
    // La foto de cartel es la de orden 0: si ya había una, se cambia por la nueva.
    const { error } = await supabase.from('fotos_plan').upsert({ plan_id: planId, storage_path: ruta, orden: 0 }, { onConflict: 'plan_id,orden' });
    if (error) {
      await almacen.remove([ruta]); // no dejar archivos sueltos
      return { ok: false, error: 'red' };
    }
    const viejas = (anteriores ?? []).map((fila) => fila.storage_path as string).filter((otra) => otra !== ruta);
    if (viejas.length > 0) await almacen.remove(viejas); // si falla, solo queda un archivo sin usar
    return { ok: true, valor: ruta };
  } catch {
    return { ok: false, error: 'red' };
  }
}

// Quita la foto: el plan vuelve a su cartel generado.
export async function quitarFotoDePlan(planId: string): Promise<Resultado> {
  if (!supabase) return { ok: false, error: 'sin-servicio' };
  try {
    const { data: filas, error } = await supabase.from('fotos_plan').delete().eq('plan_id', planId).select('storage_path');
    if (error) return { ok: false, error: 'red' };
    const rutas = filas.map((fila) => fila.storage_path as string);
    if (rutas.length > 0) await supabase.storage.from(CARPETA).remove(rutas);
    return { ok: true, valor: undefined };
  } catch {
    return { ok: false, error: 'red' };
  }
}
