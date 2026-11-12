// Atajos de navegación que usan varias pantallas.
import { router } from 'expo-router';

// Cierra las pantallas de entrar y vuelve a las pestañas, en Perfil.
export function volverAlPerfil() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/perfil');
}

// Vuelve atrás o, si no hay pantalla anterior (se llegó por un enlace), a los planes.
export function volverOInicio() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}
