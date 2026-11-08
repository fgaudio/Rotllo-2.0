import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { formatearPrecio } from '@/lib/formatos';
import type { Plan } from '@/lib/tipos';
import { colores, espacio, radio, texto } from '@/theme/tokens';

type Props = Pick<Plan, 'esGratis' | 'precioDesdeCentimos'>;

// "Gratis" (verde + texto, 5,02:1) o "Desde 8 €" (tinta + blanco, 17,49:1).
// Siempre lleva texto: no se distingue solo por el color.
export function BadgePrecio({ esGratis, precioDesdeCentimos }: Props) {
  const { t, i18n } = useTranslation();
  const etiqueta =
    esGratis || precioDesdeCentimos == null
      ? t('precio.gratis')
      : t('precio.desde', { precio: formatearPrecio(precioDesdeCentimos, i18n.language) });
  return (
    <View style={[styles.badge, esGratis ? styles.gratis : styles.pago]}>
      <Text style={styles.texto}>{etiqueta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radio.pill,
    paddingHorizontal: espacio[3],
    paddingVertical: espacio[1],
  },
  gratis: { backgroundColor: colores.exito },
  pago: { backgroundColor: colores.tinta },
  texto: { ...texto.xs, fontWeight: '700', color: colores.blanco },
});
