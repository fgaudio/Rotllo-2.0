import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { borde, espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

// Aviso de que una pantalla todavía no hace lo que dice (por ejemplo, el registro antes del
// módulo de login). Se quita cuando la pantalla funcione de verdad.
export function AvisoPrueba({ texto: mensaje }: { texto: string }) {
  const s = useEstilos();
  const { c } = useTema();
  return (
    <View style={s.caja} accessibilityRole="text">
      <Ionicons name="construct-outline" size={16} color={c.texto} />
      <Text style={s.texto}>{mensaje}</Text>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  caja: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio[2],
    padding: espacio[2],
    borderWidth: borde,
    borderColor: c.marco,
    borderStyle: 'dashed',
    borderRadius: radio.m,
  },
  texto: { ...texto.xs, color: c.texto, flex: 1 },
}));
