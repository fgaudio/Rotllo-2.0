import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTranslation } from 'react-i18next';
import { ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BadgePrecio, EtiquetaEdad } from '@/components/BadgePrecio';
import { Boton } from '@/components/Boton';
import { BotonIcono } from '@/components/BotonIcono';
import { Cargando } from '@/components/Cargando';
import { EstadoVacio } from '@/components/EstadoVacio';
import { FotoPlan } from '@/components/FotoPlan';
import { enlacePlan } from '@/lib/enlaces';
import { formatearFecha } from '@/lib/formatos';
import { abrirComoLlegar } from '@/lib/mapas';
import { enlaceEntradas } from '@/lib/planes';
import type { Plan } from '@/lib/tipos';
import { usePlan } from '@/lib/usePlanes';
import { borde, espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

// Ficha del plan. Es la pantalla que abre el deep link rotllo.app/p/<id> (ADR-001).
export default function FichaPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const { datos: plan, cargando, error, recargar } = usePlan(id);

  if (cargando) {
    return (
      <View style={s.pantalla}>
        <Cargando etiqueta={t('comun.cargando')} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.pantalla}>
        <EstadoVacio
          titulo={t('comun.error.titulo')}
          texto={t('comun.error.texto')}
          boton={{ titulo: t('comun.error.boton'), onPress: recargar }}
        />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={s.pantalla}>
        <EstadoVacio
          titulo={t('plan.noExiste.titulo')}
          texto={t('plan.noExiste.texto')}
          boton={{ titulo: t('plan.noExiste.boton'), onPress: () => router.replace('/') }}
        />
      </View>
    );
  }

  const tieneTicketera = plan.modoEntradas === 'enlace_externo' && Boolean(plan.urlTicketera);

  return (
    <View style={s.pantalla}>
      {/* El título ya va grande en la ficha: arriba solo volver y compartir. */}
      <Stack.Screen
        options={{
          headerRight: () => (
            <BotonIcono icono="share-outline" etiqueta={t('plan.compartir')} onPress={() => compartir(plan, t('plan.compartirMensaje', { titulo: plan.titulo, url: enlacePlan(plan.id) }))} />
          ),
        }}
      />
      <ScrollView contentContainerStyle={s.contenido}>
        <View style={s.foto}>
          <FotoPlan uri={plan.fotoUrl} categoria={plan.categoria} descripcion={t('plan.foto', { titulo: plan.titulo })} proporcion={4 / 3} />
        </View>
        <View style={s.cuerpo}>
          <View style={s.fila}>
            <BadgePrecio esGratis={plan.esGratis} precioDesdeCentimos={plan.precioDesdeCentimos} />
            <EtiquetaEdad edad={plan.edadMinima} />
          </View>
          <Text style={s.titulo} accessibilityRole="header">
            {plan.titulo}
          </Text>
          <Dato icono="calendar-outline" texto={formatearFecha(plan.empiezaEn, i18n.language)} />
          <Dato icono="location-outline" texto={`${plan.local} · ${plan.barrio}`} />
          {plan.edadMinima > 18 ? <Dato icono="id-card-outline" texto={t('plan.edadMinimaAyuda', { edad: plan.edadMinima })} /> : null}

          <Text style={s.seccion} accessibilityRole="header">
            {t('plan.deQueVa')}
          </Text>
          <Text style={s.descripcion}>{plan.descripcion}</Text>

          <Text style={s.seccion} accessibilityRole="header">
            {t('plan.dondeEs')}
          </Text>
          <View style={s.tarjetaLugar}>
            <Text style={s.lugar}>{plan.local}</Text>
            <Text style={s.direccion}>{plan.direccion}</Text>
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
      <SafeAreaView edges={['bottom']} style={s.barraAccion}>
        {tieneTicketera ? (
          <>
            <Boton titulo={t('plan.pillarEntrada')} ayuda={t('plan.seCompraFuera')} icono="open-outline" onPress={() => abrirEntradas(plan)} />
            <Text style={s.nota}>{t('plan.seCompraFuera')}</Text>
          </>
        ) : (
          <Text style={s.libre}>{t('plan.entradaLibre')}</Text>
        )}
      </SafeAreaView>
    </View>
  );
}

// Abre el menú de compartir del móvil (WhatsApp, Instagram, copiar enlace...).
async function compartir(plan: Plan, mensaje: string) {
  try {
    await Share.share({ title: plan.titulo, message: mensaje });
  } catch {
    // En navegadores sin menú de compartir no pasa nada; el enlace llegará con el módulo 7.
  }
}

// Apunta el clic para el local (contador de la v1) y abre la ticketera dentro de la app.
async function abrirEntradas(plan: Plan) {
  const url = await enlaceEntradas(plan);
  if (url) await WebBrowser.openBrowserAsync(url);
}

function Dato({ icono, texto: valor }: { icono: 'calendar-outline' | 'location-outline' | 'id-card-outline'; texto: string }) {
  const s = useEstilos();
  const { c } = useTema();
  return (
    <View style={s.dato}>
      <Ionicons name={icono} size={20} color={c.textoSuave} />
      <Text style={s.datoTexto}>{valor}</Text>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  contenido: { paddingBottom: espacio[8] },
  foto: { borderBottomWidth: borde, borderBottomColor: c.marco },
  cuerpo: { padding: espacio[4], gap: espacio[3] },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  titulo: { ...texto.xl, color: c.texto },
  dato: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  datoTexto: { ...texto.m, color: c.textoSuave },
  seccion: { ...texto.l, color: c.texto, marginTop: espacio[4] },
  descripcion: { ...texto.m, color: c.texto },
  tarjetaLugar: {
    backgroundColor: c.superficie,
    borderWidth: borde,
    borderColor: c.marco,
    borderRadius: radio.m,
    padding: espacio[4],
    gap: espacio[2],
  },
  lugar: { ...texto.m, fontFamily: texto.xs.fontFamily, color: c.texto },
  direccion: { ...texto.s, color: c.textoSuave, marginBottom: espacio[2] },
  barraAccion: {
    backgroundColor: c.fondo,
    borderTopWidth: borde,
    borderTopColor: c.marco,
    paddingHorizontal: espacio[4],
    paddingTop: espacio[3],
    paddingBottom: espacio[3],
    gap: espacio[2],
  },
  nota: { ...texto.xs, fontFamily: texto.s.fontFamily, color: c.textoSuave, textAlign: 'center' },
  libre: { ...texto.m, fontFamily: texto.xs.fontFamily, color: c.texto, textAlign: 'center', paddingVertical: espacio[3] },
}));
