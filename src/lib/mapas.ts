// "Cómo llegar" (ADR-004): no calculamos rutas, abrimos la app de mapas del móvil.
// Es gratis y la gente ya sabe usarla.
import { Linking, Platform } from 'react-native';

import type { Plan } from './tipos';

export function urlComoLlegar(
  plan: Pick<Plan, 'direccion' | 'lat' | 'lng'>,
  plataforma: string = Platform.OS,
): string {
  if (plataforma === 'ios') {
    return `https://maps.apple.com/?daddr=${encodeURIComponent(plan.direccion)}&ll=${plan.lat},${plan.lng}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${plan.lat},${plan.lng}`;
}

export function abrirComoLlegar(plan: Pick<Plan, 'direccion' | 'lat' | 'lng'>) {
  return Linking.openURL(urlComoLlegar(plan));
}
