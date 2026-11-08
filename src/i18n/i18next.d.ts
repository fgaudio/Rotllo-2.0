// Hace que t('...') solo acepte claves que existen en es.ts (TypeScript avisa si no).
import 'i18next';

import type { es } from './es';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof es };
  }
}
