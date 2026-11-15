import { SafeAreaView } from 'react-native-safe-area-context';

import { MapaPlanes } from '@/components/MapaPlanes';
import { puntoDe, useUbicacion } from '@/lib/ubicacion';
import { usePlanes } from '@/lib/usePlanes';
import { crearEstilos } from '@/theme/useTema';

// Pestaña Mapa. En el móvil, el mapa con los planes; en la web, los planes en lista.
// Con «Cerca de mí» puesto (aquí o en el feed), los planes llegan ordenados por cercanía.
export default function MapaScreen() {
  const ubicacion = useUbicacion();
  const { datos } = usePlanes(null, null, puntoDe(ubicacion));
  const s = useEstilos();
  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <MapaPlanes planes={datos} ubicacion={ubicacion} />
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
}));
