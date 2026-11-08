import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';

import type { Plan } from '@/lib/tipos';
import { colores, espacio, texto } from '@/theme/tokens';

import { TarjetaPlan } from './TarjetaPlan';

// Versión web del mapa: react-native-maps no funciona en navegador, así que en la web
// de respaldo enseñamos los planes en lista.
export function MapaPlanes({ planes }: { planes: Plan[] }) {
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={styles.lista}>
      <Text style={styles.aviso}>{t('mapa.soloEnApp')}</Text>
      {planes.map((plan) => (
        <TarjetaPlan key={plan.id} plan={plan} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: { padding: espacio[4], gap: espacio[4] },
  aviso: { ...texto.s, color: colores.tintaSuave },
});
