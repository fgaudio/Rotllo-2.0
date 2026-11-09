import { Text, View } from 'react-native';

import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { Boton } from './Boton';

type Props = {
  titulo: string;
  texto: string;
  boton?: { titulo: string; onPress: () => void };
};

// Estado vacío: dice qué pasa y propone qué hacer ahora.
export function EstadoVacio({ titulo, texto: mensaje, boton }: Props) {
  const s = useEstilos();
  return (
    <View style={s.contenedor}>
      <Text style={s.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={s.texto}>{mensaje}</Text>
      {boton ? <Boton titulo={boton.titulo} onPress={boton.onPress} /> : null}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  contenedor: { alignItems: 'stretch', gap: espacio[3], paddingVertical: espacio[8], paddingHorizontal: espacio[4] },
  titulo: { ...texto.l, color: c.texto, textAlign: 'center' },
  texto: { ...texto.m, color: c.textoSuave, textAlign: 'center' },
}));
