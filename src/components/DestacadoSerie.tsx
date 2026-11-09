import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { formatearFecha } from '@/lib/formatos';
import type { Plan } from '@/lib/tipos';
import { borde, espacio, parejasSerie, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { BadgePrecio, EtiquetaEdad } from './BadgePrecio';
import { IlustracionPlan } from './IlustracionPlan';

type Props = {
  plan: Plan;
  rotulo: string; // "El plan de hoy" / "Lo próximo"
};

// Destacado (docs/diseno.md): el plan en una serie 2×2 con 4 parejas de color, como los
// retratos de Warhol, y su cartela debajo. Es la firma de la dirección Serie Warhol.
export function DestacadoSerie({ plan, rotulo }: Props) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const fecha = formatearFecha(plan.empiezaEn, i18n.language);
  return (
    <Link href={{ pathname: '/p/[id]', params: { id: plan.id } }} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={`${rotulo}: ${plan.titulo}. ${fecha}. ${plan.barrio}`}>
        <View style={s.caja}>
          <View style={s.serie}>
            {parejasSerie.map((pareja, i) => (
              <View key={i} style={s.panel}>
                <IlustracionPlan categoria={plan.categoria} pareja={pareja} descripcion={i === 0 ? t('plan.foto', { titulo: plan.titulo }) : ''} />
              </View>
            ))}
          </View>
          <View style={s.cartela}>
            <Text style={s.rotulo}>{rotulo}</Text>
            <Text style={s.titulo}>{plan.titulo}</Text>
            <Text style={s.meta}>
              {fecha} · {plan.barrio}
            </Text>
            <View style={s.etiquetas}>
              <BadgePrecio esGratis={plan.esGratis} precioDesdeCentimos={plan.precioDesdeCentimos} />
              <EtiquetaEdad edad={plan.edadMinima} />
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const useEstilos = crearEstilos((c) => ({
  caja: { borderWidth: borde, borderColor: c.marco, borderRadius: radio.m, backgroundColor: c.superficie, overflow: 'hidden' },
  serie: { flexDirection: 'row', flexWrap: 'wrap', gap: borde, backgroundColor: c.marco },
  panel: { width: '49.7%', aspectRatio: 1.25, flexGrow: 1 },
  cartela: { padding: espacio[4], gap: espacio[1], borderTopWidth: borde, borderTopColor: c.marco },
  rotulo: { ...texto.xs, color: c.textoSuave, letterSpacing: 1, textTransform: 'uppercase' },
  titulo: { ...texto.l, color: c.texto },
  meta: { ...texto.s, color: c.textoSuave },
  etiquetas: { flexDirection: 'row', gap: espacio[2], marginTop: espacio[1] },
}));
