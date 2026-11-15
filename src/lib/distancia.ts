// Distancias entre dos puntos del mapa, para «Cerca de mí». Todo son cuentas: aquí no se pide
// ningún permiso ni se lee la posición del móvil (eso está en ubicacion.ts).

export type Punto = { lat: number; lng: number };

const RADIO_TIERRA_M = 6371008.8; // radio medio de la Tierra, en metros

const enRadianes = (grados: number) => (grados * Math.PI) / 180;

export function esPuntoValido(punto: Punto | null | undefined): punto is Punto {
  return Boolean(punto) && Number.isFinite(punto!.lat) && Number.isFinite(punto!.lng) && Math.abs(punto!.lat) <= 90 && Math.abs(punto!.lng) <= 180;
}

// Metros en línea recta entre dos puntos (fórmula del semiverseno: tiene en cuenta que la
// Tierra es redonda). Andando siempre es algo más, porque hay que seguir las calles.
export function distanciaEnMetros(a: Punto, b: Punto): number {
  const dLat = enRadianes(b.lat - a.lat);
  const dLng = enRadianes(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(enRadianes(a.lat)) * Math.cos(enRadianes(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

// La posición con 3 decimales: unos 100 m de precisión. De sobra para ordenar planes, y así a
// la base de datos nunca le llega el punto exacto donde está la persona.
export function redondearPunto(punto: Punto): Punto {
  return { lat: Math.round(punto.lat * 1000) / 1000, lng: Math.round(punto.lng * 1000) / 1000 };
}

export type Distancia = { unidad: 'm' | 'km'; valor: number };

// La distancia como se dice en la calle: "150 m", "600 m", "1,2 km", "12 km".
//   · menos de 1 km: en metros, de 50 en 50 (y nunca menos de 50)
//   · de 1 a 10 km: en kilómetros con un decimal
//   · más de 10 km: en kilómetros sin decimales
export function distanciaRedonda(metros: number): Distancia {
  if (metros < 975) return { unidad: 'm', valor: Math.max(50, Math.round(metros / 50) * 50) };
  const km = metros / 1000;
  return { unidad: 'km', valor: km < 9.95 ? Math.round(km * 10) / 10 : Math.round(km) };
}
