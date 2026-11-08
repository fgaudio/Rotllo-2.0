// Arranca las traducciones. Se importa una sola vez, en src/app/_layout.tsx.
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './en';
import { es } from './es';
import { it } from './it';

export const idiomasDisponibles = ['es', 'en', 'it'] as const;
export type Idioma = (typeof idiomasDisponibles)[number];

// El idioma del móvil si lo tenemos; si no, español.
function idiomaDelMovil(): Idioma {
  const codigo = getLocales()[0]?.languageCode;
  return (idiomasDisponibles as readonly string[]).includes(codigo ?? '')
    ? (codigo as Idioma)
    : 'es';
}

// eslint-disable-next-line import/no-named-as-default-member -- es la forma documentada de i18next
i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    it: { translation: it },
  },
  lng: idiomaDelMovil(),
  fallbackLng: 'es',
  interpolation: { escapeValue: false }, // React ya protege los textos
});

export default i18n;
