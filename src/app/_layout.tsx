import '@/i18n';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { colores } from '@/theme/tokens';

// Raíz de la app: pestañas + ficha del plan (rotllo.app/p/<id>).
export default function RootLayout() {
  const { t } = useTranslation();
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colores.fondo },
          headerTintColor: colores.taronjaFuerte,
          headerStyle: { backgroundColor: colores.superficie },
          headerTitleStyle: { color: colores.tinta },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="p/[id]" options={{ title: '', headerBackTitle: t('pestanas.planes') }} />
      </Stack>
    </>
  );
}
