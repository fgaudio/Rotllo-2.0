import { View } from 'react-native';

import { MapaPlanes } from '@/components/MapaPlanes';
import { usePlanes } from '@/lib/usePlanes';
import { crearEstilos } from '@/theme/useTema';

export default function MapaScreen() {
  const { datos } = usePlanes();
  const s = useEstilos();
  return (
    <View style={s.pantalla}>
      <MapaPlanes planes={datos} />
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
}));
