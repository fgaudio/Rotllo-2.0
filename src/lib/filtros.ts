// Filtros del feed: hoy, este finde y gratis. Hacen lo mismo que la función
// buscar_planes de la base de datos (que es la que se usa con Supabase); esta versión
// sirve para los datos de ejemplo. Si cambias una, cambia la otra.
//
// Dos reglas de una app de noche:
//   · Siempre en hora de Valencia, tenga el móvil la hora que tenga.
//   · El "día" va de 06:00 a 06:00: a las 23:30 del viernes, la fiesta de las 00:30 es "hoy".
// "Cerca de mí" llegará con el módulo de mapa (permiso de ubicación).
import type { Plan } from './tipos';

export type Filtro = 'hoy' | 'finde' | 'gratis';

const ZONA = 'Europe/Madrid';
const HORA = 60 * 60 * 1000;
const DIA = 24 * HORA;
const DURACION_SIN_FIN = 6 * HORA; // un plan sin hora de fin se da por terminado 6 h después

type FechaHora = { y: number; m: number; d: number; h: number; min: number; s: number };

// La fecha y la hora "de reloj" en Valencia para un instante.
function enValencia(instante: Date): FechaHora {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instante);
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)?.value);
  return { y: valor('year'), m: valor('month'), d: valor('day'), h: valor('hour'), min: valor('minute'), s: valor('second') };
}

// Diferencia entre la hora de Valencia y UTC en ese instante (1 h en invierno, 2 h en verano).
function desfaseValencia(instante: Date): number {
  const v = enValencia(instante);
  return Date.UTC(v.y, v.m - 1, v.d, v.h, v.min, v.s) - Math.floor(instante.getTime() / 1000) * 1000;
}

// Un día y una hora de Valencia → el instante exacto.
export function instanteValencia(y: number, m: number, d: number, h: number): Date {
  const comoSiFueraUTC = Date.UTC(y, m - 1, d, h);
  let t = comoSiFueraUTC - desfaseValencia(new Date(comoSiFueraUTC));
  t = comoSiFueraUTC - desfaseValencia(new Date(t)); // segunda vuelta por si cambia la hora ese día
  return new Date(t);
}

// Qué "día de noche" es: la fecha de Valencia restando 6 horas de reloj.
// Se devuelve como medianoche UTC de esa fecha, para poder sumar días sin líos.
export function diaNocturno(ahora: Date): Date {
  const v = enValencia(ahora);
  const relojMenos6 = new Date(Date.UTC(v.y, v.m - 1, v.d, v.h, v.min, v.s) - 6 * HORA);
  return new Date(Date.UTC(relojMenos6.getUTCFullYear(), relojMenos6.getUTCMonth(), relojMenos6.getUTCDate()));
}

function a06h(dia: Date, sumarDias = 0): Date {
  const d = new Date(dia.getTime() + sumarDias * DIA);
  return instanteValencia(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), 6);
}

export function ventanas(ahora: Date) {
  const dia = diaNocturno(ahora);
  const isodow = dia.getUTCDay() === 0 ? 7 : dia.getUTCDay(); // 1 = lunes … 7 = domingo
  const hastaViernes = isodow >= 5 ? -(isodow - 5) : 5 - isodow;
  return {
    hoyFin: a06h(dia, 1),
    findeInicio: a06h(dia, hastaViernes),
    findeFin: a06h(dia, hastaViernes + 3),
  };
}

function finDe(plan: Plan): number {
  return plan.terminaEn ? Date.parse(plan.terminaEn) : Date.parse(plan.empiezaEn) + DURACION_SIN_FIN;
}

export function filtrarPlanes(planes: Plan[], filtro: Filtro | null, ahora = new Date()): Plan[] {
  const v = ventanas(ahora);
  return planes
    .filter((plan) => finDe(plan) > ahora.getTime())
    .filter((plan) => {
      const empieza = Date.parse(plan.empiezaEn);
      if (filtro === 'hoy') return empieza < v.hoyFin.getTime();
      if (filtro === 'finde') return empieza < v.findeFin.getTime() && finDe(plan) > v.findeInicio.getTime();
      if (filtro === 'gratis') return plan.esGratis;
      return true;
    })
    .sort((a, b) => Date.parse(a.empiezaEn) - Date.parse(b.empiezaEn) || a.id.localeCompare(b.id));
}
