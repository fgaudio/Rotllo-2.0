import { Text, View } from 'react-native';

import { espacio, pop, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { Boton } from './Boton';

type Props = {
  titulo: string;
  texto: string;
  boton?: { titulo: string; onPress: () => void };
};

// Estado vacío (docs/diseno.md): un círculo de marca, qué pasa y qué hacer ahora.
export function EstadoVacio({ titulo, texto: mensaje, boton }: Props) {
  const s = useEstilos();
  return (
    <View style={s.contenedor}>
      <View style={s.corro}>
        <View style={s.punto} />
      </View>
      <Text style={s.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={s.texto}>{mensaje}</Text>
      {boton ? (
        <View style={s.boton}>
          <Boton titulo={boton.titulo} onPress={boton.onPress} variante="superficie" />
        </View>
      ) : null}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  contenedor: { alignItems: 'center', gap: espacio[2], paddingVertical: espacio[10], paddingHorizontal: espacio[6] },
  corro: { width: 56, height: 56, borderRadius: 28, backgroundColor: c.superficie, alignItems: 'center', justifyContent: 'center', marginBottom: espacio[2] },
  punto: { width: 20, height: 20, borderRadius: 10, backgroundColor: pop.rosa },
  titulo: { ...texto.seccion, color: c.texto, textAlign: 'center' },
  texto: { ...texto.m, color: c.textoSuave, textAlign: 'center' },
  boton: { marginTop: espacio[3], alignSelf: 'stretch' },
}));
