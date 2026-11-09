import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { espacio } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

// Indicador de carga con etiqueta para el lector de pantalla.
export function Cargando({ etiqueta }: { etiqueta: string }) {
  const { c } = useTema();
  return (
    <View style={estilos.contenedor} accessible accessibilityLabel={etiqueta} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={c.texto} />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { paddingVertical: espacio[12], alignItems: 'center' },
});
