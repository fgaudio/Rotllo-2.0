import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { formatearFecha, formatearPrecio } from '@/lib/formatos';
import { tamanoDeTitulo, VISTA, type RefVista } from '@/lib/historia';
import type { Plan } from '@/lib/tipos';
import { fuentes, pop, temas } from '@/theme/tokens';

import { Cartel } from './Cartel';
import { Marca } from './Marca';

const c = temas.oscuro; // la imagen es siempre oscura, se haga con el móvil en claro o en oscuro

// Alto del cartel dentro de la imagen. Está calculado para que, con el título más largo (tres
// líneas), quepan también el sitio y el precio sin pisarse.
const ALTO_CARTEL = 216;

type Props = {
  plan: Plan;
  ancho: number; // lo que mide en pantalla; todo lo de dentro sale de aquí
  refVista: RefVista; // para poder "hacerle la foto"
};

// La imagen para stories de un plan (docs/diseno.md): 9:16, con el logo, el cartel, cuándo,
// el título, el sitio y el precio. Arriba y abajo se deja aire, porque Instagram tapa esas
// zonas con su propia interfaz. Los textos van en el idioma de la app.
export function HistoriaPlan({ plan, ancho, refVista }: Props) {
  const { t, i18n } = useTranslation();
  const u = ancho / VISTA.ancho; // 1 en un móvil normal; menos en uno pequeño
  const precio = plan.esGratis ? t('precio.gratis') : plan.precioDesdeCentimos !== null ? t('precio.desde', { precio: formatearPrecio(plan.precioDesdeCentimos, i18n.language) }) : null;
  const titulo = tamanoDeTitulo(plan.titulo) * u;
  return (
    // collapsable={false}: en Android, sin esto la vista puede "desaparecer" y no se puede fotografiar.
    <View ref={refVista} collapsable={false} style={[estilos.lienzo, { width: ancho, height: (ancho * VISTA.alto) / VISTA.ancho, paddingHorizontal: 24 * u, paddingTop: 80 * u, paddingBottom: 92 * u }]}>
      <Marca tamano={24 * u} color={pop.papel} />
      <View style={{ marginTop: 18 * u }}>
        <Cartel plan={plan} descripcion={t('plan.cartel', { titulo: plan.titulo })} ancho={ancho - 48 * u} alto={ALTO_CARTEL * u} redondeo={10 * u} />
      </View>
      <Text allowFontScaling={false} style={[estilos.cuando, { fontSize: 13 * u, lineHeight: 17 * u, marginTop: 16 * u, letterSpacing: 1.3 * u }]}>
        {formatearFecha(plan.empiezaEn, i18n.language)}
      </Text>
      <Text allowFontScaling={false} numberOfLines={3} style={[estilos.titulo, { fontSize: titulo, lineHeight: titulo * 1.1, marginTop: 6 * u }]}>
        {plan.titulo}
      </Text>
      <Text allowFontScaling={false} numberOfLines={1} style={[estilos.lugar, { fontSize: 15 * u, lineHeight: 20 * u, marginTop: 6 * u }]}>
        {[plan.local, plan.barrio].filter(Boolean).join(' · ')}
      </Text>
      <View style={estilos.hueco} />
      <View style={estilos.pie}>
        {precio ? (
          <View style={[estilos.pastilla, plan.esGratis && estilos.gratis, { height: 30 * u, paddingHorizontal: 12 * u, borderRadius: 15 * u }]}>
            <Text allowFontScaling={false} style={[estilos.pastillaTexto, { fontSize: 14 * u, lineHeight: 18 * u }]}>
              {precio}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <View style={[estilos.llamada, { height: 30 * u, paddingHorizontal: 12 * u, borderRadius: 15 * u }]}>
          <Text allowFontScaling={false} style={[estilos.llamadaTexto, { fontSize: 14 * u, lineHeight: 18 * u }]}>
            {t('compartir.mirar')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  lienzo: { backgroundColor: c.fondo, overflow: 'hidden' },
  cuando: { fontFamily: fuentes.negrita, textTransform: 'uppercase', color: pop.amarillo },
  titulo: { fontFamily: fuentes.cartel, textTransform: 'uppercase', color: c.texto },
  lugar: { fontFamily: fuentes.normal, color: c.textoSuave },
  hueco: { flex: 1 },
  pie: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pastilla: { justifyContent: 'center', backgroundColor: pop.papel },
  gratis: { backgroundColor: pop.turquesa },
  pastillaTexto: { fontFamily: fuentes.negrita, color: pop.tinta },
  llamada: { justifyContent: 'center', backgroundColor: pop.amarillo },
  llamadaTexto: { fontFamily: fuentes.negrita, color: pop.tinta },
});
