import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { View, type ColorValue } from 'react-native';

import { alturaPestana, fuentes } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

// Icono de pestaña (docs/diseno.md): de trazo; la activa va rellena y con una marca arriba.
function icono(activo: NombreIcono, inactivo: NombreIcono, marca: string) {
  function IconoPestana({ color, focused }: { color: ColorValue; focused: boolean }) {
    return (
      <View style={{ alignItems: 'center', gap: 5 }}>
        <View style={{ width: 22, height: 3, borderRadius: 2, backgroundColor: focused ? marca : 'transparent' }} />
        <Ionicons name={focused ? activo : inactivo} color={typeof color === 'string' ? color : undefined} size={23} />
      </View>
    );
  }
  return IconoPestana;
}

// Pestañas de la v1. Entradas y Jam llegarán en la v2.
export default function TabsLayout() {
  const { t } = useTranslation();
  const { c } = useTema();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.texto,
        tabBarInactiveTintColor: c.textoTenue,
        tabBarLabelStyle: { fontFamily: fuentes.media, fontSize: 11, marginTop: 2 },
        tabBarStyle: { backgroundColor: c.fondo, borderTopColor: c.linea, borderTopWidth: 1, minHeight: alturaPestana },
        tabBarItemStyle: { paddingTop: 0 },
        sceneStyle: { backgroundColor: c.fondo },
      }}>
      <Tabs.Screen name="index" options={{ title: t('pestanas.planes'), tabBarIcon: icono('sparkles', 'sparkles-outline', c.rotulo) }} />
      <Tabs.Screen name="mapa" options={{ title: t('pestanas.mapa'), tabBarIcon: icono('map', 'map-outline', c.rotulo) }} />
      <Tabs.Screen name="guardados" options={{ title: t('pestanas.guardados'), tabBarIcon: icono('heart', 'heart-outline', c.rotulo) }} />
      <Tabs.Screen name="perfil" options={{ title: t('pestanas.perfil'), tabBarIcon: icono('person', 'person-outline', c.rotulo) }} />
    </Tabs>
  );
}
