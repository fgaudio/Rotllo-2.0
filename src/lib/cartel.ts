// Decide cómo es el cartel generado de un plan (el que sale cuando el local no ha subido foto).
// El local puede elegir el estilo, el color y el texto; lo que no elija sale de aquí:
//   · color: el de la categoría del plan
//   · estilo: uno de los tres, siempre el mismo para el mismo plan
//   · texto: el título
import { colorDeCategoria, coloresCartel, type ColorCartel, type NombreColorCartel } from '@/theme/tokens';

import type { EstiloCartel, Plan } from './tipos';

export const ESTILOS_CARTEL: readonly EstiloCartel[] = ['cinta', 'inicial', 'serie'];
export const TEXTO_CARTEL_MAX = 40;

export type CartelResuelto = { estilo: EstiloCartel; color: ColorCartel; nombreColor: NombreColorCartel; texto: string };

// Un número estable a partir de un texto (el mismo plan da siempre el mismo estilo).
function semilla(texto: string): number {
  let n = 0;
  for (let i = 0; i < texto.length; i++) n = (n * 31 + texto.charCodeAt(i)) >>> 0;
  return n;
}

const esColor = (nombre: unknown): nombre is NombreColorCartel => typeof nombre === 'string' && Object.hasOwn(coloresCartel, nombre);
const esEstilo = (estilo: unknown): estilo is EstiloCartel => ESTILOS_CARTEL.includes(estilo as EstiloCartel);

export function resolverCartel(plan: Pick<Plan, 'id' | 'titulo' | 'categoria' | 'cartel'>): CartelResuelto {
  const config = plan.cartel ?? {};
  const nombreColor = esColor(config.color) ? config.color : (colorDeCategoria[plan.categoria] ?? 'rosa');
  const estilo = esEstilo(config.estilo) ? config.estilo : ESTILOS_CARTEL[semilla(plan.id) % ESTILOS_CARTEL.length];
  const propio = typeof config.texto === 'string' ? config.texto.trim().slice(0, TEXTO_CARTEL_MAX) : '';
  return { estilo, nombreColor, color: coloresCartel[nombreColor], texto: (propio || plan.titulo).toUpperCase() };
}

// La letra grande de los estilos "inicial" y "serie": la primera letra o cifra del texto.
export function inicialDe(texto: string): string {
  return texto.match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ?? '?';
}
