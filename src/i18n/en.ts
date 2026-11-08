import type { Textos } from './es';

// English. Same vibe as Spanish: casual, short, straight to the point.
export const en: Textos = {
  pestanas: {
    planes: 'Plans',
    mapa: 'Map',
    guardados: 'Saved',
    perfil: 'Profile',
  },
  feed: {
    titulo: "What's the plan?",
    subtitulo: 'Plans in Valencia',
    filtros: 'Filter plans',
    filtro: {
      hoy: 'Today',
      finde: 'This weekend',
      gratis: 'Free',
    },
    vacio: {
      titulo: 'Nothing here',
      texto: 'No plans match this filter. Try another one.',
      boton: 'See all',
    },
    datosEjemplo: 'Sample data until Supabase is connected',
  },
  precio: {
    gratis: 'Free',
    desde: 'From {{precio}}',
  },
  plan: {
    deQueVa: "What's it about",
    dondeEs: 'Where',
    comoLlegar: 'Get directions',
    comoLlegarAyuda: 'Opens your maps app',
    pillarEntrada: 'Get tickets',
    seCompraFuera: "You'll buy on the venue's site",
    entradaLibre: 'Free entry, no booking',
    edadMinima: '{{edad}}+',
    edadMinimaAyuda: 'Minimum age: {{edad}}. Bring your ID.',
    foto: 'Photo of {{titulo}}',
    noExiste: {
      titulo: "This plan doesn't exist",
      texto: 'It may have been removed. Check other plans.',
      boton: 'See plans',
    },
  },
  mapa: {
    soloEnApp: 'The map lives in the app. Here are the plans as a list.',
    verPlan: 'See plan',
  },
  guardados: {
    vacio: {
      titulo: 'Nothing saved yet',
      texto: "Save a plan and you'll find it here.",
      boton: 'See plans',
    },
  },
  perfil: {
    entrar: {
      titulo: 'Join Rotllo',
      texto: "Soon you'll be able to create your account and save plans.",
    },
    idioma: 'Language',
  },
  idiomas: {
    es: 'Español',
    en: 'English',
    it: 'Italiano',
  },
};
