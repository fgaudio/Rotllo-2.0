import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colores } from '@/theme/tokens';

// Icono de pestaña: el color lo decide la barra (activo / inactivo).
function icono(nombre: ComponentProps<typeof Ionicons>['name']) {
  function IconoPestana({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={nombre} color={typeof color === 'string' ? color : undefined} size={size} />;
  }
  return IconoPestana;
}

// Pestañas de la v1. Entradas y Jam llegarán en la v2.
export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.taronjaFuerte, // 5,18:1 sobre blanco
        tabBarInactiveTintColor: colores.tintaSuave, // 7,63:1 sobre blanco
        tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.borde },
        sceneStyle: { backgroundColor: colores.fondo },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('pestanas.planes'),
          tabBarIcon: icono('sparkles'),
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: t('pestanas.mapa'),
          tabBarIcon: icono('map'),
        }}
      />
      <Tabs.Screen
        name="guardados"
        options={{
          title: t('pestanas.guardados'),
          tabBarIcon: icono('heart'),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t('pestanas.perfil'),
          tabBarIcon: icono('person'),
        }}
      />
    </Tabs>
  );
}
