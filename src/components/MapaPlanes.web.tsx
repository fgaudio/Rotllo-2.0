import { useTranslation } from 'react-i18next';
import { ScrollView, Text } from 'react-native';

import type { Plan } from '@/lib/tipos';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { FilaPlan } from './FilaPlan';

// Versión web del mapa: react-native-maps no funciona en navegador, así que en la web
// de respaldo enseñamos los planes en lista.
export function MapaPlanes({ planes }: { planes: Plan[] }) {
  const { t } = useTranslation();
  const s = useEstilos();
  return (
    <ScrollView contentContainerStyle={s.lista}>
      <Text style={s.aviso}>{t('mapa.soloEnApp')}</Text>
      {planes.map((plan) => (
        <FilaPlan key={plan.id} plan={plan} conDia />
      ))}
    </ScrollView>
  );
}

const useEstilos = crearEstilos((c) => ({
  lista: { padding: espacio[4], gap: espacio[5] },
  aviso: { ...texto.s, color: c.textoSuave },
}));
