import { SafeAreaView } from 'react-native-safe-area-context';

import { MapaPlanes } from '@/components/MapaPlanes';
import { usePlanes } from '@/lib/usePlanes';
import { crearEstilos } from '@/theme/useTema';

export default function MapaScreen() {
  const { datos } = usePlanes();
  const s = useEstilos();
  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <MapaPlanes planes={datos} />
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
}));
