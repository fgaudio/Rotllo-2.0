import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

import { pop, radio, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  etiqueta: string; // lo que lee el lector de pantalla (el botón no tiene texto)
  onPress: () => void;
  variante?: 'superficie' | 'superficie2' | 'cristal' | 'plano';
  color?: string;
  seleccionado?: boolean;
};

// Botón redondo de solo icono (docs/diseno.md): 44×44. "cristal" va encima de un cartel.
export function BotonRedondo({ icono, etiqueta, onPress, variante = 'superficie', color, seleccionado }: Props) {
  const s = useEstilos();
  const { c } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={seleccionado === undefined ? undefined : { selected: seleccionado }}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [s.base, s[variante], pressed && s.pulsado]}>
      <Ionicons name={icono} size={22} color={color ?? (variante === 'cristal' ? pop.papel : c.texto)} />
    </Pressable>
  );
}

const useEstilos = crearEstilos((c) => ({
  base: { width: zonaTactilMinima, height: zonaTactilMinima, borderRadius: radio.pildora, alignItems: 'center', justifyContent: 'center' },
  superficie: { backgroundColor: c.superficie },
  superficie2: { backgroundColor: c.superficie2 },
  cristal: { backgroundColor: 'rgba(11,11,13,0.6)' },
  plano: {},
  pulsado: { opacity: 0.7, transform: [{ scale: 0.94 }] },
}));
