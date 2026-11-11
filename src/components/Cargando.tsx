import { View } from 'react-native';

import { espacio, radio } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Mientras cargan los planes: la silueta de lo que va a salir (una tarjeta grande y dos filas),
// en vez de una rueda girando. Así la pantalla no da un salto cuando llegan.
export function Cargando({ etiqueta, soloFilas }: { etiqueta: string; soloFilas?: boolean }) {
  const s = useEstilos();
  return (
    <View style={s.contenedor} accessible accessibilityLabel={etiqueta} accessibilityRole="progressbar">
      {soloFilas ? null : <View style={s.grande} />}
      {[0, 1, 2].map((i) => (
        <View key={i} style={s.fila}>
          <View style={s.cuadro} />
          <View style={s.lineas}>
            <View style={[s.linea, { width: '70%' }]} />
            <View style={[s.linea, { width: '45%' }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  contenedor: { gap: espacio[5] },
  grande: { height: 360, borderRadius: radio.l, backgroundColor: c.superficie },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio[4] },
  cuadro: { width: 84, height: 84, borderRadius: radio.s, backgroundColor: c.superficie },
  lineas: { flex: 1, gap: espacio[2] },
  linea: { height: 14, borderRadius: 7, backgroundColor: c.superficie },
}));
