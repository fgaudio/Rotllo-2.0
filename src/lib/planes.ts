// De dónde salen los planes. Si hay claves de Supabase en el .env, de la vista
// `planes_feed` de la base de datos; si no, de los datos de ejemplo.
// Las pantallas no saben de dónde vienen: solo llaman a estas funciones.
import { idDispositivo } from './dispositivo';
import { filtrarPlanes, type Filtro } from './filtros';
import { urlDeFoto } from './fotos';
import { planesEjemplo, buscarPlan } from './planes-ejemplo';
import { supabase } from './supabase';
import type { ConfigCartel, ModoEntradas, Plan } from './tipos';

// Una fila de la vista planes_feed (ver supabase/migrations/…_v1_esquema.sql).
type FilaPlanFeed = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  empieza_en: string;
  termina_en: string | null;
  local: string;
  direccion: string;
  barrio: string | null;
  lat: number;
  lng: number;
  es_gratis: boolean;
  precio_desde_centimos: number | null;
  edad_minima: number;
  modo_entradas: ModoEntradas;
  url_ticketera: string | null;
  foto_path: string | null;
  cartel?: ConfigCartel | null;
  estado: 'publicado' | 'cancelado';
};


function aPlan(fila: FilaPlanFeed): Plan {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    categoria: fila.categoria,
    empiezaEn: fila.empieza_en,
    terminaEn: fila.termina_en,
    local: fila.local,
    direccion: fila.direccion,
    barrio: fila.barrio ?? '',
    lat: fila.lat,
    lng: fila.lng,
    esGratis: fila.es_gratis,
    precioDesdeCentimos: fila.precio_desde_centimos,
    edadMinima: fila.edad_minima,
    modoEntradas: fila.modo_entradas,
    urlTicketera: fila.url_ticketera,
    fotoUrl: urlDeFoto(fila.foto_path),
    cartel: fila.cartel ?? null,
    cancelado: fila.estado === 'cancelado',
  };
}

export const PLANES_POR_PAGINA = 30;

// Una página del feed: planes publicados que aún no han terminado, con el filtro hecho en la
// base de datos (buscar_planes: hora de Valencia y día de 06:00 a 06:00).
export async function obtenerPlanes(filtro: Filtro | null = null, desde = 0): Promise<Plan[]> {
  if (!supabase) return filtrarPlanes(planesEjemplo, filtro).slice(desde, desde + PLANES_POR_PAGINA);
  const { data, error } = await supabase.rpc('buscar_planes', {
    p_filtro: filtro,
    p_desde: desde,
    p_limite: PLANES_POR_PAGINA,
  });
  if (error) throw error;
  return (data as FilaPlanFeed[]).map(aPlan);
}

export async function obtenerPlan(id: string): Promise<Plan | null> {
  if (!supabase) return buscarPlan(id);
  const { data, error } = await supabase.from('planes_feed').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? aPlan(data as FilaPlanFeed) : null;
}

// Añade "utm_source=rotllo" al enlace de la ticketera (ADR-003): así el local ve en sus propias
// estadísticas cuánta gente le llega desde Rotllo. Si el enlace ya dice de dónde viene, se respeta.
export function conOrigenRotllo(enlace: string | null): string | null {
  if (!enlace) return null;
  try {
    const url = new URL(enlace);
    if (!url.searchParams.has('utm_source')) url.searchParams.set('utm_source', 'rotllo');
    return url.toString();
  } catch {
    return enlace; // un enlace raro se deja como está
  }
}

// "Pillar entrada" (v1): apunta el clic para el local y devuelve el enlace de la ticketera.
export async function enlaceEntradas(plan: Plan): Promise<string | null> {
  if (!supabase) return conOrigenRotllo(plan.urlTicketera);
  const { data, error } = await supabase.rpc('registrar_clic', {
    p_plan: plan.id,
    p_dispositivo: await idDispositivo(),
  });
  if (error) return conOrigenRotllo(plan.urlTicketera); // si falla el contador, que no falle la compra
  return conOrigenRotllo((data as string | null) ?? plan.urlTicketera);
}
