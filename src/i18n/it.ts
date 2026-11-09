import type { Textos } from './es';

// Italiano. Primera versión: conviene que la revise una persona nativa.
export const it: Textos = {
  comun: {
    cargando: 'Caricamento eventi…',
    error: {
      titulo: 'Ops, qualcosa è andato storto',
      texto: 'Non siamo riusciti a caricare gli eventi. Controlla la connessione e riprova.',
      boton: 'Riprova',
    },
  },
  pestanas: {
    planes: 'Eventi',
    mapa: 'Mappa',
    guardados: 'Salvati',
    perfil: 'Profilo',
  },
  feed: {
    titulo: 'Che si fa?',
    subtitulo: 'Eventi a Valencia',
    filtros: 'Filtra gli eventi',
    filtro: {
      hoy: 'Oggi',
      finde: 'Questo weekend',
      gratis: 'Gratis',
    },
    destacado: {
      hoy: 'Il piano di oggi',
      proximo: 'Prossimamente',
    },
    vacio: {
      titulo: 'Qui non c’è niente',
      texto: 'Nessun evento con questo filtro. Provane un altro.',
      boton: 'Vedi tutti',
    },
    datosEjemplo: 'Dati di esempio finché non colleghiamo Supabase',
  },
  busqueda: {
    placeholder: 'Cerca eventi o locali',
    etiqueta: 'Cerca eventi',
    borrar: 'Cancella ricerca',
  },
  precio: {
    gratis: 'Gratis',
    desde: 'Da {{precio}}',
  },
  plan: {
    deQueVa: 'Di cosa si tratta',
    dondeEs: 'Dov’è',
    comoLlegar: 'Come arrivare',
    comoLlegarAyuda: 'Apre l’app delle mappe',
    pillarEntrada: 'Prendi il biglietto',
    seCompraFuera: 'Si compra sul sito del locale',
    entradaLibre: 'Ingresso libero, senza prenotazione',
    edadMinima: '+{{edad}}',
    edadMinimaAyuda: 'Età minima: {{edad}} anni. Porta un documento.',
    foto: 'Foto di {{titulo}}',
    noExiste: {
      titulo: 'Questo evento non esiste',
      texto: 'Forse è stato rimosso. Guarda altri eventi.',
      boton: 'Vedi eventi',
    },
  },
  mapa: {
    soloEnApp: 'La mappa è nell’app. Qui trovi gli eventi in lista.',
    verPlan: 'Vedi evento',
  },
  guardados: {
    vacio: {
      titulo: 'Non hai ancora salvato niente',
      texto: 'Quando salvi un evento, lo trovi qui.',
      boton: 'Vedi eventi',
    },
  },
  perfil: {
    entrar: {
      titulo: 'Entra in Rotllo',
      texto: 'Presto potrai creare il tuo account e salvare i tuoi eventi.',
    },
    idioma: 'Lingua',
  },
  idiomas: {
    es: 'Español',
    en: 'English',
    it: 'Italiano',
  },
};
