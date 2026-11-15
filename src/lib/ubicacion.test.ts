import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { activarCerca, alternarCerca, apagarCerca, leerUbicacion as estadoActual, puntoDe, refrescarUbicacion } from './ubicacion';

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const permiso = Location.requestForegroundPermissionsAsync as unknown as jest.MockedFunction<() => Promise<{ granted: boolean }>>;
const ultima = Location.getLastKnownPositionAsync as unknown as jest.MockedFunction<() => Promise<unknown>>;
const posicion = Location.getCurrentPositionAsync as unknown as jest.MockedFunction<() => Promise<unknown>>;
const en = (latitude: number, longitude: number) => ({ coords: { latitude, longitude } });

beforeEach(() => {
  apagarCerca();
  jest.clearAllMocks();
  permiso.mockResolvedValue({ granted: true });
  ultima.mockResolvedValue(null);
  posicion.mockResolvedValue(en(39.469912, -0.376288));
  Platform.OS = 'ios';
});

describe('«Cerca de mí»: la posición del móvil', () => {
  test('con permiso, queda lista y redondeada a unos 100 m', async () => {
    await activarCerca();
    expect(estadoActual()).toEqual({ estado: 'lista', punto: { lat: 39.47, lng: -0.376 } });
    expect(puntoDe(estadoActual())).toEqual({ lat: 39.47, lng: -0.376 });
  });

  test('si el móvil tiene una posición reciente, se usa sin esperar al GPS', async () => {
    ultima.mockResolvedValue(en(39.4781, -0.3249));
    await activarCerca();
    expect(estadoActual()).toEqual({ estado: 'lista', punto: { lat: 39.478, lng: -0.325 } });
    expect(posicion).not.toHaveBeenCalled();
  });

  test('sin permiso, queda denegada y no se lee la posición', async () => {
    permiso.mockResolvedValue({ granted: false });
    await activarCerca();
    expect(estadoActual()).toEqual({ estado: 'denegada' });
    expect(posicion).not.toHaveBeenCalled();
    expect(puntoDe(estadoActual())).toBeNull();
  });

  test('con permiso pero sin señal, queda en fallo', async () => {
    posicion.mockRejectedValue(new Error('sin señal'));
    await activarCerca();
    expect(estadoActual()).toEqual({ estado: 'fallo' });
  });

  test('en el navegador no se pide permiso aparte: lo pide el propio navegador', async () => {
    Platform.OS = 'web';
    await activarCerca();
    expect(permiso).not.toHaveBeenCalled();
    expect(estadoActual()).toEqual({ estado: 'lista', punto: { lat: 39.47, lng: -0.376 } });
    posicion.mockRejectedValue({ code: 1 }); // el navegador dice: permiso denegado
    await activarCerca();
    expect(estadoActual()).toEqual({ estado: 'denegada' });
  });

  test('tocar el chip lo pone y lo quita; al quitarlo, la posición se olvida', async () => {
    alternarCerca();
    expect(estadoActual()).toEqual({ estado: 'buscando' });
    await Promise.resolve();
    await new Promise((listo) => setTimeout(listo, 0));
    expect(estadoActual().estado).toBe('lista');
    alternarCerca();
    expect(estadoActual()).toEqual({ estado: 'apagada' });
  });

  test('quitarlo mientras busca cancela la búsqueda', async () => {
    let entregar: (valor: unknown) => void = () => undefined;
    posicion.mockReturnValue(new Promise((resolver) => (entregar = resolver)));
    const buscando = activarCerca();
    apagarCerca();
    entregar(en(39.47, -0.376));
    await buscando;
    expect(estadoActual()).toEqual({ estado: 'apagada' });
  });

  test('al refrescar, se actualiza si la persona se ha movido; si falla, se queda la que había', async () => {
    await activarCerca();
    posicion.mockResolvedValue(en(39.4781, -0.3249));
    await refrescarUbicacion();
    expect(puntoDe(estadoActual())).toEqual({ lat: 39.478, lng: -0.325 });
    posicion.mockRejectedValue(new Error('sin señal'));
    await refrescarUbicacion();
    expect(puntoDe(estadoActual())).toEqual({ lat: 39.478, lng: -0.325 });
  });
});
