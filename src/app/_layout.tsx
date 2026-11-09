import '@/i18n';

import { ArchivoBlack_400Regular } from '@expo-google-fonts/archivo-black';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { BotonIcono } from '@/components/BotonIcono';

import { fuentes } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

// La pantalla de inicio se queda puesta hasta que cargan las fuentes (Archivo Black + Inter).
SplashScreen.preventAutoHideAsync();

// Raíz de la app: pestañas, ficha del plan (rotllo.app/p/<id>), bienvenida y entrar.
// Sigue el modo del móvil.
export default function RootLayout() {
  const { t } = useTranslation();
  const { modo, c } = useTema();
  const [fuentesListas, errorFuentes] = useFonts({ ArchivoBlack_400Regular, Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    if (fuentesListas || errorFuentes) SplashScreen.hideAsync();
  }, [fuentesListas, errorFuentes]);

  if (!fuentesListas && !errorFuentes) return null;

  return (
    <>
      <StatusBar style={modo === 'oscuro' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: c.fondo },
          headerTintColor: c.texto,
          headerStyle: { backgroundColor: c.fondo },
          headerShadowVisible: false,
          headerTitleStyle: { color: c.texto, fontFamily: fuentes.titulo },
          // En la web, la flecha de volver de serie mide 30 px y dice "Go back": la cambiamos por la nuestra.
          headerLeft:
            Platform.OS === 'web'
              ? ({ canGoBack }) =>
                  canGoBack ? <BotonIcono icono="arrow-back" etiqueta={t('comun.volver')} onPress={() => router.back()} /> : null
              : undefined,
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="p/[id]" options={{ title: '', headerBackTitle: t('pestanas.planes') }} />
        <Stack.Screen name="bienvenida" options={{ headerShown: false }} />
        <Stack.Screen name="entrar/index" options={{ title: '' }} />
        <Stack.Screen name="entrar/email" options={{ title: '' }} />
        <Stack.Screen name="entrar/edad" options={{ title: '' }} />
      </Stack>
    </>
  );
}
