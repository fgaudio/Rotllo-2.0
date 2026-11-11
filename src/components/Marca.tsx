import { StyleSheet, Text, View } from 'react-native';

import { fuentes, pop } from '@/theme/tokens';
import { useTema } from '@/theme/useTema';

// Logo provisional (docs/diseno.md): "ROTLL" y un círculo en lugar de la última O.
// El círculo es el corro de gente que da nombre a la app.
export function Marca({ tamano = 27, color }: { tamano?: number; color?: string }) {
  const { modo, c } = useTema();
  return (
    <View style={estilos.fila} accessible accessibilityRole="header" accessibilityLabel="Rotllo">
      <Text allowFontScaling={false} style={[estilos.letras, { fontSize: tamano, lineHeight: tamano * 1.2, color: color ?? c.texto }]}>
        ROTLL
      </Text>
      <View
        style={{
          width: tamano * 0.62,
          height: tamano * 0.62,
          borderRadius: tamano,
          marginLeft: tamano * 0.06,
          backgroundColor: modo === 'oscuro' || color ? pop.amarillo : pop.rosa,
        }}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center' },
  letras: { fontFamily: fuentes.cartel, letterSpacing: 0.6, includeFontPadding: false },
});
