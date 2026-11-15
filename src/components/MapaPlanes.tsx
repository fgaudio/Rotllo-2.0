import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { Plan } from '@/lib/tipos';
import { alternarCerca, puntoDe, type Ubicacion } from '@/lib/ubicacion';
import { espacio, pop } from '@/theme/tokens';

import { AvisoUbicacion } from './AvisoUbicacion';
import { BotonRedondo } from './BotonRedondo';

// Mapa de planes (ADR-004): Apple Maps en iPhone, Google Maps en Android.
// En la web se usa MapaPlanes.web.tsx (una lista), porque react-native-maps no va en navegador.
//
// El botón de abajo a la derecha pone «Cerca de mí»: pide la ubicación (solo entonces), enseña
// el punto azul de dónde está la persona y acerca el mapa a esa zona.

const CENTRO_VALENCIA = {
  latitude: 39.4699,
  longitude: -0.3763,
  latitudeDelta: 0.09,
  longitudeDelta: 0.09,
};
const ZOOM_CERCA = 0.03; // unos 3 km de alto: el barrio y los de al lado

export function MapaPlanes({ planes, ubicacion }: { planes: Plan[]; ubicacion: Ubicacion }) {
  const { t } = useTranslation();
  const mapa = useRef<MapView>(null);
  const cerca = puntoDe(ubicacion);
  const lat = cerca?.lat ?? null;
  const lng = cerca?.lng ?? null;

  // Al saber dónde está la persona, el mapa se mueve hasta allí.
  useEffect(() => {
    if (lat === null || lng === null) return;
    mapa.current?.animateToRegion({ latitude: lat, longitude: lng, latitudeDelta: ZOOM_CERCA, longitudeDelta: ZOOM_CERCA }, 600);
  }, [lat, lng]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapView ref={mapa} style={StyleSheet.absoluteFill} initialRegion={CENTRO_VALENCIA} showsUserLocation={cerca !== null} showsMyLocationButton={false}>
        {planes.map((plan) => (
          <Marker
            key={plan.id}
            coordinate={{ latitude: plan.lat, longitude: plan.lng }}
            title={plan.titulo}
            description={`${plan.local} · ${plan.barrio}`}
            pinColor={pop.rosa}
            onCalloutPress={() => router.push({ pathname: '/p/[id]', params: { id: plan.id } })}
          />
        ))}
      </MapView>
      {ubicacion.estado === 'denegada' || ubicacion.estado === 'fallo' ? (
        <View style={estilos.aviso}>
          <AvisoUbicacion ubicacion={ubicacion} />
        </View>
      ) : null}
      <View style={estilos.boton}>
        <BotonRedondo icono={cerca ? 'navigate' : 'navigate-outline'} etiqueta={t(cerca ? 'feed.filtro.cerca' : 'cerca.centrar')} onPress={alternarCerca} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  aviso: { position: 'absolute', top: espacio[2], left: 0, right: 0 },
  boton: { position: 'absolute', right: espacio[4], bottom: espacio[6] },
});
