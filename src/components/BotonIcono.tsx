import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable } from 'react-native';

import { zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  etiqueta: string; // lo que lee el lector de pantalla (el botón no tiene texto)
  onPress: () => void;
};

// Botón de solo icono (docs/diseno.md): icono de 24 dentro de una zona táctil de 44×44.
export function BotonIcono({ icono, etiqueta, onPress }: Props) {
  const s = useEstilos();
  const { c } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      onPress={onPress}
      hitSlop={4}
      style={({ pressed }) => [s.base, pressed && s.pulsado]}>
      <Ionicons name={icono} size={24} color={c.texto} />
    </Pressable>
  );
}

const useEstilos = crearEstilos(() => ({
  base: { minWidth: zonaTactilMinima, minHeight: zonaTactilMinima, alignItems: 'center', justifyContent: 'center' },
  pulsado: { opacity: 0.85 },
}));
