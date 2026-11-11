import { Text, View } from 'react-native';

import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Rótulo con un punto encendido: "EMPIEZA EN 2 H", "YA HA EMPEZADO".
export function RotuloVivo({ texto: mensaje }: { texto: string }) {
  const s = useEstilos();
  return (
    <View style={s.fila}>
      <View style={s.halo}>
        <View style={s.punto} />
      </View>
      <Text style={s.texto}>{mensaje}</Text>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio[1] + 2 },
  halo: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: c.vivo + '47' },
  punto: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.vivo },
  texto: { ...texto.rotulo, color: c.rotulo },
}));
