import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { AvisoPrueba } from '@/components/AvisoPrueba';
import { Boton } from '@/components/Boton';
import { BotonRedondo } from '@/components/BotonRedondo';
import { Cartel } from '@/components/Cartel';
import { Marca } from '@/components/Marca';
import { ESTILOS_CARTEL } from '@/lib/cartel';
import { coloresCartel, espacio, pop, temas, texto, type NombreColorCartel } from '@/theme/tokens';
import { TemaFijo } from '@/theme/useTema';

const c = temas.oscuro; // esta pantalla es siempre oscura: el color lo pone el muro de carteles
const COLORES = Object.keys(coloresCartel) as NombreColorCartel[];
const ANCHO_CARTEL = 172;
const ALTO_CARTEL = 228;

function salir() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Entrar (docs/diseno.md): un muro de carteles y, debajo, Apple (solo en iPhone), Google o email.
// No es obligatorio: la app se abre en los planes y aquí se llega desde Perfil.
// El inicio de sesión de verdad llega con el módulo 1 (Supabase Auth); de momento Apple y Google
// pasan directo a la fecha de nacimiento, que es lo que verá quien entre por primera vez.
export default function EntrarScreen() {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const palabras = t('entrar.muro').split('·');
  const columnas = [0, 1, 2].map((col) => palabras.filter((_, i) => i % 3 === col));
  const bajo = height < 700; // en móviles pequeños, el lema va más pequeño y sin la frase de apoyo

  return (
    <TemaFijo modo="oscuro">
      <View style={estilos.pantalla}>
        {/* Decoración: no se lee con el lector de pantalla. */}
        <View style={estilos.muro} importantForAccessibility="no-hide-descendants" aria-hidden pointerEvents="none">
          {columnas.map((columna, col) => (
            <View key={col} style={[estilos.columna, { marginTop: [0, -70, -25][col] }]}>
              {columna.map((palabra, i) => (
                <Cartel
                  key={palabra}
                  plan={{
                    id: palabra,
                    titulo: palabra,
                    categoria: '',
                    fotoUrl: null,
                    cartel: { estilo: ESTILOS_CARTEL[(col + i) % 3], color: COLORES[(col * 3 + i * 2) % COLORES.length] },
                  }}
                  descripcion=""
                  ancho={ANCHO_CARTEL}
                  alto={ALTO_CARTEL}
                />
              ))}
            </View>
          ))}
        </View>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <LinearGradient id="velo" x1={0} y1={0} x2={0} y2={1}>
              <Stop offset={0.14} stopColor={c.fondo} stopOpacity={0} />
              <Stop offset={0.38} stopColor={c.fondo} stopOpacity={0.93} />
              <Stop offset={0.46} stopColor={c.fondo} stopOpacity={1} />
            </LinearGradient>
          </Defs>
          <Rect width={width} height={height} fill="url(#velo)" />
        </Svg>

        <SafeAreaView style={estilos.encima}>
          <View style={estilos.arriba}>
            <BotonRedondo icono="close" etiqueta={t('comun.volver')} variante="cristal" onPress={salir} />
          </View>
          <View style={estilos.abajo}>
            <Marca tamano={24} color={pop.papel} />
            <Text style={[estilos.lema, bajo && estilos.lemaBajo]} accessibilityRole="header">
              {t('entrar.lema')} <Text style={estilos.lemaFin}>{t('entrar.lemaFin')}</Text>
            </Text>
            {bajo ? null : <Text style={estilos.texto}>{t('entrar.texto')}</Text>}
            <View style={estilos.botones}>
              <AvisoPrueba texto={t('entrar.prueba')} />
              {Platform.OS === 'android' ? null : (
                <Boton titulo={t('entrar.apple')} icono="logo-apple" variante="claro" onPress={() => router.push('/entrar/edad')} />
              )}
              <Boton
                titulo={t('entrar.google')}
                icono="logo-google"
                variante={Platform.OS === 'android' ? 'claro' : 'superficie'}
                onPress={() => router.push('/entrar/edad')}
              />
              <Boton titulo={t('entrar.email')} icono="mail-outline" variante="linea" onPress={() => router.push('/entrar/email')} />
            </View>
            <Boton titulo={t('entrar.sinCuenta')} variante="texto" onPress={salir} />
            <Text style={estilos.legal}>{t('entrar.mayores')}</Text>
          </View>
        </SafeAreaView>
      </View>
    </TemaFijo>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: c.fondo, overflow: 'hidden' },
  muro: { position: 'absolute', left: -70, top: -60, flexDirection: 'row', gap: espacio[3], transform: [{ rotate: '-8deg' }] },
  columna: { gap: espacio[3] },
  encima: { flex: 1, justifyContent: 'space-between' },
  arriba: { paddingHorizontal: espacio[3], paddingTop: espacio[1] },
  abajo: { paddingHorizontal: espacio[5], paddingBottom: espacio[2], width: '100%', maxWidth: 480, alignSelf: 'center' },
  lema: { ...texto.titular, fontSize: 60, lineHeight: 64, color: c.texto, marginTop: espacio[2] },
  lemaBajo: { fontSize: 42, lineHeight: 46 },
  lemaFin: { color: pop.amarillo },
  texto: { ...texto.m, color: c.textoSuave, marginTop: espacio[2] },
  botones: { gap: espacio[2] + 2, marginTop: espacio[5], marginBottom: espacio[1] },
  legal: { ...texto.xs, color: c.textoTenue, textAlign: 'center' },
});
