// Los locales (bares, discotecas, sitios de actividades): darlos de alta, ver el mío y,
// para el equipo de Rotllo, revisarlos. Las reglas de quién puede qué están en la base de datos.
import { esEmailValido, limpiarEmail } from './auth';
import { supabase } from './supabase';

export const TIPOS_LOCAL = ['bar', 'discoteca', 'actividad', 'cultura', 'otro'] as const;
export type TipoLocal = (typeof TIPOS_LOCAL)[number];
export type EstadoLocal = 'pendiente' | 'verificado' | 'rechazado' | 'suspendido';

export type Local = {
  id: string;
  nombre: string;
  tipo: TipoLocal;
  direccion: string;
  barrio: string | null;
  instagram: string | null;
  estado: EstadoLocal;
  motivoRechazo: string | null;
  rol: 'propietario' | 'editor' | 'portero';
};

export type LocalPorRevisar = Omit<Local, 'rol' | 'estado' | 'motivoRechazo'> & { emailContacto: string | null; creadoEn: string };

export type DatosAlta = {
  nombre: string;
  tipo: TipoLocal | null;
  direccion: string;
  punto: { lat: number; lng: number } | null; // sale de buscar la dirección en el mapa
  barrio: string;
  instagram: string;
  emailContacto: string;
};

export type CampoAlta = 'nombre' | 'tipo' | 'direccion' | 'instagram' | 'emailContacto';
export type ErrorLocal = 'sin-servicio' | 'sin-cuenta' | 'red';
export type Resultado<T = undefined> = { ok: true; valor: T } | { ok: false; error: ErrorLocal };

// ── Sin red: se pueden probar ───────────────────────────────────────────────

// "Café Mercedes Jazz" → "cafe-mercedes-jazz". Es la dirección web del local (rotllo.app/l/…).
export function crearSlug(nombre: string): string {
  const base = nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return base.length >= 2 ? base : `local-${base || 'rotllo'}`;
}

// "@Mercedes.Jazz", "https://instagram.com/mercedes.jazz/" → "mercedes.jazz". Vacío si no se pone.
// Devuelve null si lo escrito no puede ser una cuenta de Instagram.
export function limpiarInstagram(texto: string): string | null {
  const limpio = texto
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/[/?#].*$/, '')
    .replace(/^@/, '')
    .toLowerCase();
  if (limpio === '') return '';
  return /^[a-z0-9._]{1,30}$/.test(limpio) ? limpio : null;
}

// Qué campos del alta están mal. Vacío = todo bien.
export function validarAlta(datos: DatosAlta): CampoAlta[] {
  const mal: CampoAlta[] = [];
  const nombre = datos.nombre.trim();
  if (nombre.length < 2 || nombre.length > 80) mal.push('nombre');
  if (!datos.tipo) mal.push('tipo');
  if (!datos.punto || datos.direccion.trim().length < 4) mal.push('direccion');
  if (limpiarInstagram(datos.instagram) === null) mal.push('instagram');
  if (!esEmailValido(datos.emailContacto)) mal.push('emailContacto');
  return mal;
}

// ── Con la base de datos ────────────────────────────────────────────────────

type FilaLocal = {
  id: string;
  nombre: string;
  tipo: TipoLocal;
  direccion: string;
  barrio: string | null;
  instagram: string | null;
  estado_verificacion: EstadoLocal;
  motivo_rechazo: string | null;
};
const COLUMNAS = 'id, nombre, tipo, direccion, barrio, instagram, estado_verificacion, motivo_rechazo';

async function miId(): Promise<string | null> {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  return data.session?.user.id ?? null;
}

// Los locales que gestiona quien ha iniciado sesión (normalmente, uno).
export async function obtenerMisLocales(): Promise<Local[]> {
  const yo = await miId();
  if (!supabase || !yo) return [];
  const { data, error } = await supabase.from('miembros_local').select(`rol, locales (${COLUMNAS})`).eq('user_id', yo).order('creado_en');
  if (error) throw error;
  return (data as unknown as { rol: Local['rol']; locales: FilaLocal | null }[])
    .filter((fila) => fila.locales)
    .map(({ rol, locales: l }) => ({
      id: l!.id,
      nombre: l!.nombre,
      tipo: l!.tipo,
      direccion: l!.direccion,
      barrio: l!.barrio,
      instagram: l!.instagram,
      estado: l!.estado_verificacion,
      motivoRechazo: l!.motivo_rechazo,
      rol,
    }));
}

// Da de alta el local (función crear_local). Nace "pendiente" hasta que Rotllo lo revise.
export async function crearLocal(datos: DatosAlta): Promise<Resultado<string>> {
  if (!supabase) return { ok: false, error: 'sin-servicio' };
  if (validarAlta(datos).length > 0 || !datos.tipo || !datos.punto) return { ok: false, error: 'red' };
  const slug = crearSlug(datos.nombre);
  // Si ya hay un local con esa dirección web, se prueba con un número detrás.
  for (const sufijo of ['', '-2', '-3', '-4', `-${Date.now().toString(36)}`]) {
    try {
      const { data, error } = await supabase.rpc('crear_local', {
        p_nombre: datos.nombre.trim(),
        p_slug: `${slug}${sufijo}`,
        p_tipo: datos.tipo,
        p_direccion: datos.direccion.trim(),
        p_lat: datos.punto.lat,
        p_lng: datos.punto.lng,
        p_barrio: datos.barrio.trim() || null,
        p_instagram: limpiarInstagram(datos.instagram) || null,
        p_email_contacto: limpiarEmail(datos.emailContacto),
      });
      if (!error) return { ok: true, valor: data as string };
      if (error.code === '23505') continue; // esa dirección web ya existe: siguiente
      return { ok: false, error: error.code === '42501' ? 'sin-cuenta' : 'red' };
    } catch {
      return { ok: false, error: 'red' };
    }
  }
  return { ok: false, error: 'red' };
}

// ── Equipo de Rotllo ────────────────────────────────────────────────────────

export async function esAdmin(): Promise<boolean> {
  const yo = await miId();
  if (!supabase || !yo) return false;
  const { data } = await supabase.from('admins_rotllo').select('user_id').eq('user_id', yo).maybeSingle();
  return Boolean(data);
}

// Locales pendientes de revisar, del más antiguo al más nuevo. Solo devuelve algo a un admin.
export async function obtenerLocalesPorRevisar(): Promise<LocalPorRevisar[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('locales')
    .select(`${COLUMNAS}, creado_en, locales_privado (email_contacto)`)
    .eq('estado_verificacion', 'pendiente')
    .order('creado_en');
  if (error) throw error;
  type Fila = FilaLocal & { creado_en: string; locales_privado: { email_contacto: string | null } | { email_contacto: string | null }[] | null };
  return (data as unknown as Fila[]).map((l) => {
    const privado = Array.isArray(l.locales_privado) ? l.locales_privado[0] : l.locales_privado;
    return { id: l.id, nombre: l.nombre, tipo: l.tipo, direccion: l.direccion, barrio: l.barrio, instagram: l.instagram, emailContacto: privado?.email_contacto ?? null, creadoEn: l.creado_en };
  });
}

// Aprobar o rechazar un local. La base de datos solo se lo permite a un admin.
export async function revisarLocal(id: string, decision: { aprobar: true } | { aprobar: false; motivo: string }): Promise<Resultado> {
  if (!supabase) return { ok: false, error: 'sin-servicio' };
  const cambio = decision.aprobar
    ? { estado_verificacion: 'verificado', motivo_rechazo: null }
    : { estado_verificacion: 'rechazado', motivo_rechazo: decision.motivo.trim() };
  try {
    const { data, error } = await supabase.from('locales').update(cambio).eq('id', id).select('id');
    if (error || data.length !== 1) return { ok: false, error: error?.code === '42501' ? 'sin-cuenta' : 'red' };
    return { ok: true, valor: undefined };
  } catch {
    return { ok: false, error: 'red' };
  }
}
