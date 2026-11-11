// Fechas y precios en el formato de cada idioma, siempre en hora de Valencia.

const ZONA = 'Europe/Madrid';
const LOCALES: Record<string, string> = { es: 'es-ES', en: 'en-GB', it: 'it-IT' };

function locale(idioma: string) {
  return LOCALES[idioma] ?? 'es-ES';
}

// "sáb, 14 nov · 23:00"
export function formatearFecha(iso: string, idioma: string): string {
  const fecha = new Date(iso);
  const dia = new Intl.DateTimeFormat(locale(idioma), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: ZONA,
  }).format(fecha);
  const hora = new Intl.DateTimeFormat(locale(idioma), {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: ZONA,
  }).format(fecha);
  return `${dia} · ${hora}`;
}

// 800 → "8 €" · 850 → "8,50 €"
export function formatearPrecio(centimos: number, idioma: string): string {
  const euros = centimos / 100;
  return new Intl.NumberFormat(locale(idioma), {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: Number.isInteger(euros) ? 0 : 2,
  }).format(euros);
}

// "23:00"
export function formatearHora(iso: string, idioma: string): string {
  return new Intl.DateTimeFormat(locale(idioma), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: ZONA }).format(new Date(iso));
}

// Los días de la agenda son "días de noche" (ver filtros.ts) y llegan como medianoche UTC:
// por eso estos formatos van en UTC y no en hora de Valencia.
type ParteDia = 'largo' | 'agenda' | 'corto';
const PARTES: Record<ParteDia, Intl.DateTimeFormatOptions> = {
  largo: { weekday: 'long', day: 'numeric', month: 'long' }, // "miércoles, 11 de noviembre"
  agenda: { weekday: 'long', day: 'numeric' }, // "viernes 13"
  corto: { weekday: 'short' }, // "vie"
};

export function formatearDia(dia: Date, idioma: string, parte: ParteDia): string {
  const texto = new Intl.DateTimeFormat(locale(idioma), { ...PARTES[parte], timeZone: 'UTC' }).format(dia);
  return texto.replace(',', '').replace('.', '');
}

// La fecha de hoy para la cabecera del feed: "miércoles 11 nov"
export function formatearHoy(ahora: Date, idioma: string): string {
  return new Intl.DateTimeFormat(locale(idioma), { weekday: 'long', day: 'numeric', month: 'short', timeZone: ZONA })
    .format(ahora)
    .replace(',', '')
    .replace('.', '');
}
