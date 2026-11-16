// Ayudas para que el lector de pantalla diga lo mismo en el móvil y en el navegador.
//
// En el móvil, React Native lee `accessibilityState`. En el navegador (react-native-web) eso no
// llega a la página: hay que poner los atributos `aria-*` que entienden los lectores de pantalla.
import { Platform } from 'react-native';

// Un botón que se pone y se quita (un chip de filtro, «Cerca de mí»…): «seleccionado» en el
// móvil y «pulsado» (aria-pressed) en el navegador, que es lo correcto para un botón.
export function estadoPulsado(activo: boolean, plataforma: string = Platform.OS) {
  return plataforma === 'web' ? { 'aria-pressed': activo } : { accessibilityState: { selected: activo } };
}
