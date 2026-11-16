import { expect, test } from '@jest/globals';

import { estadoPulsado } from './accesibilidad';

test('un botón que se pone y se quita: «seleccionado» en el móvil y «pulsado» en el navegador', () => {
  expect(estadoPulsado(true, 'ios')).toEqual({ accessibilityState: { selected: true } });
  expect(estadoPulsado(false, 'android')).toEqual({ accessibilityState: { selected: false } });
  expect(estadoPulsado(true, 'web')).toEqual({ 'aria-pressed': true });
  expect(estadoPulsado(false, 'web')).toEqual({ 'aria-pressed': false });
});
