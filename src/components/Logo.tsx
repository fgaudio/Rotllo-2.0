import { StyleSheet, Text } from 'react-native';

import { useTema } from '@/theme/useTema';
import { coloresLogo, fuentes } from '@/theme/tokens';

// "ROTLLO": cada letra de un color de la serie, con un borde de tinta desplazado 2 px.
export function Logo({ tamano = 30 }: { tamano?: number }) {
  const { c } = useTema();
  return (
    <Text accessibilityRole="header" accessibilityLabel="Rotllo" style={[estilos.logo, { fontSize: tamano, lineHeight: tamano * 1.1 }]}>
      {'ROTLLO'.split('').map((letra, i) => (
        <Text
          key={i}
          style={{
            color: coloresLogo[i % coloresLogo.length],
            textShadowColor: c.marco,
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 0.1,
          }}>
          {letra}
        </Text>
      ))}
    </Text>
  );
}

const estilos = StyleSheet.create({
  logo: { fontFamily: fuentes.titulo, letterSpacing: -0.5 },
});
