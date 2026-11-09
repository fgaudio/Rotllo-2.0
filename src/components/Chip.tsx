import { Pressable, Text } from 'react-native';

import { borde, espacio, fuentes, radio, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

type Props = {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
};

// Chip de filtro o de categoría (docs/diseno.md): 44 de alto, radio 4, marco de 2 px.
// Activo: los colores del botón principal.
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
  base: {
    minHeight: zonaTactilMinima,
    paddingHorizontal: espacio[4],
    borderRadius: radio.m,
    borderWidth: borde,
    borderColor: c.marco,
    justifyContent: 'center',
  },
  activo: { backgroundColor: c.principal, borderColor: c.principal },
  pulsado: { opacity: 0.85 },
  texto: { fontFamily: fuentes.media, fontSize: 15, lineHeight: 20, color: c.texto },
  textoActivo: { color: c.sobrePrincipal },
}));
