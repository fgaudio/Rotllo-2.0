import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatearFecha } from '@/lib/formatos';
import type { Plan } from '@/lib/tipos';
import { colores, espacio, radio, sombraTarjeta, texto } from '@/theme/tokens';

import { BadgePrecio } from './BadgePrecio';
import { FotoPlan } from './FotoPlan';

// Tarjeta de plan (guía): foto 16:9, título, metadatos y precio. Toda la tarjeta se pulsa.
export function TarjetaPlan({ plan }: { plan: Plan }) {
  const { t, i18n } = useTranslation();
  const fecha = formatearFecha(plan.empiezaEn, i18n.language);
  return (
    <Link href={{ pathname: '/p/[id]', params: { id: plan.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${plan.titulo}. ${fecha}. ${plan.barrio}`}
        // El estilo va en la View de dentro: en la web, Link asChild no reenvía el estilo del Pressable.
      >
        <View style={styles.tarjeta}>
          <FotoPlan uri={plan.fotoUrl} descripcion={t('plan.foto', { titulo: plan.titulo })} />
          <View style={styles.cuerpo}>
            <View style={styles.fila}>
              <BadgePrecio esGratis={plan.esGratis} precioDesdeCentimos={plan.precioDesdeCentimos} />
              {plan.edadMinima > 18 ? (
                <Text style={styles.edad}>{t('plan.edadMinima', { edad: plan.edadMinima })}</Text>
              ) : null}
            </View>
            <Text style={styles.titulo}>{plan.titulo}</Text>
            <Text style={styles.meta}>
              {fecha} · {plan.barrio}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radio.m,
    overflow: 'hidden',
    ...sombraTarjeta,
  },
  cuerpo: { padding: espacio[4], gap: espacio[2] },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  edad: { ...texto.xs, fontWeight: '700', color: colores.tinta },
  titulo: { ...texto.l, fontWeight: '700', color: colores.tinta },
  meta: { ...texto.s, color: colores.tintaSuave },
});
