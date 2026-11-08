import type { ExpoConfig } from 'expo/config';

// Configuración de la app. Es un archivo .ts (y no app.json) para poder leer
// claves desde variables de entorno (.env) sin escribirlas en el código.
// Los identificadores "app.rotllo" son provisionales: hay que confirmarlos antes de
// publicar en las tiendas, porque después no se pueden cambiar.

const DOMINIO = 'rotllo.app'; // Dominio de los deep links (ADR-001). Pendiente de comprar.

const config: ExpoConfig = {
  name: 'Rotllo',
  slug: 'rotllo',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png', // PROVISIONAL: icono de la plantilla de Expo
  scheme: 'rotllo',
  userInterfaceStyle: 'light', // De momento solo modo claro (no hay guía de modo oscuro)
  ios: {
    bundleIdentifier: 'app.rotllo',
    icon: './assets/expo.icon',
    associatedDomains: [`applinks:${DOMINIO}`],
    supportsTablet: false,
  },
  android: {
    package: 'app.rotllo',
    adaptiveIcon: {
      backgroundColor: '#FFF7ED',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: DOMINIO, pathPrefix: '/p' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    predictiveBackGestureEnabled: false,
  },
  web: {
    // 'single': la web se dibuja solo en el navegador. Más simple y sin errores de
    // "hidratación" (servidor en inglés/UTC vs. navegador en español/Madrid).
    // Para que los enlaces muestren vista previa al compartirlos (Instagram, WhatsApp),
    // habrá que pasar a 'server' y fijar el idioma y la hora en el servidor.
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFF7ED',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    [
      'react-native-maps',
      {
        // Clave de Google Maps para Android, restringida a la app (ADR-004).
        // En iOS se usa Apple Maps y no hace falta clave.
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
