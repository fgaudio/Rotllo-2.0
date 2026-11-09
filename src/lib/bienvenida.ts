// Recuerda en el móvil si ya se vio la bienvenida, para enseñarla solo la primera vez.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const CLAVE = 'rotllo.bienvenidaVista';

export async function marcarBienvenidaVista() {
  await AsyncStorage.setItem(CLAVE, '1').catch(() => undefined);
}

// null mientras se lee; si no se puede leer, se da por vista (mejor eso que repetirla siempre).
export function useBienvenidaVista(): boolean | null {
  const [vista, setVista] = useState<boolean | null>(null);
  useEffect(() => {
    let activo = true;
    AsyncStorage.getItem(CLAVE)
      .then((valor) => activo && setVista(valor === '1'))
      .catch(() => activo && setVista(true));
    return () => {
      activo = false;
    };
  }, []);
  return vista;
}
