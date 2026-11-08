import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BadgePrecio } from '@/components/BadgePrecio';
import { Boton } from '@/components/Boton';
import { EstadoVacio } from '@/components/EstadoVacio';
import { FotoPlan } from '@/components/FotoPlan';
import { formatearFecha } from '@/lib/formatos';
import { abrirComoLlegar } from '@/lib/mapas';
import { buscarPlan } from '@/lib/planes-ejemplo';
import { colores, espacio, radio, sombraTarjeta, texto } from '@/theme/tokens';

// Ficha del plan. Es la pantalla que abre el deep link rotllo.app/p/<id> (ADR-001).
export default function FichaPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const plan = buscarPlan(id);

  if (!plan) {
    return (
      <View style={styles.pantalla}>
        <EstadoVacio
          titulo={t('plan.noExiste.titulo')}
          texto={t('plan.noExiste.texto')}
          boton={{ titulo: t('plan.noExiste.boton'), onPress: () => router.replace('/') }}
        />
      </View>
    );
  }

  const urlTicketera = plan.modoEntradas === 'enlace_externo' ? plan.urlTicketera : null;

  return (
    <View style={styles.pantalla}>
      <Stack.Screen options={{ title: plan.titulo }} />
      <ScrollView contentContainerStyle={styles.contenido}>
        <FotoPlan uri={plan.fotoUrl} descripcion={t('plan.foto', { titulo: plan.titulo })} />
        <View style={styles.cuerpo}>
          <View style={styles.fila}>
            <BadgePrecio esGratis={plan.esGratis} precioDesdeCentimos={plan.precioDesdeCentimos} />
            {plan.edadMinima > 18 ? (
              <Text
                style={styles.edad}
                accessibilityLabel={t('plan.edadMinimaAyuda', { edad: plan.edadMinima })}>
                {t('plan.edadMinima', { edad: plan.edadMinima })}
              </Text>
            ) : null}
          </View>
          <Text style={styles.titulo} accessibilityRole="header">
            {plan.titulo}
          </Text>
          <Dato icono="calendar-outline" texto={formatearFecha(plan.empiezaEn, i18n.language)} />
          <Dato icono="location-outline" texto={`${plan.local} · ${plan.barrio}`} />

          <Text style={styles.seccion} accessibilityRole="header">
            {t('plan.deQueVa')}
          </Text>
          <Text style={styles.descripcion}>{plan.descripcion}</Text>

          <Text style={styles.seccion} accessibilityRole="header">
            {t('plan.dondeEs')}
          </Text>
          <View style={styles.tarjetaLugar}>
            <Text style={styles.lugar}>{plan.local}</Text>
            <Text style={styles.direccion}>{plan.direccion}</Text>
            <Boton
              titulo={t('plan.comoLlegar')}
              ayuda={t('plan.comoLlegarAyuda')}
              icono="navigate-outline"
              variante="secundario"
              onPress={() => abrirComoLlegar(plan)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Acción principal abajo, al alcance del pulgar. En v1, la entrada se compra fuera. */}
      <SafeAreaView edges={['bottom']} style={styles.barraAccion}>
        {urlTicketera ? (
          <>
            <Boton
              titulo={t('plan.pillarEntrada')}
              ayuda={t('plan.seCompraFuera')}
              icono="open-outline"
              onPress={() => WebBrowser.openBrowserAsync(urlTicketera)}
            />
            <Text style={styles.nota}>{t('plan.seCompraFuera')}</Text>
          </>
        ) : (
          <Text style={styles.libre}>{t('plan.entradaLibre')}</Text>
        )}
      </SafeAreaView>
    </View>
  );
}

function Dato({ icono, texto: valor }: { icono: 'calendar-outline' | 'location-outline'; texto: string }) {
  return (
    <View style={styles.dato}>
      <Ionicons name={icono} size={20} color={colores.tintaSuave} />
      <Text style={styles.datoTexto}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { paddingBottom: espacio[8] },
  cuerpo: { padding: espacio[4], gap: espacio[3] },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  edad: { ...texto.xs, fontWeight: '700', color: colores.tinta },
  titulo: { ...texto.xl, fontWeight: '800', color: colores.tinta },
  dato: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  datoTexto: { ...texto.m, color: colores.tintaSuave },
  seccion: { ...texto.l, fontWeight: '700', color: colores.tinta, marginTop: espacio[4] },
  descripcion: { ...texto.m, color: colores.tinta },
  tarjetaLugar: {
    backgroundColor: colores.superficie,
    borderRadius: radio.m,
    padding: espacio[4],
    gap: espacio[2],
    ...sombraTarjeta,
  },
  lugar: { ...texto.m, fontWeight: '700', color: colores.tinta },
  direccion: { ...texto.s, color: colores.tintaSuave, marginBottom: espacio[2] },
  barraAccion: {
    backgroundColor: colores.superficie,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
    paddingHorizontal: espacio[4],
    paddingTop: espacio[3],
    paddingBottom: espacio[3],
    gap: espacio[2],
  },
  nota: { ...texto.xs, color: colores.tintaSuave, textAlign: 'center' },
  libre: { ...texto.m, fontWeight: '600', color: colores.tinta, textAlign: 'center', paddingVertical: espacio[3] },
});
