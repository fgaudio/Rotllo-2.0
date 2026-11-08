import { StyleSheet, View } from 'react-native';

import { MapaPlanes } from '@/components/MapaPlanes';
import { usePlanes } from '@/lib/usePlanes';
import { colores } from '@/theme/tokens';

export default function MapaScreen() {
  const { datos } = usePlanes();
  return (
    <View style={styles.pantalla}>
      <MapaPlanes planes={datos} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
});
