import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Share, Text, View } from 'react-native';

import { enlacePlan } from '@/lib/enlaces';
import { textosDeFecha } from '@/lib/textosPlan';
import type { Plan } from '@/lib/tipos';
import { espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { BotonGuardar } from './BotonGuardar';
import { BotonRedondo } from './BotonRedondo';
import { Cartel } from './Cartel';
import { PastillaEdad, PastillaPrecio } from './Pastilla';
import { RotuloVivo } from './RotuloVivo';

// Abre el menú de compartir del móvil (WhatsApp, Instagram, copiar enlace...).
// En un navegador sin ese menú (un ordenador), copia el enlace y devuelve 'copiado' para avisar.
export async function compartirPlan(plan: Pick<Plan, 'id' | 'titulo'>, mensaje: string): Promise<'compartido' | 'copiado' | 'nada'> {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
      await navigator.clipboard.writeText(enlacePlan(plan.id));
      return 'copiado';
    }
    // En iPhone el enlace va aparte (así sale la vista previa); en Android va dentro del mensaje.
    await Share.share(Platform.OS === 'ios' ? { message: plan.titulo, url: enlacePlan(plan.id) } : { title: plan.titulo, message: mensaje });
    return 'compartido';
  } catch {
    return 'nada'; // la persona cerró el menú
  }
}

// El plan destacado del feed (docs/diseno.md): cartel ancho y, pegada debajo, toda la
// información. Tiene que verse entera sin bajar: qué es, cuándo, dónde y cuánto.
export function TarjetaDestacada({ plan }: { plan: Plan }) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const fecha = textosDeFecha(plan, t, i18n.language);
  return (
    <View style={s.tarjeta}>
      <Link href={{ pathname: '/p/[id]', params: { id: plan.id } }} asChild>
        <Pressable accessibilityRole="link" accessibilityLabel={`${plan.titulo}. ${fecha.rotulo}. ${plan.local}, ${plan.barrio}`}>
          {/* El estilo va en la View de dentro: en la web, Link asChild no reenvía el estilo del Pressable. */}
          <View>
            <Cartel plan={plan} descripcion={t('plan.cartel', { titulo: plan.titulo })} proporcion={1.52} redondeo={0} sello={{ arriba: fecha.dia, abajo: fecha.hora }} />
            <View style={s.info}>
              {fecha.aviso ? <RotuloVivo texto={fecha.aviso} /> : <Text style={s.rotulo}>{fecha.rotulo}</Text>}
              <Text style={s.titulo} numberOfLines={2} accessibilityRole="header">
                {plan.titulo}
              </Text>
              <Text style={s.lugar} numberOfLines={1}>
                {plan.local} · {plan.barrio}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>
      <View style={s.acciones}>
        <PastillaPrecio plan={plan} />
        <PastillaEdad edad={plan.edadMinima} />
        <View style={s.hueco} />
        <BotonRedondo
          icono="share-outline"
          etiqueta={t('plan.compartir')}
          variante="superficie2"
          onPress={() => compartirPlan(plan, t('plan.compartirMensaje', { titulo: plan.titulo, url: enlacePlan(plan.id) }))}
        />
        <BotonGuardar planId={plan.id} />
      </View>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  tarjeta: { borderRadius: radio.l, overflow: 'hidden', backgroundColor: c.superficie },
  info: { paddingHorizontal: espacio[4], paddingTop: espacio[4] - 2, gap: espacio[1] + 2 },
  rotulo: { ...texto.rotulo, color: c.rotulo },
  titulo: { ...texto.titulo, color: c.texto },
  lugar: { ...texto.s, color: c.textoSuave },
  acciones: { flexDirection: 'row', alignItems: 'center', gap: espacio[2], paddingHorizontal: espacio[4], paddingTop: espacio[3] - 2, paddingBottom: espacio[4] - 2 },
  hueco: { flex: 1 },
}));
