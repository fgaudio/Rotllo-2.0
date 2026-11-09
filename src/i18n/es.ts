// Textos de la app en español (idioma principal). Tono Rotllo: tuteo, frases cortas,
// sin vueltas. en.ts e it.ts tienen que tener exactamente las mismas claves
// (TypeScript avisa si falta alguna).

export const es = {
  comun: {
    volver: 'Volver',
    cargando: 'Cargando planes…',
    error: {
      titulo: 'Uy, algo ha fallado',
      texto: 'No hemos podido cargar los planes. Revisa tu conexión y prueba otra vez.',
      boton: 'Reintentar',
    },
  },
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
    destacado: {
      hoy: 'El plan de hoy',
      proximo: 'Lo próximo',
    },
    vacio: {
      titulo: 'Aquí no hay nada',
      texto: 'Con este filtro no sale ningún plan. Prueba otro.',
      boton: 'Ver todos',
    },
    sinResultados: {
      titulo: 'Nada con «{{consulta}}»',
      texto: 'Prueba con otra palabra, un barrio o el nombre del local.',
      boton: 'Borrar búsqueda',
    },
    datosEjemplo: 'Datos de ejemplo hasta conectar Supabase',
  },
  busqueda: {
    placeholder: 'Busca un plan o un sitio',
    etiqueta: 'Buscar planes',
    borrar: 'Borrar búsqueda',
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
    compartir: 'Compartir plan',
    compartirMensaje: '{{titulo}}, en Rotllo: {{url}}',
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
      texto: 'Crea tu cuenta para guardar planes y tenerlos a mano.',
      boton: 'Entrar',
    },
    idioma: 'Idioma',
  },
  bienvenida: {
    saltar: 'Saltar',
    siguiente: 'Siguiente',
    empezar: 'Empezar',
    paso: 'Paso {{actual}} de {{total}}',
    uno: {
      titulo: 'Valencia tiene plan',
      texto: 'Fiesta, conciertos, tardeo y deporte. Lo de hoy y lo del finde, en un sitio.',
    },
    dos: {
      titulo: 'Llega sin perderte',
      texto: 'Mira dónde es y abre la ruta en tu app de mapas con un toque.',
    },
    tres: {
      titulo: 'Pilla tu entrada',
      texto: 'Si el plan tiene entrada, te llevamos directo a la web del local.',
    },
  },
  entrar: {
    titulo: 'Entra y guarda tus planes',
    texto: 'Tus planes guardados, en el móvil que uses.',
    apple: 'Seguir con Apple',
    google: 'Seguir con Google',
    email: 'Seguir con email',
    sinCuenta: 'Mirar sin cuenta',
    mayores: 'Rotllo es solo para mayores de 18.',
    prueba: 'Pantalla de prueba: las cuentas llegan pronto',
    correo: {
      titulo: '¿Cuál es tu email?',
      texto: 'Te mandamos un código para entrar. Sin contraseñas.',
      etiqueta: 'Email',
      placeholder: 'tu@email.com',
      enviar: 'Enviar código',
      error: 'Este email no parece bien escrito. Revísalo.',
    },
    codigo: {
      titulo: 'Mira tu correo',
      texto: 'Te hemos mandado un código a {{email}}.',
      etiqueta: 'Código de 6 cifras',
      entrar: 'Entrar',
      error: 'El código tiene 6 cifras. Míralo en el correo.',
      cambiar: 'Cambiar email',
    },
    edad: {
      titulo: '¿Cuándo naciste?',
      texto: 'Lo necesitamos para los planes +18 y +21. No se lo enseñamos a nadie.',
      dia: 'Día',
      mes: 'Mes',
      anio: 'Año',
      seguir: 'Seguir',
      invalida: 'Esta fecha no existe. Revisa el día, el mes y el año.',
      menor: 'Rotllo es solo para mayores de 18. Te esperamos cuando los cumplas.',
    },
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
