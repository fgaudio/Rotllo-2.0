import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvisoPrueba } from '@/components/AvisoPrueba';
import { Boton } from '@/components/Boton';
import { Logo } from '@/components/Logo';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Entrar: Apple (solo en iPhone), Google o email. El inicio de sesión de verdad llega con el
// módulo 1 (Supabase Auth); de momento Apple y Google pasan directo a la fecha de nacimiento,
// que es lo que verá quien entre por primera vez.
export default function EntrarScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.cuerpo}>
        <AvisoPrueba texto={t('entrar.prueba')} />
        <View style={s.cabecera}>
          <Logo tamano={44} />
          <Text style={s.titulo} accessibilityRole="header">
            {t('entrar.titulo')}
          </Text>
          <Text style={s.texto}>{t('entrar.texto')}</Text>
        </View>
        <View style={s.opciones}>
          {Platform.OS === 'android' ? null : (
            <Boton titulo={t('entrar.apple')} icono="logo-apple" variante="secundario" onPress={() => router.push('/entrar/edad')} />
          )}
          <Boton titulo={t('entrar.google')} icono="logo-google" variante="secundario" onPress={() => router.push('/entrar/edad')} />
          <Boton titulo={t('entrar.email')} icono="mail-outline" variante="secundario" onPress={() => router.push('/entrar/email')} />
        </View>
        <Text style={s.nota}>{t('entrar.mayores')}</Text>
      </ScrollView>
      <View style={s.abajo}>
        <Boton titulo={t('entrar.sinCuenta')} variante="texto" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  cuerpo: { padding: espacio[4], gap: espacio[8] },
  cabecera: { gap: espacio[3] },
  titulo: { ...texto.xl, color: c.texto },
  texto: { ...texto.m, color: c.textoSuave },
  opciones: { gap: espacio[3] },
  nota: { ...texto.s, color: c.textoSuave, textAlign: 'center' },
  abajo: { paddingHorizontal: espacio[4], paddingBottom: espacio[2] },
}));
