import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { IlustracionPlan } from './IlustracionPlan';

type Props = {
  uri: string | null;
  categoria: string;
  descripcion: string; // texto alternativo
  proporcion?: number; // ancho / alto
};

// Foto del plan con expo-image (caché en el móvil, ADR-005). Sin foto: la ilustración de
// serigrafía de su categoría. El duotono de las fotos reales llegará al procesarlas al
// subirlas (docs/diseno.md, "Pendiente").
export function FotoPlan({ uri, categoria, descripcion, proporcion = 1 }: Props) {
  return (
    <View style={[estilos.caja, { aspectRatio: proporcion }]}>
      {uri ? (
        <Image source={{ uri }} style={estilos.foto} contentFit="cover" transition={200} accessibilityLabel={descripcion} />
      ) : (
        <IlustracionPlan categoria={categoria} descripcion={descripcion} proporcion={proporcion} />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { width: '100%', overflow: 'hidden' },
  foto: { width: '100%', height: '100%' },
});
