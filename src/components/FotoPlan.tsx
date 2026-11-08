import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colores } from '@/theme/tokens';

type Props = {
  uri: string | null;
  descripcion: string; // texto alternativo para el lector de pantalla
};

// Foto del plan con expo-image (caché en el móvil, ADR-005).
// Sin foto todavía: un fondo de marca con un icono.
export function FotoPlan({ uri, descripcion }: Props) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={styles.foto}
        contentFit="cover"
        transition={200}
        accessibilityLabel={descripcion}
      />
    );
  }
  return (
    <View
      style={[styles.foto, styles.sinFoto]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={descripcion}>
      <Ionicons name="sparkles" size={36} color={colores.tinta} />
    </View>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', aspectRatio: 16 / 9 },
  sinFoto: {
    backgroundColor: colores.taronja,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
