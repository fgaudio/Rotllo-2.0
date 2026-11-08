// Hooks para las pantallas: cargan los planes y dicen si está cargando o si ha fallado.
import { useCallback, useEffect, useState } from 'react';

import type { Filtro } from './filtros';
import { obtenerPlan, obtenerPlanes, PLANES_POR_PAGINA } from './planes';
import type { Plan } from './tipos';

// ── Feed: por páginas de 30 ──────────────────────────────────────────────────
// Guardamos a qué petición (filtro + intento) corresponde la respuesta. Si no coincide con la
// actual (se cambió de filtro o se pulsó "Reintentar"), es que estamos cargando.
type EstadoFeed = { clave: string; planes: Plan[]; hayMas: boolean; error: boolean };

export function usePlanes(filtro: Filtro | null = null) {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState<EstadoFeed | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const clave = `${filtro ?? 'todos'}#${intento}`;

  useEffect(() => {
    let vigente = true; // por si la pantalla se cierra antes de que llegue la respuesta
    obtenerPlanes(filtro, 0)
      .then((planes) => vigente && setEstado({ clave, planes, hayMas: planes.length === PLANES_POR_PAGINA, error: false }))
      .catch(() => vigente && setEstado({ clave, planes: [], hayMas: false, error: true }));
    return () => {
      vigente = false;
    };
  }, [filtro, clave]);

  const actual = estado !== null && estado.clave === clave;

  // Al llegar al final de la lista: la página siguiente.
  const cargarMas = useCallback(() => {
    if (!estado || estado.clave !== clave || !estado.hayMas || cargandoMas) return;
    setCargandoMas(true);
    obtenerPlanes(filtro, estado.planes.length)
      .then((mas) =>
        setEstado((previo) =>
          previo && previo.clave === clave
            ? { ...previo, planes: [...previo.planes, ...mas], hayMas: mas.length === PLANES_POR_PAGINA }
            : previo,
        ),
      )
      .catch(() => undefined) // si falla, se puede volver a intentar bajando otra vez
      .finally(() => setCargandoMas(false));
  }, [estado, clave, cargandoMas, filtro]);

  const recargar = useCallback(() => setIntento((n) => n + 1), []);

  return {
    datos: actual ? estado.planes : [],
    cargando: !actual,
    error: actual && estado.error,
    recargar,
    cargarMas,
    cargandoMas,
  };
}

// ── Un plan (ficha) ──────────────────────────────────────────────────────────
type Respuesta<T> = { cargar: () => Promise<T>; intento: number; datos?: T; error?: boolean };

function useCarga<T>(cargar: () => Promise<T>, inicial: T) {
  const [intento, setIntento] = useState(0);
  const [respuesta, setRespuesta] = useState<Respuesta<T> | null>(null);

  useEffect(() => {
    let vigente = true;
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

export function usePlan(id: string) {
  const cargar = useCallback(() => obtenerPlan(id), [id]);
  return useCarga<Plan | null>(cargar, null);
}
