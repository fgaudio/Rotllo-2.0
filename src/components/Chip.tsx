import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, Text } from 'react-native';

import { estadoPulsado } from '@/lib/accesibilidad';
import { espacio, fuentes, radio, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Props = {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
  icono?: ComponentProps<typeof Ionicons>['name']; // un icono pequeño delante del texto
  ocupado?: boolean; // está haciendo algo (por ejemplo, buscando la ubicación)
};

// Chip de filtro (docs/diseno.md): píldora de 44 de alto. Activo: colores invertidos.
export function Chip({ etiqueta, activo, onPress, icono, ocupado }: Props) {
  const s = useEstilos();
  const { c } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      {...estadoPulsado(activo)}
      aria-busy={ocupado}
      onPress={onPress}
      style={({ pressed }) => [s.base, activo && s.activo, pressed && s.pulsado]}>
      {icono ? <Ionicons name={icono} size={16} color={activo ? c.fondo : c.texto} /> : null}
      <Text style={[s.texto, activo && s.textoActivo]}>{etiqueta}</Text>
    </Pressable>
  );
}

const useEstilos = crearEstilos((c) => ({
  base: {
    minHeight: zonaTactilMinima,
    paddingHorizontal: espacio[4] + 2,
    borderRadius: radio.pildora,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacio[1] + 2,
    backgroundColor: c.superficie,
  },
  activo: { backgroundColor: c.texto },
  pulsado: { opacity: 0.8 },
  texto: { fontFamily: fuentes.media, fontSize: 15, lineHeight: 20, color: c.texto },
  textoActivo: { color: c.fondo },
}));
