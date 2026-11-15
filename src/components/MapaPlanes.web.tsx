import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import type { Plan } from '@/lib/tipos';
import { alternarCerca, puntoDe, type Ubicacion } from '@/lib/ubicacion';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { AvisoUbicacion } from './AvisoUbicacion';
import { Chip } from './Chip';
import { FilaPlan } from './FilaPlan';

// Versión web del mapa: react-native-maps no funciona en navegador, así que en la web
// de respaldo enseñamos los planes en lista. Con «Cerca de mí», por cercanía y con la distancia.
export function MapaPlanes({ planes, ubicacion }: { planes: Plan[]; ubicacion: Ubicacion }) {
  const { t } = useTranslation();
  const s = useEstilos();
  const cerca = puntoDe(ubicacion);
  const buscandome = ubicacion.estado === 'buscando';
  return (
    <ScrollView contentContainerStyle={s.lista}>
      <Text style={s.aviso}>{t('mapa.soloEnApp')}</Text>
      <View>
        <View style={s.filtros}>
          <Chip
            icono="navigate"
            etiqueta={buscandome ? t('cerca.buscando') : t('feed.filtro.cerca')}
            activo={cerca !== null || buscandome}
            ocupado={buscandome}
            onPress={alternarCerca}
          />
        </View>
        <View style={s.sinMargen}>
          <AvisoUbicacion ubicacion={ubicacion} />
        </View>
      </View>
      {planes.map((plan) => (
        <FilaPlan key={plan.id} plan={plan} conDia desde={cerca} />
      ))}
    </ScrollView>
  );
}

const useEstilos = crearEstilos((c) => ({
  lista: { padding: espacio[4], gap: espacio[5], width: '100%', maxWidth: 560, alignSelf: 'center' },
  aviso: { ...texto.s, color: c.textoSuave },
  filtros: { flexDirection: 'row' },
  sinMargen: { marginHorizontal: -espacio[4] }, // el aviso trae su propio margen lateral
}));
