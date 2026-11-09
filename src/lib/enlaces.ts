// Enlace público de un plan (deep link, ADR-001): abre la app si está instalada y, si no,
// la web con la misma ruta. El dominio es el de app.config.ts.
const DOMINIO = 'rotllo.app';

export function enlacePlan(id: string): string {
  return `https://${DOMINIO}/p/${encodeURIComponent(id)}`;
}
