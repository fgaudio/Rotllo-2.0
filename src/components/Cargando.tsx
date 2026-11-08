import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colores, espacio } from '@/theme/tokens';

// Indicador de carga con etiqueta para el lector de pantalla.
export function Cargando({ etiqueta }: { etiqueta: string }) {
  return (
    <View style={styles.contenedor} accessible accessibilityLabel={etiqueta} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colores.taronjaFuerte} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { paddingVertical: espacio[12], alignItems: 'center' },
});
