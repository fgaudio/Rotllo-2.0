// El tema según el modo del móvil (claro u oscuro), y un ayudante para crear estilos que
// dependen de él sin repetir código en cada componente.
import { createContext, createElement, useContext, useMemo, type ReactNode } from 'react';
import { StyleSheet, useColorScheme, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

import { temas, type Colores, type Modo } from './tokens';

// Una pantalla puede pedir un modo fijo (la de entrar es siempre oscura, por el muro de carteles).
const ModoFijo = createContext<Modo | null>(null);

export function TemaFijo({ modo, children }: { modo: Modo; children: ReactNode }) {
  return createElement(ModoFijo.Provider, { value: modo }, children);
}

export function useTema(): { modo: Modo; c: Colores } {
  const esquema = useColorScheme();
  const fijo = useContext(ModoFijo);
  const modo: Modo = fijo ?? (esquema === 'light' ? 'claro' : 'oscuro'); // sin preferencia: oscuro
  return { modo, c: temas[modo] };
}

// Cada estilo es de caja (View), de texto (Text) o de imagen (Image).
type Estilos = Record<string, ViewStyle | TextStyle | ImageStyle>;

// Uso: const useEstilos = crearEstilos((c) => ({ caja: { backgroundColor: c.fondo } }));
//      dentro del componente: const s = useEstilos();
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
