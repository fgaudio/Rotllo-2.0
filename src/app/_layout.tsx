import '@/i18n';

import { Anton_400Regular } from '@expo-google-fonts/anton';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { BotonRedondo } from '@/components/BotonRedondo';
import { useTema } from '@/theme/useTema';

// La pantalla de inicio se queda puesta hasta que cargan las fuentes (Anton + Inter).
SplashScreen.preventAutoHideAsync();

// Raíz de la app: pestañas, ficha del plan (rotllo.app/p/<id>), búsqueda y entrar.
// Se abre directamente en los planes, sin bienvenida ni registro. Sigue el modo del móvil.
export default function RootLayout() {
  const { t } = useTranslation();
  const { modo, c } = useTema();
  const [fuentesListas, errorFuentes] = useFonts({ Anton_400Regular, Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

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
          headerStyle: { backgroundColor: c.fondo },
          headerShadowVisible: false,
          headerTitle: '',
          // La misma flecha redonda en iPhone, Android y web (44 px y con nombre para el lector de pantalla).
          headerLeft: ({ canGoBack }) =>
            canGoBack ? <BotonRedondo icono="chevron-back" etiqueta={t('comun.volver')} onPress={() => router.back()} /> : null,
          headerBackVisible: false,
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="p/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="buscar" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="entrar/index" options={{ headerShown: false }} />
        <Stack.Screen name="entrar/email" />
        <Stack.Screen name="entrar/edad" />
      </Stack>
    </>
  );
}
