// Filtros del feed: hoy, este finde y gratis.
// "Cerca de mí" llegará cuando pidamos la ubicación (expo-location).
import type { Plan } from './tipos';

export type Filtro = 'hoy' | 'finde' | 'gratis';

function inicioDelDia(fecha: Date) {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function esHoy(iso: string, ahora = new Date()) {
  const inicio = inicioDelDia(ahora);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  const fecha = new Date(iso);
  return fecha >= inicio && fecha < fin;
}

// El finde es de viernes a domingo. Si hoy es lunes-jueves, el próximo; si ya es finde, este.
export function esEsteFinde(iso: string, ahora = new Date()) {
  const hoy = inicioDelDia(ahora);
  const dia = hoy.getDay(); // 0 = domingo ... 5 = viernes, 6 = sábado
  const diasHastaViernes = dia === 0 ? -2 : dia === 6 ? -1 : 5 - dia;
  const viernes = new Date(hoy);
  viernes.setDate(hoy.getDate() + diasHastaViernes);
  const lunes = new Date(viernes);
  lunes.setDate(viernes.getDate() + 3);
  const fecha = new Date(iso);
  return fecha >= viernes && fecha < lunes;
}

export function filtrarPlanes(planes: Plan[], filtro: Filtro | null, ahora = new Date()) {
  if (!filtro) return planes;
  return planes.filter((plan) => {
    if (filtro === 'hoy') return esHoy(plan.empiezaEn, ahora);
    if (filtro === 'finde') return esEsteFinde(plan.empiezaEn, ahora);
    return plan.esGratis;
  });
}
