// Textos de la app en español (idioma principal). Tono Rotllo: tuteo, frases cortas,
// sin vueltas. en.ts e it.ts tienen que tener exactamente las mismas claves
// (TypeScript avisa si falta alguna).

export const es = {
  pestanas: {
    planes: 'Planes',
    mapa: 'Mapa',
    guardados: 'Guardados',
    perfil: 'Perfil',
  },
  feed: {
    titulo: '¿Qué hacemos?',
    subtitulo: 'Planes en Valencia',
    filtros: 'Filtrar planes',
    filtro: {
      hoy: 'Hoy',
      finde: 'Este finde',
      gratis: 'Gratis',
    },
    vacio: {
      titulo: 'Aquí no hay nada',
      texto: 'Con este filtro no sale ningún plan. Prueba otro.',
      boton: 'Ver todos',
    },
    datosEjemplo: 'Datos de ejemplo hasta conectar Supabase',
  },
  precio: {
    gratis: 'Gratis',
    desde: 'Desde {{precio}}',
  },
  plan: {
    deQueVa: 'De qué va',
    dondeEs: 'Dónde es',
    comoLlegar: 'Cómo llegar',
    comoLlegarAyuda: 'Abre la app de mapas',
    pillarEntrada: 'Pillar entrada',
    seCompraFuera: 'Se compra en la web del local',
    entradaLibre: 'Entrada libre, sin reserva',
    edadMinima: '+{{edad}}',
    edadMinimaAyuda: 'Edad mínima: {{edad}} años. Lleva el DNI.',
    foto: 'Foto de {{titulo}}',
    noExiste: {
      titulo: 'Este plan no existe',
      texto: 'Puede que lo hayan quitado. Mira otros planes.',
      boton: 'Ver planes',
    },
  },
  mapa: {
    soloEnApp: 'El mapa está en la app. Aquí tienes los planes en lista.',
    verPlan: 'Ver plan',
  },
  guardados: {
    vacio: {
      titulo: 'Aún no has guardado nada',
      texto: 'Cuando guardes un plan, lo tendrás aquí.',
      boton: 'Ver planes',
    },
  },
  perfil: {
    entrar: {
      titulo: 'Entra en Rotllo',
      texto: 'Pronto podrás crear tu cuenta y guardar tus planes.',
    },
    idioma: 'Idioma',
  },
  idiomas: {
    es: 'Español',
    en: 'English',
    it: 'Italiano',
  },
};

// Misma forma que `es`, pero con cualquier texto en cada hoja.
type Hojas<T> = { [K in keyof T]: T[K] extends string ? string : Hojas<T[K]> };
export type Textos = Hojas<typeof es>;
