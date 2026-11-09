import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { formatearPrecio } from '@/lib/formatos';
import type { Plan } from '@/lib/tipos';
import { borde, espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Etiqueta de precio (docs/diseno.md): de pago en tinta (o papel en oscuro), gratis en
// turquesa. Siempre con texto: no se distingue solo por el color.
export function BadgePrecio({ esGratis, precioDesdeCentimos }: Pick<Plan, 'esGratis' | 'precioDesdeCentimos'>) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const gratis = esGratis || precioDesdeCentimos == null;
  const etiqueta = gratis
    ? t('precio.gratis')
    : t('precio.desde', { precio: formatearPrecio(precioDesdeCentimos, i18n.language) });
  return (
    <View style={[s.badge, gratis ? s.gratis : s.pago]}>
      <Text style={[s.texto, gratis ? s.textoGratis : s.textoPago]}>{etiqueta}</Text>
    </View>
  );
}

// "+21": solo se enseña si el plan pide más de 18.
export function EtiquetaEdad({ edad, ayuda }: { edad: number; ayuda?: string }) {
  const { t } = useTranslation();
  const s = useEstilos();
  if (edad <= 18) return null;
  return (
    <View style={s.edad} accessible accessibilityLabel={ayuda ?? t('plan.edadMinimaAyuda', { edad })}>
      <Text style={s.textoEdad}>{t('plan.edadMinima', { edad })}</Text>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  badge: { alignSelf: 'flex-start', borderRadius: radio.s, paddingHorizontal: espacio[2], paddingVertical: 2 },
  pago: { backgroundColor: c.precio },
  gratis: { backgroundColor: c.gratis },
  texto: { ...texto.xs },
  textoPago: { color: c.sobrePrecio },
  textoGratis: { color: c.sobreGratis },
  edad: { alignSelf: 'flex-start', borderRadius: radio.s, borderWidth: borde, borderColor: c.texto, paddingHorizontal: 6 },
  textoEdad: { ...texto.xs, color: c.texto },
}));
