import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { pop, radio } from '@/theme/tokens';

// Mapa pequeño y quieto de la ficha: solo enseña dónde cae el sitio. Para la ruta está "Cómo llegar".
// En la web se usa MapaMini.web.tsx (no dibuja nada), porque react-native-maps no va en navegador.
export function MapaMini({ lat, lng, etiqueta }: { lat: number; lng: number; etiqueta: string }) {
  return (
    <View style={estilos.caja} accessible accessibilityRole="image" accessibilityLabel={etiqueta} pointerEvents="none">
      <MapView
        style={StyleSheet.absoluteFill}
        liteMode
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.008, longitudeDelta: 0.008 }}>
        <Marker coordinate={{ latitude: lat, longitude: lng }} pinColor={pop.rosa} />
      </MapView>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { height: 150, borderRadius: radio.m, overflow: 'hidden' },
});
