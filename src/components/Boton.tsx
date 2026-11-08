import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { alturaBoton, colores, espacio, radio, texto } from '@/theme/tokens';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  icono?: ComponentProps<typeof Ionicons>['name'];
  ayuda?: string; // lo que lee el lector de pantalla después del título
};

// Botón en forma de píldora (guía: primario taronja fuerte + blanco, 5,18:1;
// secundario con borde tinta). Siempre 52 px de alto: más que los 44 mínimos.
export function Boton({ titulo, onPress, variante = 'primario', icono, ayuda }: Props) {
  const primario = variante === 'primario';
  const colorTexto = primario ? colores.blanco : colores.tinta;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={ayuda}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primario ? styles.primario : styles.secundario,
        pressed && styles.pulsado,
      ]}>
      <View style={styles.contenido}>
        {icono ? <Ionicons name={icono} size={20} color={colorTexto} /> : null}
        <Text style={[styles.texto, { color: colorTexto }]}>{titulo}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: alturaBoton,
    borderRadius: radio.pill,
    paddingHorizontal: espacio[6],
    justifyContent: 'center',
    alignItems: 'center',
  },
  primario: { backgroundColor: colores.taronjaFuerte },
  secundario: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colores.tinta,
  },
  pulsado: { opacity: 0.85 },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  texto: { ...texto.m, fontWeight: '600' },
});
