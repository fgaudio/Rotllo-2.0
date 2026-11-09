import type { Textos } from './es';

// English. Same vibe as Spanish: casual, short, straight to the point.
export const en: Textos = {
  comun: {
    volver: 'Back',
    cargando: 'Loading plans…',
    error: {
      titulo: 'Oops, something went wrong',
      texto: "Plans didn't load. Check your connection and try again.",
      boton: 'Try again',
    },
  },
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
    destacado: {
      hoy: "Today's pick",
      proximo: 'Coming up',
    },
    vacio: {
      titulo: 'Nothing here',
      texto: 'No plans match this filter. Try another one.',
      boton: 'See all',
    },
    sinResultados: {
      titulo: 'Nothing for “{{consulta}}”',
      texto: 'Try another word, a neighbourhood or the venue name.',
      boton: 'Clear search',
    },
    datosEjemplo: 'Sample data until Supabase is connected',
  },
  busqueda: {
    placeholder: 'Search plans or places',
    etiqueta: 'Search plans',
    borrar: 'Clear search',
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
    compartir: 'Share plan',
    compartirMensaje: '{{titulo}}, on Rotllo: {{url}}',
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
      texto: 'Create your account to save plans and keep them handy.',
      boton: 'Sign in',
    },
    idioma: 'Language',
  },
  bienvenida: {
    saltar: 'Skip',
    siguiente: 'Next',
    empezar: "Let's go",
    paso: 'Step {{actual}} of {{total}}',
    uno: {
      titulo: 'Valencia has plans',
      texto: 'Parties, gigs, afternoon drinks and sports. Tonight and this weekend, all in one place.',
    },
    dos: {
      titulo: 'Get there easy',
      texto: 'See where it is and open the route in your maps app with one tap.',
    },
    tres: {
      titulo: 'Grab your ticket',
      texto: "If the plan has tickets, we'll take you straight to the venue's site.",
    },
  },
  entrar: {
    titulo: 'Sign in and save your plans',
    texto: 'Your saved plans, on any phone you use.',
    apple: 'Continue with Apple',
    google: 'Continue with Google',
    email: 'Continue with email',
    sinCuenta: 'Look around first',
    mayores: 'Rotllo is for over-18s only.',
    prueba: 'Test screen: accounts are coming soon',
    correo: {
      titulo: "What's your email?",
      texto: "We'll send you a code to sign in. No passwords.",
      etiqueta: 'Email',
      placeholder: 'you@email.com',
      enviar: 'Send code',
      error: "That email doesn't look right. Check it.",
    },
    codigo: {
      titulo: 'Check your inbox',
      texto: 'We sent a code to {{email}}.',
      etiqueta: '6-digit code',
      entrar: 'Sign in',
      error: 'The code has 6 digits. Check your email.',
      cambiar: 'Change email',
    },
    edad: {
      titulo: 'When were you born?',
      texto: "We need it for 18+ and 21+ plans. We don't show it to anyone.",
      dia: 'Day',
      mes: 'Month',
      anio: 'Year',
      seguir: 'Continue',
      invalida: "That date doesn't exist. Check the day, month and year.",
      menor: "Rotllo is for over-18s only. See you when you're 18.",
    },
  },
  idiomas: {
    es: 'Español',
    en: 'English',
    it: 'Italiano',
  },
};
