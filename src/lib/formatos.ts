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
