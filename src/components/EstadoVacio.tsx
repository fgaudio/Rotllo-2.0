import { StyleSheet, Text, View } from 'react-native';

import { colores, espacio, texto } from '@/theme/tokens';

import { Boton } from './Boton';

type Props = {
  titulo: string;
  texto: string;
  boton?: { titulo: string; onPress: () => void };
};

// Estado vacío: dice qué pasa y propone qué hacer ahora.
export function EstadoVacio({ titulo, texto: mensaje, boton }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={styles.texto}>{mensaje}</Text>
      {boton ? <Boton titulo={boton.titulo} onPress={boton.onPress} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: 'stretch',
    gap: espacio[3],
    paddingVertical: espacio[8],
    paddingHorizontal: espacio[4],
  },
  titulo: { ...texto.l, fontWeight: '700', color: colores.tinta, textAlign: 'center' },
  texto: { ...texto.m, color: colores.tintaSuave, textAlign: 'center' },
});
