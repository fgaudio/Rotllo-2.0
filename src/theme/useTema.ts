// El tema según el modo del móvil (claro u oscuro), y un ayudante para crear estilos que
// dependen de él sin repetir código en cada componente.
import { useMemo } from 'react';
import { StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { temas, type Colores, type Modo } from './tokens';

export function useTema(): { modo: Modo; c: Colores } {
  const esquema = useColorScheme();
  const modo: Modo = esquema === 'dark' ? 'oscuro' : 'claro';
  return { modo, c: temas[modo] };
}

// Uso: const useEstilos = crearEstilos((c) => ({ caja: { backgroundColor: c.fondo } }));
//      dentro del componente: const s = useEstilos();
// Cada estilo es de caja (View), de texto (Text) o de imagen (Image).
type Estilos = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function crearEstilos<T extends Estilos>(fabrica: (c: Colores) => T) {
  const cache: Partial<Record<Modo, T>> = {};
  return function useEstilos(): T {
    const { modo, c } = useTema();
    return useMemo(() => {
      cache[modo] ??= StyleSheet.create(fabrica(c));
      return cache[modo] as T;
    }, [modo, c]);
  };
}
