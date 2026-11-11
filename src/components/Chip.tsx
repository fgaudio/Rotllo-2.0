import { Pressable, Text } from 'react-native';

import { espacio, fuentes, radio, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

type Props = {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
};

// Chip de filtro (docs/diseno.md): píldora de 44 de alto. Activo: colores invertidos.
export function Chip({ etiqueta, activo, onPress }: Props) {
  const s = useEstilos();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={({ pressed }) => [s.base, activo && s.activo, pressed && s.pulsado]}>
      <Text style={[s.texto, activo && s.textoActivo]}>{etiqueta}</Text>
    </Pressable>
  );
}

const useEstilos = crearEstilos((c) => ({
  base: { minHeight: zonaTactilMinima, paddingHorizontal: espacio[4] + 2, borderRadius: radio.pildora, justifyContent: 'center', backgroundColor: c.superficie },
  activo: { backgroundColor: c.texto },
  pulsado: { opacity: 0.8 },
  texto: { fontFamily: fuentes.media, fontSize: 15, lineHeight: 20, color: c.texto },
  textoActivo: { color: c.fondo },
}));
