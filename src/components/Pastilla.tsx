import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { formatearPrecio } from '@/lib/formatos';
import type { Plan } from '@/lib/tipos';
import { espacio, fuentes, radio } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

type Tamano = 'normal' | 'pequena';

// El precio en texto: "Gratis", "Desde 8 €" o nada si el local no lo ha puesto.
export function useTextoPrecio(plan: Pick<Plan, 'esGratis' | 'precioDesdeCentimos'>): string | null {
  const { t, i18n } = useTranslation();
  if (plan.esGratis) return t('precio.gratis');
  if (plan.precioDesdeCentimos === null) return null;
  return t('precio.desde', { precio: formatearPrecio(plan.precioDesdeCentimos, i18n.language) });
}

// Pastilla de precio (docs/diseno.md). "Gratis" va en turquesa; el color no es lo único que lo dice.
export function PastillaPrecio({ plan, tamano = 'normal' }: { plan: Pick<Plan, 'esGratis' | 'precioDesdeCentimos'>; tamano?: Tamano }) {
  const s = useEstilos();
  const precio = useTextoPrecio(plan);
  if (!precio) return null;
  return (
    <View style={[s.base, tamano === 'pequena' && s.pequena, plan.esGratis ? s.gratis : s.precio]}>
      <Text style={[s.texto, tamano === 'pequena' && s.textoPequeno, plan.esGratis ? s.textoGratis : s.textoPrecio]}>{precio}</Text>
    </View>
  );
}

// "+21": solo cuando el local pide más de 18 (toda la app ya es +18).
export function PastillaEdad({ edad, tamano = 'normal' }: { edad: number; tamano?: Tamano }) {
  const { t } = useTranslation();
  const s = useEstilos();
  if (edad <= 18) return null;
  return (
    <View style={[s.base, tamano === 'pequena' && s.pequena, s.linea]} accessible accessibilityLabel={t('plan.edadMinimaAyuda', { edad })}>
      <Text style={[s.texto, tamano === 'pequena' && s.textoPequeno, s.textoLinea]}>{t('plan.edadMinima', { edad })}</Text>
    </View>
  );
}

// Pastilla con contorno para una etiqueta suelta (la categoría en la ficha).
export function PastillaLinea({ texto }: { texto: string }) {
  const s = useEstilos();
  return (
    <View style={[s.base, s.linea]}>
      <Text style={[s.texto, s.textoLinea]}>{texto}</Text>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  base: { alignSelf: 'flex-start', height: 28, paddingHorizontal: espacio[3] - 2, borderRadius: radio.pildora, justifyContent: 'center' },
  pequena: { height: 24, paddingHorizontal: espacio[2] },
  precio: { backgroundColor: c.texto },
  gratis: { backgroundColor: c.gratis },
  linea: { borderWidth: 1.5, borderColor: c.textoSuave },
  texto: { fontFamily: fuentes.negrita, fontSize: 13, lineHeight: 17 },
  textoPequeno: { fontSize: 12, lineHeight: 16 },
  textoPrecio: { color: c.fondo },
  textoGratis: { color: c.sobreGratis },
  textoLinea: { color: c.texto },
}));
