// Los planes vistos desde el panel del local: crearlos, editarlos, publicarlos y cancelarlos.
// Arriba, lo que no necesita red (leer la hora y el precio, validar el formulario): tiene tests.
// Abajo, las llamadas a la base de datos, que es la que decide quién puede qué.
import { ESTILOS_CARTEL, TEXTO_CARTEL_MAX } from './cartel';
import { diaNocturno, enValencia, instanteValencia } from './filtros';
import { urlDeFoto } from './fotos';
import { supabase } from './supabase';
import type { ConfigCartel, EstiloCartel, ModoEntradas } from './tipos';

export type EstadoPlan = 'borrador' | 'publicado' | 'cancelado' | 'finalizado';

// Un plan tal como lo ve su local (incluye borradores y cuántos clics lleva "Pillar entrada").
export type PlanLocal = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  empiezaEn: string;
  terminaEn: string | null;
  esGratis: boolean;
  precioDesdeCentimos: number | null;
  edadMinima: number;
  modoEntradas: ModoEntradas;
  urlTicketera: string | null;
  cartel: ConfigCartel | null;
  fotoUrl: string | null; // la foto o el flyer que ha subido el local, si hay
  estado: EstadoPlan;
  motivoCancelacion: string | null;
  clics: number;
};

// Lo que se escribe en el formulario, tal cual (todo texto y opciones).
export type DatosPlan = {
  titulo: string;
  categoria: string | null; // slug
  descripcion: string;
  dia: string | null; // "2026-11-20", día de calendario en Valencia
  hora: string; // "23:00"
  horaFin: string; // opcional
  gratis: boolean;
  precio: string; // "8" o "8,50"; solo si no es gratis
  conTicketera: boolean;
  urlTicketera: string;
  edadMinima: number;
  cartelEstilo: EstiloCartel | null; // null = lo decide la app
  cartelColor: string | null;
  cartelTexto: string;
};

export type CampoPlan = 'titulo' | 'categoria' | 'dia' | 'hora' | 'horaFin' | 'precio' | 'urlTicketera' | 'cartelTexto';

export const EDADES = [18, 21, 23, 25] as const;
export const TITULO_MAX = 80;
export const DESCRIPCION_MAX = 1200;
const PRECIO_MAX_CENTIMOS = 100000; // 1.000 €: más que eso es una errata

export const PLAN_VACIO: DatosPlan = {
  titulo: '',
  categoria: null,
  descripcion: '',
  dia: null,
  hora: '',
  horaFin: '',
  gratis: true,
  precio: '',
  conTicketera: false,
  urlTicketera: '',
  edadMinima: 18,
  cartelEstilo: null,
  cartelColor: null,
  cartelTexto: '',
};

// ── Sin red ─────────────────────────────────────────────────────────────────

// "23:00", "9:30", "2300" o "23" → { h, min }. Null si no es una hora.
export function leerHora(texto: string): { h: number; min: number } | null {
  const limpio = texto.trim().replace(/[.,hH]/, ':').replace(/:$/, ''); // "21h" → "21"
  const partes = limpio.match(/^(\d{1,2})(?::(\d{1,2}))?$/) ?? limpio.match(/^(\d{2})(\d{2})$/);
  if (!partes) return null;
  const h = Number(partes[1]);
  const min = Number(partes[2] ?? 0);
  return h <= 23 && min <= 59 ? { h, min } : null;
}

// "8", "8,50", "8.5" o "8 €" → céntimos. Null si no es un precio mayor que cero.
export function leerPrecio(texto: string): number | null {
  const limpio = texto.replace(/[€\s]/g, '').replace(',', '.');
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(limpio)) return null;
  const centimos = Math.round(Number(limpio) * 100);
  return centimos > 0 && centimos <= PRECIO_MAX_CENTIMOS ? centimos : null;
}

// Añade "https://" si falta. Null si no parece una dirección web.
export function leerEnlace(texto: string): string | null {
  const limpio = texto.trim();
  if (!limpio || /\s/.test(limpio)) return null;
  const conHttps = /^https?:\/\//i.test(limpio) ? limpio.replace(/^http:\/\//i, 'https://') : `https://${limpio}`;
  try {
    const url = new URL(conHttps);
    return url.protocol === 'https:' && url.hostname.includes('.') ? url.toString() : null;
  } catch {
    return null;
  }
}

const dosCifras = (n: number) => String(n).padStart(2, '0');

// Los próximos días para elegir, empezando por hoy (día de calendario en Valencia).
export function diasParaElegir(ahora: Date, cuantos = 45): string[] {
  const { y, m, d } = enValencia(ahora);
  return Array.from({ length: cuantos }, (_, i) => new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10));
}

// El instante exacto en que empieza y termina, a partir del día y las horas de reloj de Valencia.
// Si la hora de fin es anterior o igual a la de inicio, es que termina al día siguiente.
export function fechasDelPlan(dia: string, hora: string, horaFin: string): { empieza: Date; termina: Date | null } | null {
  const partes = dia.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const inicio = leerHora(hora);
  if (!partes || !inicio) return null;
  const [y, m, d] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const empieza = instanteValencia(y, m, d, inicio.h, inicio.min);
  const fin = horaFin.trim() ? leerHora(horaFin) : null;
  if (!fin) return { empieza, termina: null };
  const mismoDia = fin.h * 60 + fin.min > inicio.h * 60 + inicio.min;
  return { empieza, termina: instanteValencia(y, m, d + (mismoDia ? 0 : 1), fin.h, fin.min) };
}

// Si empieza de madrugada (antes de las 06:00), en la app sale en la noche del día anterior.
// Devuelve ese día (medianoche UTC) para avisar al local, o null si no hace falta.
export function nocheALaQuePertenece(dia: string, hora: string): Date | null {
  const fechas = fechasDelPlan(dia, hora, '');
  const inicio = leerHora(hora);
  if (!fechas || !inicio || inicio.h >= 6) return null;
  return diaNocturno(fechas.empieza);
}

// Qué campos están mal. Vacío = se puede guardar.
export function validarPlan(datos: DatosPlan, ahora: Date): CampoPlan[] {
  const mal: CampoPlan[] = [];
  const titulo = datos.titulo.trim();
  if (titulo.length < 3 || titulo.length > TITULO_MAX) mal.push('titulo');
  if (!datos.categoria) mal.push('categoria');
  if (!datos.dia) mal.push('dia');
  if (!leerHora(datos.hora)) mal.push('hora');
  else if (datos.dia) {
    const fechas = fechasDelPlan(datos.dia, datos.hora, '');
    if (!fechas || fechas.empieza.getTime() <= ahora.getTime()) mal.push('hora'); // ya ha pasado
  }
  if (datos.horaFin.trim() && !leerHora(datos.horaFin)) mal.push('horaFin');
  if (!datos.gratis && leerPrecio(datos.precio) === null) mal.push('precio');
  if (datos.conTicketera && !leerEnlace(datos.urlTicketera)) mal.push('urlTicketera');
  if (datos.cartelTexto.trim().length > TEXTO_CARTEL_MAX) mal.push('cartelTexto');
  return mal;
}

// El cartel tal como se guarda: solo lo que el local ha elegido; null si lo deja todo automático.
export function cartelDe(datos: Pick<DatosPlan, 'cartelEstilo' | 'cartelColor' | 'cartelTexto'>): ConfigCartel | null {
  const cartel: ConfigCartel = {};
  if (datos.cartelEstilo && ESTILOS_CARTEL.includes(datos.cartelEstilo)) cartel.estilo = datos.cartelEstilo;
  if (datos.cartelColor) cartel.color = datos.cartelColor;
  const texto = datos.cartelTexto.trim().slice(0, TEXTO_CARTEL_MAX);
  if (texto) cartel.texto = texto;
  return Object.keys(cartel).length > 0 ? cartel : null;
}

// De un plan guardado a los campos del formulario (para editarlo).
export function aFormulario(plan: PlanLocal): DatosPlan {
  const reloj = (iso: string) => {
    const v = enValencia(new Date(iso));
    return { dia: `${v.y}-${dosCifras(v.m)}-${dosCifras(v.d)}`, hora: `${dosCifras(v.h)}:${dosCifras(v.min)}` };
  };
  const inicio = reloj(plan.empiezaEn);
  return {
    titulo: plan.titulo,
    categoria: plan.categoria,
    descripcion: plan.descripcion,
    dia: inicio.dia,
    hora: inicio.hora,
    horaFin: plan.terminaEn ? reloj(plan.terminaEn).hora : '',
    gratis: plan.esGratis,
    precio: plan.precioDesdeCentimos ? String(plan.precioDesdeCentimos / 100).replace('.', ',') : '',
    conTicketera: plan.modoEntradas === 'enlace_externo',
    urlTicketera: plan.urlTicketera ?? '',
    edadMinima: plan.edadMinima,
    cartelEstilo: plan.cartel?.estilo ?? null,
    cartelColor: plan.cartel?.color ?? null,
    cartelTexto: plan.cartel?.texto ?? '',
  };
}

// Cómo está un plan para quien lo gestiona. "terminado" = publicado, pero ya ha pasado.
export type Situacion = EstadoPlan | 'terminado';
export function situacionDe(plan: Pick<PlanLocal, 'estado' | 'empiezaEn' | 'terminaEn'>, ahora: Date): Situacion {
  if (plan.estado !== 'publicado') return plan.estado;
  const fin = plan.terminaEn ? Date.parse(plan.terminaEn) : Date.parse(plan.empiezaEn) + 6 * 60 * 60 * 1000;
  return fin <= ahora.getTime() ? 'terminado' : 'publicado';
}

// ── Con la base de datos ────────────────────────────────────────────────────

export type ErrorPlan = 'sin-servicio' | 'sin-verificar' | 'sin-permiso' | 'no-editable' | 'red';
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: ErrorPlan };

type ErrorBd = { code?: string; message?: string } | null;
function tipoDeError(error: ErrorBd): ErrorPlan {
  if (error?.code === '42501') return 'sin-permiso';
  if (error?.code === '23514' && /verificado/i.test(error.message ?? '')) return 'sin-verificar';
  if (error?.code === '23514' && /(ya no se puede editar|cancelado)/i.test(error.message ?? '')) return 'no-editable';
  return 'red';
}

type FilaPlan = {
  id: string;
  titulo: string;
  descripcion: string;
  empieza_en: string;
  termina_en: string | null;
  es_gratis: boolean;
  precio_desde_centimos: number | null;
  edad_minima: number;
  modo_entradas: ModoEntradas;
  url_ticketera: string | null;
  cartel: ConfigCartel | null;
  estado: EstadoPlan;
  motivo_cancelacion: string | null;
  categorias: { slug: string } | null;
  clics_ticketera: { count: number }[] | null;
  fotos_plan: { storage_path: string; orden: number }[] | null;
};
const COLUMNAS =
  'id, titulo, descripcion, empieza_en, termina_en, es_gratis, precio_desde_centimos, edad_minima, modo_entradas, url_ticketera, cartel, estado, motivo_cancelacion, categorias (slug), clics_ticketera (count), fotos_plan (storage_path, orden)';

function aPlanLocal(f: FilaPlan): PlanLocal {
  return {
    id: f.id,
    titulo: f.titulo,
    descripcion: f.descripcion,
    categoria: f.categorias?.slug ?? '',
    empiezaEn: f.empieza_en,
    terminaEn: f.termina_en,
    esGratis: f.es_gratis,
    precioDesdeCentimos: f.precio_desde_centimos,
    edadMinima: f.edad_minima,
    modoEntradas: f.modo_entradas,
    urlTicketera: f.url_ticketera,
    cartel: f.cartel,
    fotoUrl: urlDeFoto([...(f.fotos_plan ?? [])].sort((a, b) => a.orden - b.orden)[0]?.storage_path),
    estado: f.estado,
    motivoCancelacion: f.motivo_cancelacion,
    clics: f.clics_ticketera?.[0]?.count ?? 0,
  };
}

// Todos los planes de un local, del más nuevo al más antiguo (borradores incluidos).
export async function obtenerPlanesDeLocal(localId: string): Promise<PlanLocal[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('planes').select(COLUMNAS).eq('local_id', localId).order('empieza_en', { ascending: false }).limit(200);
  if (error) throw error;
  return (data as unknown as FilaPlan[]).map(aPlanLocal);
}

export async function obtenerPlanDeLocal(id: string): Promise<PlanLocal | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('planes').select(COLUMNAS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? aPlanLocal(data as unknown as FilaPlan) : null;
}

// Guarda un plan nuevo (sin `id`) o los cambios de uno que ya existe.
// `publicar`: true lo publica (hace falta el local verificado); false lo deja como esté.
export async function guardarPlan(localId: string, datos: DatosPlan, opciones: { id?: string; publicar: boolean }): Promise<Resultado<string>> {
  if (!supabase) return { ok: false, error: 'sin-servicio' };
  const fechas = datos.dia ? fechasDelPlan(datos.dia, datos.hora, datos.horaFin) : null;
  if (!fechas || !datos.categoria) return { ok: false, error: 'red' };
  try {
    const { data: categoria } = await supabase.from('categorias').select('id').eq('slug', datos.categoria).maybeSingle();
    if (!categoria) return { ok: false, error: 'red' };
    const enlace = datos.conTicketera ? leerEnlace(datos.urlTicketera) : null;
    const fila = {
      categoria_id: categoria.id as string,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim().slice(0, DESCRIPCION_MAX),
      empieza_en: fechas.empieza.toISOString(),
      termina_en: fechas.termina?.toISOString() ?? null,
      es_gratis: datos.gratis,
      precio_desde_centimos: datos.gratis ? null : leerPrecio(datos.precio),
      edad_minima: datos.edadMinima,
      modo_entradas: enlace ? 'enlace_externo' : 'ninguna',
      url_ticketera: enlace,
      cartel: cartelDe(datos),
      ...(opciones.publicar ? { estado: 'publicado' } : {}),
    };
    const consulta = opciones.id
      ? supabase.from('planes').update(fila).eq('id', opciones.id).select('id')
      : supabase.from('planes').insert({ ...fila, local_id: localId }).select('id');
    const { data, error } = await consulta;
    if (error) return { ok: false, error: tipoDeError(error) };
    if (data.length !== 1) return { ok: false, error: 'sin-permiso' };
    return { ok: true, valor: data[0].id as string };
  } catch {
    return { ok: false, error: 'red' };
  }
}

// Cancelar un plan publicado: sigue saliendo en la app, marcado como cancelado, para avisar a
// quien lo había guardado. No se puede volver a publicar (regla de la base de datos).
export async function cancelarPlan(id: string, motivo: string): Promise<Resultado> {
  if (!supabase) return { ok: false, error: 'sin-servicio' };
  try {
    const { data, error } = await supabase.from('planes').update({ estado: 'cancelado', motivo_cancelacion: motivo.trim() || null }).eq('id', id).select('id');
    if (error) return { ok: false, error: tipoDeError(error) };
    return data.length === 1 ? { ok: true, valor: undefined } : { ok: false, error: 'sin-permiso' };
  } catch {
    return { ok: false, error: 'red' };
  }
}

// Borrar un borrador (los planes publicados no se borran: se cancelan).
export async function borrarBorrador(id: string): Promise<Resultado> {
  if (!supabase) return { ok: false, error: 'sin-servicio' };
  try {
    const { data, error } = await supabase.from('planes').delete().eq('id', id).eq('estado', 'borrador').select('id');
    if (error) return { ok: false, error: tipoDeError(error) };
    return data.length === 1 ? { ok: true, valor: undefined } : { ok: false, error: 'sin-permiso' };
  } catch {
    return { ok: false, error: 'red' };
  }
}
