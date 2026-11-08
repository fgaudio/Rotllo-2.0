// Un identificador anónimo y aleatorio de este móvil, guardado en el propio teléfono.
// Solo sirve para no contar dos veces el mismo clic a la ticketera cuando alguien no tiene
// cuenta (docs/revision-cto.md, punto 7). No identifica a la persona ni sale del contador.
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVE = 'rotllo.dispositivo';
let enMemoria: string | null = null;

function aleatorio() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 40);
}

export async function idDispositivo(): Promise<string> {
  if (enMemoria) return enMemoria;
  try {
    const guardado = await AsyncStorage.getItem(CLAVE);
    enMemoria = guardado ?? aleatorio();
    if (!guardado) await AsyncStorage.setItem(CLAVE, enMemoria);
  } catch {
    enMemoria = enMemoria ?? aleatorio(); // sin almacenamiento (p. ej. modo privado del navegador)
  }
  return enMemoria;
}
