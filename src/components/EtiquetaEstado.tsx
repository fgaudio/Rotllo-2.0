import { Text, View } from 'react-native';

import { espacio, fuentes, radio } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

type Tono = 'bien' | 'espera' | 'mal';

// Etiqueta de estado (docs/diseno.md): un punto de color y el estado escrito, para no depender
// solo del color. "En revisión", "Verificado", "No aprobado"...
export function EtiquetaEstado({ texto, tono }: { texto: string; tono: Tono }) {
  const s = useEstilos();
  return (
    <View style={s.caja}>
      <View style={[s.punto, s[tono]]} />
      <Text style={s.texto}>{texto}</Text>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  caja: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: espacio[2], height: 28, paddingHorizontal: espacio[3], borderRadius: radio.pildora, backgroundColor: c.superficie2 },
  punto: { width: 8, height: 8, borderRadius: 4 },
  bien: { backgroundColor: c.gratis },
  espera: { backgroundColor: c.rotulo },
  mal: { backgroundColor: c.error },
  texto: { fontFamily: fuentes.negrita, fontSize: 13, lineHeight: 17, color: c.texto },
}));
