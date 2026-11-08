import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espacio, radio, texto, zonaTactilMinima } from '@/theme/tokens';

type Props = {
  etiqueta: string;
  activo: boolean;
  onPress: () => void;
};

// Chip de filtro: 44 px de alto. Activo = fondo mar + texto blanco (9,27:1).
// Inactivo = borde de control (7,19:1, más de los 3:1 que pide un control).
export function Chip({ etiqueta, activo, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={({ pressed }) => [styles.base, activo && styles.activo, pressed && styles.pulsado]}>
      <Text style={[styles.texto, activo && styles.textoActivo]}>{etiqueta}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: zonaTactilMinima,
    paddingHorizontal: espacio[4],
    borderRadius: radio.pill,
    borderWidth: 1,
    borderColor: colores.bordeControl,
    backgroundColor: colores.superficie,
    justifyContent: 'center',
  },
  activo: { backgroundColor: colores.mar, borderColor: colores.mar },
  pulsado: { opacity: 0.85 },
  texto: { ...texto.s, fontWeight: '600', color: colores.tinta },
  textoActivo: { color: colores.blanco },
});
