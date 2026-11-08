// Hooks para las pantallas: cargan los planes y dicen si está cargando o si ha fallado.
import { useCallback, useEffect, useState } from 'react';

import { obtenerPlan, obtenerPlanes } from './planes';
import type { Plan } from './tipos';

type Estado<T> = { datos: T; cargando: boolean; error: boolean; recargar: () => void };

// Guardamos qué petición produjo cada respuesta. Si la respuesta no es de la petición
// actual (cambió el plan o se pulsó "Reintentar"), es que estamos cargando.
type Respuesta<T> = { cargar: () => Promise<T>; intento: number; datos?: T; error?: boolean };

function useCarga<T>(cargar: () => Promise<T>, inicial: T): Estado<T> {
  const [intento, setIntento] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta<T> | null>(null);

  useEffect(() => {
    let vigente = true; // por si la pantalla se cierra antes de que llegue la respuesta
    cargar()
      .then((datos) => vigente && setRespuesta({ cargar, intento, datos }))
      .catch(() => vigente && setRespuesta({ cargar, intento, error: true }));
    return () => {
      vigente = false;
    };
  }, [cargar, intento]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);
  const actual = respuesta?.cargar === cargar && respuesta.intento === intento;
  return {
    datos: respuesta?.datos ?? inicial,
    cargando: !actual,
    error: actual && Boolean(respuesta?.error),
    recargar,
  };
}

const planesVacio: Plan[] = [];

export function usePlanes() {
  return useCarga<Plan[]>(obtenerPlanes, planesVacio);
}

export function usePlan(id: string) {
  const cargar = useCallback(() => obtenerPlan(id), [id]);
  return useCarga<Plan | null>(cargar, null);
}
