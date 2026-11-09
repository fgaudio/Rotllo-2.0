// Comprobación de la fecha de nacimiento al crear la cuenta (Rotllo es solo para +18).
// La base de datos hace la misma comprobación (trigger en perfiles_privados): esta sirve para
// avisar en la pantalla antes de enviar nada. Los cumpleaños se cuentan en hora de Valencia.

export const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 120; // más de esto es un año mal escrito

export type Fecha = { dia: number; mes: number; anio: number };
export type ResultadoNacimiento = { estado: 'ok'; edad: number } | { estado: 'invalida' } | { estado: 'menor' };

// Hoy en Valencia (día, mes y año de reloj), tenga el móvil la hora que tenga.
export function hoyEnValencia(ahora = new Date()): Fecha {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(ahora);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  return { dia: valor('day'), mes: valor('month'), anio: valor('year') };
}

function esFechaReal({ dia, mes, anio }: Fecha) {
  if (![dia, mes, anio].every(Number.isInteger)) return false;
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  return d.getUTCFullYear() === anio && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
}

// Años cumplidos en la fecha `hoy`. Quien nació un 29 de febrero los cumple el 1 de marzo
// en los años que no son bisiestos (igual que en la base de datos).
export function edadEn(nacimiento: Fecha, hoy: Fecha): number {
  const yaCumplio = hoy.mes > nacimiento.mes || (hoy.mes === nacimiento.mes && hoy.dia >= nacimiento.dia);
  return hoy.anio - nacimiento.anio - (yaCumplio ? 0 : 1);
}

// Lo que escribe la persona en los tres campos (día, mes, año), tal cual.
export function comprobarNacimiento(dia: string, mes: string, anio: string, hoy = hoyEnValencia()): ResultadoNacimiento {
  if (!/^\d{1,2}$/.test(dia) || !/^\d{1,2}$/.test(mes) || !/^\d{4}$/.test(anio)) return { estado: 'invalida' };
  const nacimiento = { dia: Number(dia), mes: Number(mes), anio: Number(anio) };
  if (!esFechaReal(nacimiento)) return { estado: 'invalida' };
  const edad = edadEn(nacimiento, hoy);
  if (edad < 0 || edad > EDAD_MAXIMA) return { estado: 'invalida' };
  if (edad < EDAD_MINIMA) return { estado: 'menor' };
  return { estado: 'ok', edad };
}

// Formato que guarda la base de datos (AAAA-MM-DD).
export function aFechaIso({ dia, mes, anio }: Fecha): string {
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}
