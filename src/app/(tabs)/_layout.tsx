import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { View, type ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';

import { alturaPestana, borde, fuentes } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

type NombreIcono = ComponentProps<typeof Ionicons>['name'];

// Icono de pestaña (docs/diseno.md): trazo; la activa lleva un subrayado de 4 px en `indicador`.
function icono(nombre: NombreIcono, indicador: string) {
  function IconoPestana({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return (
      <View style={{ alignItems: 'center', gap: 3 }}>
        <Ionicons name={nombre} color={typeof color === 'string' ? color : undefined} size={size} />
        <View style={{ width: 28, height: 4, backgroundColor: focused ? indicador : 'transparent' }} />
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
        tabBarInactiveTintColor: c.textoSuave,
        tabBarLabelStyle: { fontFamily: fuentes.media, fontSize: 12 },
        tabBarStyle: { backgroundColor: c.fondo, borderTopColor: c.marco, borderTopWidth: borde, minHeight: alturaPestana },
        sceneStyle: { backgroundColor: c.fondo },
      }}>
      <Tabs.Screen name="index" options={{ title: t('pestanas.planes'), tabBarIcon: icono('sparkles-outline', c.indicador) }} />
      <Tabs.Screen name="mapa" options={{ title: t('pestanas.mapa'), tabBarIcon: icono('map-outline', c.indicador) }} />
      <Tabs.Screen name="guardados" options={{ title: t('pestanas.guardados'), tabBarIcon: icono('heart-outline', c.indicador) }} />
      <Tabs.Screen name="perfil" options={{ title: t('pestanas.perfil'), tabBarIcon: icono('person-outline', c.indicador) }} />
    </Tabs>
  );
}
