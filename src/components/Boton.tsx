import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { alturaBoton, espacio, fuentes, pop, radio, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Variante = 'primario' | 'superficie' | 'linea' | 'claro' | 'tinta' | 'texto';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  icono?: ComponentProps<typeof Ionicons>['name'];
  iconoAlFinal?: boolean;
  compacto?: boolean; // 44 de alto en vez de 56, para botones dentro de una tarjeta
  ayuda?: string; // lo que lee el lector de pantalla después del título
};

// Botón (docs/diseno.md): píldora de 56 de alto.
//   primario: la acción principal de la pantalla (amarillo en oscuro, tinta en claro). Uno por pantalla.
//   superficie: acción secundaria.   linea: tercera opción, solo con contorno.
//   claro / tinta: colores fijos, para ir encima de una foto o de un bloque de color.
//   texto: sin fondo, para la opción menos importante ("Mirar sin cuenta").
export function Boton({ titulo, onPress, variante = 'primario', icono, iconoAlFinal, compacto, ayuda }: Props) {
  const s = useEstilos();
  const { c } = useTema();
  const color = { primario: c.sobreAcento, superficie: c.texto, linea: c.texto, claro: pop.tinta, tinta: pop.papel, texto: c.texto }[variante];
  const dibujo = icono ? <Ionicons name={icono} size={20} color={color} /> : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={ayuda}
      onPress={onPress}
      style={({ pressed }) => [s.base, compacto && s.compacto, s[variante], pressed && s.pulsado]}>
      <View style={s.contenido}>
        {iconoAlFinal ? null : dibujo}
        <Text style={[s.etiqueta, compacto && s.etiquetaCompacta, { color }]} numberOfLines={1}>
          {titulo}
        </Text>
        {iconoAlFinal ? dibujo : null}
      </View>
    </Pressable>
  );
}

const useEstilos = crearEstilos((c) => ({
  base: { minHeight: alturaBoton, borderRadius: radio.pildora, paddingHorizontal: espacio[6], justifyContent: 'center', alignItems: 'center' },
  compacto: { minHeight: zonaTactilMinima, paddingHorizontal: espacio[5] },
  primario: { backgroundColor: c.acento },
  superficie: { backgroundColor: c.superficie2 },
  linea: { borderWidth: 1.5, borderColor: c.textoTenue },
  claro: { backgroundColor: pop.papel },
  tinta: { backgroundColor: pop.tinta },
  texto: { minHeight: zonaTactilMinima },
  pulsado: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  contenido: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  etiqueta: { fontFamily: fuentes.negrita, fontSize: 17, lineHeight: 22 },
  etiquetaCompacta: { fontSize: 15, lineHeight: 20 },
}));
