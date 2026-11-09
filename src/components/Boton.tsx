import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { alturaBoton, borde, espacio, fuentes, radio } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'texto';
  icono?: ComponentProps<typeof Ionicons>['name'];
  ayuda?: string; // lo que lee el lector de pantalla después del título
};

// Botón (docs/diseno.md): 52 de alto, radio 4. Primario con los colores del botón principal
// (claro: tinta + papel; oscuro: amarillo + tinta). Secundario: sin fondo y con marco.
// Texto: sin fondo ni marco, subrayado, para la opción menos importante de la pantalla.
export function Boton({ titulo, onPress, variante = 'primario', icono, ayuda }: Props) {
  const s = useEstilos();
  const { c } = useTema();
  const primario = variante === 'primario';
  const colorTexto = primario ? c.sobrePrincipal : c.texto;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={ayuda}
      onPress={onPress}
      style={({ pressed }) => [s.base, s[variante], pressed && s.pulsado]}>
      <View style={s.contenido}>
        {icono ? <Ionicons name={icono} size={20} color={colorTexto} /> : null}
        <Text style={[s.etiqueta, { color: colorTexto }, variante === 'texto' && s.subrayado]}>{titulo}</Text>
      </View>
    </Pressable>
  );
}

const useEstilos = crearEstilos((c) => ({
  base: {
    minHeight: alturaBoton,
    borderRadius: radio.m,
    paddingHorizontal: espacio[6],
    justifyContent: 'center',
    alignItems: 'center',
  },
  primario: { backgroundColor: c.principal, borderWidth: borde, borderColor: c.principal },
  secundario: { backgroundColor: 'transparent', borderWidth: borde, borderColor: c.marco },
  texto: { backgroundColor: 'transparent' },
  pulsado: { opacity: 0.85 },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  etiqueta: { fontFamily: fuentes.media, fontSize: 17, lineHeight: 22 },
  subrayado: { textDecorationLine: 'underline' },
}));
