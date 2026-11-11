import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { BotonGuardar } from '@/components/BotonGuardar';
import { BotonRedondo } from '@/components/BotonRedondo';
import { Cargando } from '@/components/Cargando';
import { Cartel } from '@/components/Cartel';
import { EstadoVacio } from '@/components/EstadoVacio';
import { MapaMini } from '@/components/MapaMini';
import { PastillaLinea, useTextoPrecio } from '@/components/Pastilla';
import { RotuloVivo } from '@/components/RotuloVivo';
import { compartirPlan } from '@/components/TarjetaDestacada';
import { TarjetaMini } from '@/components/TarjetaMini';
import { diaDe } from '@/lib/agenda';
import { nombreCategoria } from '@/lib/categorias';
import { enlacePlan } from '@/lib/enlaces';
import { formatearHora } from '@/lib/formatos';
import { abrirComoLlegar } from '@/lib/mapas';
import { enlaceEntradas } from '@/lib/planes';
import { textosDeFecha } from '@/lib/textosPlan';
import type { Plan } from '@/lib/tipos';
import { usePlan, usePlanes } from '@/lib/usePlanes';
import { espacio, fuentes, pop, radio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

const ANCHO_MAXIMO = 560; // en pantallas anchas (web, tablet) la ficha no se estira más
const mayuscula = (frase: string) => frase.charAt(0).toUpperCase() + frase.slice(1);

function volver() {
  // Quien llega por un enlace (Instagram, WhatsApp) no tiene pantalla anterior: va a los planes.
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Ficha del plan (docs/diseno.md). Es la pantalla que abre el deep link rotllo.app/p/<id> (ADR-001).
export default function FichaPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const s = useEstilos();
  const margenes = useSafeAreaInsets();
  const { datos: plan, cargando, error, recargar } = usePlan(id);

  if (cargando || error || !plan) {
    return (
      <View style={[s.pantalla, { paddingTop: margenes.top + espacio[1] }]}>
        <View style={s.soloVolver}>
          <BotonRedondo icono="chevron-back" etiqueta={t('comun.volver')} onPress={volver} />
        </View>
        {cargando ? (
          <View style={s.margen}>
            <Cargando etiqueta={t('comun.cargando')} />
          </View>
        ) : error ? (
          <EstadoVacio titulo={t('comun.error.titulo')} texto={t('comun.error.texto')} boton={{ titulo: t('comun.error.boton'), onPress: recargar }} />
        ) : (
          <EstadoVacio
            titulo={t('plan.noExiste.titulo')}
            texto={t('plan.noExiste.texto')}
            boton={{ titulo: t('plan.noExiste.boton'), onPress: () => router.replace('/') }}
          />
        )}
      </View>
    );
  }
  return <Ficha plan={plan} />;
}

function Ficha({ plan }: { plan: Plan }) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const margenes = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [barraSolida, setBarraSolida] = useState(false);
  const otros = usePlanes(null).datos.filter((otro) => otro.id !== plan.id).slice(0, 6);

  const ancho = Math.min(width, ANCHO_MAXIMO);
  // En pantallas anchas, las barras de arriba y de abajo se alinean con la columna del contenido.
  const lateral = Math.max(0, (width - ANCHO_MAXIMO) / 2);
  const altoCartel = Math.round(ancho * 1.08);
  const fecha = textosDeFecha(plan, t, i18n.language);
  const { cuando } = diaDe(plan, new Date());
  const precio = useTextoPrecio(plan);
  const categoria = nombreCategoria(t, plan.categoria);
  const tieneTicketera = plan.modoEntradas === 'enlace_externo' && Boolean(plan.urlTicketera);
  const mensaje = t('plan.compartirMensaje', { titulo: plan.titulo, url: enlacePlan(plan.id) });
  const [copiado, setCopiado] = useState(false);
  const compartir = async () => {
    if ((await compartirPlan(plan, mensaje)) !== 'copiado') return;
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Cuándo: "Hoy, 23:00" + la fecha entera, o la fecha entera + la hora si es otro día.
  const hasta = plan.terminaEn ? ` · ${t('cuando.hasta', { hora: formatearHora(plan.terminaEn, i18n.language) })}` : '';
  const cercano = cuando !== 'otro';
  const cuandoTitulo = cercano ? `${fecha.dia}, ${fecha.hora}` : mayuscula(fecha.completa);
  const cuandoTexto = cercano ? `${mayuscula(fecha.completa)}${hasta}` : `${fecha.hora}${hasta}`;

  // Cuánto y cómo se entra.
  const comoSeEntra = tieneTicketera ? t('plan.seCompraFuera') : plan.esGratis ? t('plan.entradaLibre') : t('plan.enPuerta');
  const comoSeEntraCorto = tieneTicketera ? t('plan.enLaWeb') : plan.esGratis ? t('plan.sinReserva') : t('plan.enPuerta');

  // La primera frase de la descripción va más grande, como entradilla.
  const corte = plan.descripcion.search(/[.!?]\s/);
  const entradilla = corte === -1 ? plan.descripcion : plan.descripcion.slice(0, corte + 1);
  const resto = corte === -1 ? '' : plan.descripcion.slice(corte + 2);

  return (
    <View style={s.pantalla}>
      <ScrollView
        contentContainerStyle={[s.contenido, { paddingBottom: espacio[8] }]}
        scrollEventThrottle={32}
        onScroll={(e) => setBarraSolida(e.nativeEvent.contentOffset.y > altoCartel - 110)}>
        <View style={s.columna}>
          <Cartel plan={plan} descripcion={t('plan.cartel', { titulo: plan.titulo })} ancho={ancho} alto={altoCartel} redondeo={0} />

          <View style={s.cuerpo}>
            <View style={s.arribaTitulo}>
              {categoria ? <PastillaLinea texto={categoria} /> : null}
              {fecha.aviso ? <RotuloVivo texto={fecha.aviso} /> : null}
            </View>
            <Text style={s.titulo} accessibilityRole="header">
              {plan.titulo}
            </Text>

            <View style={s.datos}>
              <Dato icono="calendar-outline" titulo={cuandoTitulo} texto={cuandoTexto} />
              <Dato
                icono="location-outline"
                titulo={plan.local}
                texto={[plan.direccion, plan.barrio].filter(Boolean).join(' · ')}
                onPress={() => abrirComoLlegar(plan)}
                ayuda={t('plan.comoLlegarAyuda')}
              />
              <Dato icono="ticket-outline" titulo={precio ?? comoSeEntraCorto} texto={comoSeEntra} />
              {plan.edadMinima > 18 ? (
                <Dato icono="id-card-outline" titulo={t('plan.edadMinima', { edad: plan.edadMinima })} texto={t('plan.edadMinimaAyuda', { edad: plan.edadMinima })} />
              ) : null}
            </View>
          </View>

          <Bloque titulo={t('plan.deQueVa')}>
            <Text style={s.entradilla}>{entradilla}</Text>
            {resto ? <Text style={s.parrafo}>{resto}</Text> : null}
          </Bloque>

          {/* Compartir tiene su propio bloque: un plan con tu gente es lo que hace que vayas. */}
          <View style={s.gente}>
            <View style={s.corro} />
            <Text style={s.genteTitulo} accessibilityRole="header">
              {t('plan.gente.titulo')}
            </Text>
            <Text style={s.genteTexto}>{t('plan.gente.texto')}</Text>
            <View style={s.genteBoton}>
              <Boton titulo={copiado ? t('plan.enlaceCopiado') : t('plan.gente.boton')} icono={copiado ? 'checkmark' : 'share-outline'} variante="tinta" compacto onPress={compartir} />
            </View>
          </View>

          <Bloque titulo={t('plan.dondeEs')}>
            <MapaMini lat={plan.lat} lng={plan.lng} etiqueta={`${plan.local}, ${plan.direccion}`} />
            <View style={s.sitio}>
              <View style={s.sitioTextos}>
                <Text style={s.sitioNombre}>{plan.local}</Text>
                <Text style={s.sitioDireccion}>{plan.direccion}</Text>
              </View>
              {tieneTicketera ? (
                <Boton titulo={t('plan.comoLlegar')} ayuda={t('plan.comoLlegarAyuda')} icono="navigate-outline" variante="superficie" compacto onPress={() => abrirComoLlegar(plan)} />
              ) : null}
            </View>
          </Bloque>

          {otros.length > 0 ? (
            <>
              <Text style={s.masPlanes} accessibilityRole="header">
                {t('plan.masPlanes')}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carril}>
                {otros.map((otro) => (
                  <TarjetaMini key={otro.id} plan={otro} />
                ))}
              </ScrollView>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Arriba: volver, compartir y guardar. Al bajar, la barra se hace opaca y enseña el título. */}
      <View style={[s.arriba, { paddingTop: margenes.top + espacio[1], paddingHorizontal: lateral + espacio[3] }, barraSolida && s.arribaSolida]}>
        <BotonRedondo icono="chevron-back" etiqueta={t('comun.volver')} variante={barraSolida ? 'plano' : 'cristal'} onPress={volver} />
        {barraSolida ? (
          <Text style={s.arribaTituloBarra} numberOfLines={1}>
            {plan.titulo}
          </Text>
        ) : (
          <View style={s.hueco} />
        )}
        <BotonRedondo icono="share-outline" etiqueta={t('plan.compartir')} variante={barraSolida ? 'plano' : 'cristal'} onPress={compartir} />
        <BotonGuardar planId={plan.id} variante={barraSolida ? 'plano' : 'cristal'} />
      </View>

      {/* Abajo, siempre a mano: el precio y la acción principal. */}
      <View style={[s.barra, { paddingBottom: Math.max(margenes.bottom, espacio[3]), paddingHorizontal: lateral + espacio[4] }]}>
        <View style={s.barraPrecio}>
          <Text style={s.barraImporte} numberOfLines={1}>
            {precio ?? comoSeEntraCorto}
          </Text>
          {precio ? (
            <Text style={s.barraNota} numberOfLines={1}>
              {comoSeEntraCorto}
            </Text>
          ) : null}
        </View>
        {tieneTicketera ? (
          <Boton titulo={t('plan.pillarEntrada')} ayuda={t('plan.seCompraFuera')} icono="open-outline" iconoAlFinal onPress={() => abrirEntradas(plan)} />
        ) : (
          <Boton titulo={t('plan.comoLlegar')} ayuda={t('plan.comoLlegarAyuda')} icono="navigate-outline" onPress={() => abrirComoLlegar(plan)} />
        )}
      </View>
    </View>
  );
}

// Apunta el clic para el local (contador de la v1) y abre la ticketera dentro de la app.
async function abrirEntradas(plan: Plan) {
  const url = await enlaceEntradas(plan);
  if (url) await WebBrowser.openBrowserAsync(url);
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  const s = useEstilos();
  return (
    <View style={s.bloque}>
      <Text style={s.bloqueTitulo} accessibilityRole="header">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

type PropsDato = { icono: ComponentProps<typeof Ionicons>['name']; titulo: string; texto: string; onPress?: () => void; ayuda?: string };

// Un dato del plan: icono en círculo, lo importante en negrita y el detalle debajo.
function Dato({ icono, titulo, texto: detalle, onPress, ayuda }: PropsDato) {
  const s = useEstilos();
  const { c } = useTema();
  const dentro = (
    <View style={s.dato}>
      <View style={s.datoIcono}>
        <Ionicons name={icono} size={21} color={c.texto} />
      </View>
      <View style={s.datoTextos}>
        <Text style={s.datoTitulo}>{titulo}</Text>
        <Text style={s.datoDetalle}>{detalle}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={20} color={c.textoTenue} /> : null}
    </View>
  );
  if (!onPress) return dentro;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${titulo}. ${detalle}`} accessibilityHint={ayuda} onPress={onPress}>
      {dentro}
    </Pressable>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  contenido: { alignItems: 'center' },
  columna: { width: '100%', maxWidth: ANCHO_MAXIMO },
  margen: { paddingHorizontal: espacio[4], paddingTop: espacio[4] },
  soloVolver: { paddingHorizontal: espacio[3] },
  hueco: { flex: 1 },

  cuerpo: { paddingHorizontal: espacio[4], paddingTop: espacio[5] },
  arribaTitulo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espacio[3] },
  titulo: { ...texto.titulo, fontSize: 48, lineHeight: 53, color: c.texto, marginTop: espacio[3] },
  datos: { marginTop: espacio[5], borderTopWidth: 1, borderTopColor: c.linea },
  dato: { flexDirection: 'row', alignItems: 'center', gap: espacio[4] - 2, paddingVertical: espacio[4] - 2, borderBottomWidth: 1, borderBottomColor: c.linea, minHeight: 72 },
  datoIcono: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.superficie, alignItems: 'center', justifyContent: 'center' },
  datoTextos: { flex: 1, gap: 2 },
  datoTitulo: { fontFamily: fuentes.negrita, fontSize: 17, lineHeight: 22, color: c.texto },
  datoDetalle: { ...texto.xs, fontSize: 14.5, lineHeight: 20, color: c.textoSuave },

  bloque: { paddingHorizontal: espacio[4], paddingTop: espacio[8] },
  bloqueTitulo: { ...texto.seccion, color: c.texto, marginBottom: espacio[3] },
  entradilla: { ...texto.l, color: c.texto },
  parrafo: { ...texto.m, fontSize: 16, color: c.textoSuave, marginTop: espacio[3] },

  // Bloque de marca: siempre rosa con tinta, en claro y en oscuro.
  gente: { marginHorizontal: espacio[4], marginTop: espacio[8], borderRadius: radio.m, backgroundColor: pop.rosa, padding: espacio[5], overflow: 'hidden' },
  corro: { position: 'absolute', right: -34, top: -34, width: 150, height: 150, borderRadius: 75, backgroundColor: pop.amarillo },
  genteTitulo: { ...texto.titulo, fontSize: 36, lineHeight: 40, color: pop.tinta, maxWidth: 220 },
  genteTexto: { ...texto.m, fontFamily: fuentes.media, fontSize: 16, lineHeight: 22, color: pop.tinta, marginTop: espacio[2], maxWidth: 250 },
  genteBoton: { alignSelf: 'flex-start', marginTop: espacio[4] },

  sitio: { flexDirection: 'row', alignItems: 'center', gap: espacio[3], marginTop: espacio[3] },
  sitioTextos: { flex: 1, gap: 2 },
  sitioNombre: { fontFamily: fuentes.negrita, fontSize: 17, lineHeight: 22, color: c.texto },
  sitioDireccion: { ...texto.xs, fontSize: 14.5, lineHeight: 20, color: c.textoSuave },

  masPlanes: { ...texto.seccion, color: c.texto, paddingHorizontal: espacio[4], paddingTop: espacio[10], paddingBottom: espacio[3] + 2 },
  carril: { gap: espacio[3], paddingHorizontal: espacio[4] },

  arriba: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', alignItems: 'center', gap: espacio[2], paddingHorizontal: espacio[3], paddingBottom: espacio[2] },
  arribaSolida: { backgroundColor: c.fondo, borderBottomWidth: 1, borderBottomColor: c.linea },
  arribaTituloBarra: { flex: 1, fontFamily: fuentes.negrita, fontSize: 16, lineHeight: 21, color: c.texto },

  barra: { flexDirection: 'row', alignItems: 'center', gap: espacio[3], paddingHorizontal: espacio[4], paddingTop: espacio[3], backgroundColor: c.fondo, borderTopWidth: 1, borderTopColor: c.linea },
  barraPrecio: { flex: 1, gap: 2 },
  barraImporte: { fontFamily: fuentes.negrita, fontSize: 20, lineHeight: 25, color: c.texto },
  barraNota: { ...texto.xs, color: c.textoSuave },
}));
