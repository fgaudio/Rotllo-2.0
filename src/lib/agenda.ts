// Cuándo es un plan, dicho como lo diría una persona: "hoy", "mañana", "empieza en 2 h".
// Todo usa el "día de noche" de filtros.ts (de 06:00 a 06:00, hora de Valencia): la fiesta
// de la 01:00 del sábado es "viernes".
import { diaNocturno } from './filtros';
import type { Plan } from './tipos';

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;
const DURACION_SIN_FIN = 6 * HORA;
const AVISO_PRONTO = 6 * HORA; // "Empieza en…" solo sale si faltan menos de 6 horas

export type Cuando = 'hoy' | 'manana' | 'otro';

// El día de noche del plan (medianoche UTC de esa fecha) y cuántos días faltan.
export function diaDe(plan: Pick<Plan, 'empiezaEn'>, ahora: Date): { dia: Date; cuando: Cuando } {
  const hoy = diaNocturno(ahora);
  // Un plan que empezó ayer y sigue abierto cuenta como de hoy.
  const dia = new Date(Math.max(diaNocturno(new Date(plan.empiezaEn)).getTime(), hoy.getTime()));
  const faltan = Math.round((dia.getTime() - hoy.getTime()) / DIA);
  return { dia, cuando: faltan === 0 ? 'hoy' : faltan === 1 ? 'manana' : 'otro' };
}

export type Inminencia = { estado: 'en-curso' } | { estado: 'pronto'; horas: number; minutos: number } | null;

// ¿Está pasando ya o empieza enseguida? Si no, null.
export function inminencia(plan: Pick<Plan, 'empiezaEn' | 'terminaEn'>, ahora: Date): Inminencia {
  const empieza = Date.parse(plan.empiezaEn);
  const termina = plan.terminaEn ? Date.parse(plan.terminaEn) : empieza + DURACION_SIN_FIN;
  const t = ahora.getTime();
  if (t >= termina) return null;
  if (t >= empieza) return { estado: 'en-curso' };
  const falta = empieza - t;
  if (falta > AVISO_PRONTO) return null;
  const minutosTotales = Math.max(1, Math.round(falta / MINUTO));
  return { estado: 'pronto', horas: Math.floor(minutosTotales / 60), minutos: minutosTotales % 60 };
}

export type GrupoDia<P> = { clave: string; dia: Date; cuando: Cuando; planes: P[] };

// Los planes agrupados por día de noche, en el orden en que llegan (ya vienen por fecha).
export function agruparPorDia<P extends Pick<Plan, 'empiezaEn'>>(planes: P[], ahora: Date): GrupoDia<P>[] {
  const grupos: GrupoDia<P>[] = [];
  for (const plan of planes) {
    const { dia, cuando } = diaDe(plan, ahora);
    const clave = dia.toISOString().slice(0, 10);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.clave === clave) ultimo.planes.push(plan);
    else grupos.push({ clave, dia, cuando, planes: [plan] });
  }
  return grupos;
}

// Momento del día para el titular del feed: "hoy", "esta tarde" o "esta noche".
export function momentoDelDia(ahora: Date): 'hoy' | 'tarde' | 'noche' {
  const hora = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Madrid' }).format(ahora));
  if (hora >= 6 && hora < 14) return 'hoy';
  if (hora >= 14 && hora < 20) return 'tarde';
  return 'noche';
}
