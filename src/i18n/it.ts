import type { Textos } from './es';

// Italiano. Primera versión: conviene que la revise una persona nativa.
export const it: Textos = {
  comun: {
    volver: 'Indietro',
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
    sinResultados: {
      titulo: 'Niente per «{{consulta}}»',
      texto: 'Prova con un’altra parola, un quartiere o il nome del locale.',
      boton: 'Cancella ricerca',
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
    compartir: 'Condividi evento',
    compartirMensaje: '{{titulo}}, su Rotllo: {{url}}',
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
      texto: 'Crea il tuo account per salvare gli eventi e averli sempre a portata di mano.',
      boton: 'Entra',
    },
    idioma: 'Lingua',
  },
  bienvenida: {
    saltar: 'Salta',
    siguiente: 'Avanti',
    empezar: 'Iniziamo',
    paso: 'Passo {{actual}} di {{total}}',
    uno: {
      titulo: 'Valencia ha sempre un piano',
      texto: 'Feste, concerti, aperitivi e sport. Stasera e nel weekend, tutto in un posto.',
    },
    dos: {
      titulo: 'Arriva senza perderti',
      texto: "Guarda dov'è e apri il percorso nella tua app di mappe con un tocco.",
    },
    tres: {
      titulo: 'Prendi il biglietto',
      texto: "Se l'evento ha biglietti, ti portiamo dritto al sito del locale.",
    },
  },
  entrar: {
    titulo: 'Entra e salva i tuoi eventi',
    texto: 'I tuoi eventi salvati, su qualsiasi telefono.',
    apple: 'Continua con Apple',
    google: 'Continua con Google',
    email: 'Continua con email',
    sinCuenta: 'Dai prima un’occhiata',
    mayores: 'Rotllo è solo per maggiorenni.',
    prueba: 'Schermata di prova: gli account arrivano presto',
    correo: {
      titulo: 'Qual è la tua email?',
      texto: 'Ti mandiamo un codice per entrare. Niente password.',
      etiqueta: 'Email',
      placeholder: 'tu@email.com',
      enviar: 'Invia codice',
      error: 'Questa email non sembra giusta. Controllala.',
    },
    codigo: {
      titulo: 'Controlla la posta',
      texto: 'Ti abbiamo mandato un codice a {{email}}.',
      etiqueta: 'Codice di 6 cifre',
      entrar: 'Entra',
      error: "Il codice ha 6 cifre. Guardalo nell'email.",
      cambiar: 'Cambia email',
    },
    edad: {
      titulo: 'Qual è la tua data di nascita?',
      texto: 'Ci serve per gli eventi +18 e +21. Non lo mostriamo a nessuno.',
      dia: 'Giorno',
      mes: 'Mese',
      anio: 'Anno',
      seguir: 'Continua',
      invalida: 'Questa data non esiste. Controlla giorno, mese e anno.',
      menor: 'Rotllo è solo per maggiorenni. Ti aspettiamo quando compi 18 anni.',
    },
  },
  idiomas: {
    es: 'Español',
    en: 'English',
    it: 'Italiano',
  },
};
