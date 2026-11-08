import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { Plan } from '@/lib/tipos';
import { colores } from '@/theme/tokens';

// Mapa de planes (ADR-004): Apple Maps en iPhone, Google Maps en Android.
// En la web se usa MapaPlanes.web.tsx (una lista), porque react-native-maps no va en navegador.

const CENTRO_VALENCIA = {
  latitude: 39.4699,
  longitude: -0.3763,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};

export function MapaPlanes({ planes }: { planes: Plan[] }) {
  return (
    <MapView style={StyleSheet.absoluteFill} initialRegion={CENTRO_VALENCIA}>
      {planes.map((plan) => (
        <Marker
          key={plan.id}
          coordinate={{ latitude: plan.lat, longitude: plan.lng }}
          title={plan.titulo}
          description={`${plan.local} · ${plan.barrio}`}
          pinColor={colores.taronjaFuerte}
          onCalloutPress={() => router.push({ pathname: '/p/[id]', params: { id: plan.id } })}
        />
      ))}
    </MapView>
  );
}
