import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { textosDeFecha } from '@/lib/textosPlan';
import type { Plan } from '@/lib/tipos';
import { espacio, fuentes, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { Cartel } from './Cartel';
import { useTextoPrecio } from './Pastilla';

export const ANCHO_MINI = 164;
const ALTO_CARTEL = 212;

// Tarjeta pequeña para los carruseles (docs/diseno.md): cartel vertical con sello y tres líneas.
export function TarjetaMini({ plan }: { plan: Plan }) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const fecha = textosDeFecha(plan, t, i18n.language);
  const precio = useTextoPrecio(plan);
  return (
    <Link href={{ pathname: '/p/[id]', params: { id: plan.id } }} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={`${plan.titulo}. ${fecha.rotulo}. ${plan.barrio}`}>
        <View style={s.tarjeta}>
          <Cartel
            plan={plan}
            descripcion={t('plan.cartel', { titulo: plan.titulo })}
            ancho={ANCHO_MINI}
            alto={ALTO_CARTEL}
            sello={{ arriba: fecha.dia, abajo: fecha.hora }}
          />
          <Text style={s.rotulo} numberOfLines={1}>
            {fecha.aviso ?? fecha.rotulo}
          </Text>
          <Text style={s.titulo} numberOfLines={2}>
            {plan.titulo}
          </Text>
          <Text style={s.meta} numberOfLines={1}>
            {[plan.barrio, precio].filter(Boolean).join(' · ')}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const useEstilos = crearEstilos((c) => ({
  tarjeta: { width: ANCHO_MINI },
  rotulo: { ...texto.rotulo, fontSize: 11.5, color: c.rotulo, marginTop: espacio[3] },
  titulo: { fontFamily: fuentes.negrita, fontSize: 16, lineHeight: 20, color: c.texto, marginTop: espacio[1] },
  meta: { ...texto.xs, fontSize: 13.5, color: c.textoSuave, marginTop: espacio[1] },
}));
