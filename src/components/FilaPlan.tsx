import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { textosDeFecha } from '@/lib/textosPlan';
import type { Plan } from '@/lib/tipos';
import { espacio, fuentes, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { BotonGuardar } from './BotonGuardar';
import { Cartel } from './Cartel';
import { PastillaEdad, PastillaPrecio } from './Pastilla';

type Props = {
  plan: Plan;
  conDia?: boolean; // en la agenda el día ya está en el encabezado; en búsqueda y guardados hay que decirlo
};

// Fila de plan para la agenda, la búsqueda y los guardados (docs/diseno.md):
// cartel pequeño, título, hora y sitio, precio y el corazón.
export function FilaPlan({ plan, conDia }: Props) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const fecha = textosDeFecha(plan, t, i18n.language);
  const cuando = conDia ? fecha.rotulo : fecha.hora;
  return (
    <View style={s.fila}>
      <Link href={{ pathname: '/p/[id]', params: { id: plan.id } }} asChild>
        <Pressable style={s.enlace} accessibilityRole="link" accessibilityLabel={`${plan.titulo}. ${fecha.rotulo}. ${plan.local}, ${plan.barrio}`}>
          <View style={s.contenido}>
            <Cartel plan={plan} descripcion={t('plan.cartel', { titulo: plan.titulo })} ancho={84} alto={84} />
            <View style={s.textos}>
              <Text style={s.titulo} numberOfLines={2}>
                {plan.titulo}
              </Text>
              <Text style={s.meta} numberOfLines={2}>
                {cuando} · {plan.local}, {plan.barrio}
              </Text>
              <View style={s.pastillas}>
                <PastillaPrecio plan={plan} tamano="pequena" />
                <PastillaEdad edad={plan.edadMinima} tamano="pequena" />
              </View>
            </View>
          </View>
        </Pressable>
      </Link>
      <BotonGuardar planId={plan.id} variante="plano" />
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio[1] },
  enlace: { flex: 1 },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: espacio[4] - 2, flex: 1 },
  textos: { flex: 1, gap: espacio[1] },
  titulo: { fontFamily: fuentes.negrita, fontSize: 17, lineHeight: 21, color: c.texto },
  meta: { ...texto.xs, fontSize: 14, lineHeight: 19, color: c.textoSuave },
  pastillas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[1] + 2, marginTop: espacio[1] },
}));
