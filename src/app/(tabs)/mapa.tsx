import { StyleSheet, View } from 'react-native';

import { MapaPlanes } from '@/components/MapaPlanes';
import { planesEjemplo } from '@/lib/planes-ejemplo';
import { colores } from '@/theme/tokens';

export default function MapaScreen() {
  return (
    <View style={styles.pantalla}>
      <MapaPlanes planes={planesEjemplo} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
});
