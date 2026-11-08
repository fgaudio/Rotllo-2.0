// De dónde salen los planes. Si hay claves de Supabase en el .env, de la vista
// `planes_feed` de la base de datos; si no, de los datos de ejemplo.
// Las pantallas no saben de dónde vienen: solo llaman a estas funciones.
import { planesEjemplo, buscarPlan } from './planes-ejemplo';
import { supabase } from './supabase';
import type { ModoEntradas, Plan } from './tipos';

// Una fila de la vista planes_feed (ver supabase/migrations/…_v1_esquema.sql).
type FilaPlanFeed = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  empieza_en: string;
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
  estado: 'publicado' | 'cancelado';
};

function urlFoto(path: string | null) {
  if (!path || !supabase) return null;
  return supabase.storage.from('planes').getPublicUrl(path).data.publicUrl;
}

function aPlan(fila: FilaPlanFeed): Plan {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    categoria: fila.categoria,
    empiezaEn: fila.empieza_en,
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
    fotoUrl: urlFoto(fila.foto_path),
  };
}

// Planes publicados que aún no han pasado (con 6 h de margen para lo que ya ha empezado).
export async function obtenerPlanes(): Promise<Plan[]> {
  if (!supabase) return planesEjemplo;
  const desde = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('planes_feed')
    .select('*')
    .eq('estado', 'publicado')
    .gte('empieza_en', desde)
    .order('empieza_en');
  if (error) throw error;
  return (data as FilaPlanFeed[]).map(aPlan);
}

export async function obtenerPlan(id: string): Promise<Plan | null> {
  if (!supabase) return buscarPlan(id);
  const { data, error } = await supabase.from('planes_feed').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? aPlan(data as FilaPlanFeed) : null;
}

// "Pillar entrada" (v1): apunta el clic para el local y devuelve el enlace de la ticketera.
export async function enlaceEntradas(plan: Plan): Promise<string | null> {
  if (!supabase) return plan.urlTicketera;
  const { data, error } = await supabase.rpc('registrar_clic', { p_plan: plan.id });
  if (error) return plan.urlTicketera; // si falla el contador, que no falle la compra
  return (data as string | null) ?? plan.urlTicketera;
}
