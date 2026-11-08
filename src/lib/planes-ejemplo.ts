// DATOS DE EJEMPLO para ver la app funcionando antes de conectar Supabase.
// Las fechas se calculan a partir de hoy, para que los filtros "Hoy" y "Este finde"
// siempre enseñen algo. Cuando exista la tabla `planes`, este archivo se borra.
import type { Plan } from './tipos';

function dentroDe(dias: number, hora: number, minutos = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  d.setHours(hora, minutos, 0, 0);
  return d.toISOString();
}

function proximoDia(diaSemana: number, hora: number) {
  const hoy = new Date().getDay();
  return dentroDe((diaSemana - hoy + 7) % 7, hora);
}

export const planesEjemplo: Plan[] = [
  {
    id: 'salsa-russafa',
    titulo: 'Noche de salsa',
    descripcion:
      'Abrimos con una clase de iniciación para que nadie se quede mirando. Después, pista libre con DJ hasta el cierre. No hace falta pareja.',
    categoria: 'musica-en-directo',
    empiezaEn: dentroDe(0, 23),
    terminaEn: null,
    local: 'Café Mercedes Jazz',
    direccion: 'Calle de Sueca 27, Valencia',
    barrio: 'Russafa',
    lat: 39.4616,
    lng: -0.3755,
    esGratis: false,
    precioDesdeCentimos: 800,
    edadMinima: 18,
    modoEntradas: 'enlace_externo',
    urlTicketera: 'https://example.com/entradas/salsa',
    fotoUrl: null,
  },
  {
    id: 'vermut-carmen',
    titulo: 'Vermut y vinilos',
    descripcion:
      'Vermut de grifo y sesión de vinilos en la terraza. Pásate, pide algo y quédate el rato que quieras.',
    categoria: 'bar-y-tardeo',
    empiezaEn: proximoDia(6, 13),
    terminaEn: null,
    local: 'Bar La Placeta',
    direccion: 'Plaça del Tossal 3, Valencia',
    barrio: 'el Carmen',
    lat: 39.4766,
    lng: -0.3798,
    esGratis: true,
    precioDesdeCentimos: null,
    edadMinima: 18,
    modoEntradas: 'ninguna',
    urlTicketera: null,
    fotoUrl: null,
  },
  {
    id: 'voley-malvarrosa',
    titulo: 'Vóley en la playa',
    descripcion:
      'Partidos mixtos para todos los niveles. Se hacen equipos al llegar. Trae agua y crema.',
    categoria: 'deporte',
    empiezaEn: proximoDia(0, 11),
    terminaEn: null,
    local: 'Club Vóley Malva-rosa',
    direccion: 'Passeig Marítim de la Malva-rosa, Valencia',
    barrio: 'la Malva-rosa',
    lat: 39.4783,
    lng: -0.3237,
    esGratis: true,
    precioDesdeCentimos: null,
    edadMinima: 18,
    modoEntradas: 'ninguna',
    urlTicketera: null,
    fotoUrl: null,
  },
  {
    id: 'techno-marina',
    titulo: 'Techno en la Marina',
    descripcion: 'Sesión larga junto al mar con tres DJ residentes. Abre a medianoche.',
    categoria: 'fiesta',
    empiezaEn: proximoDia(5, 23),
    terminaEn: null,
    local: 'Sala Marina',
    direccion: 'Moll de la Duana, Valencia',
    barrio: 'la Marina',
    lat: 39.4589,
    lng: -0.3268,
    esGratis: false,
    precioDesdeCentimos: 1500,
    edadMinima: 21,
    modoEntradas: 'enlace_externo',
    urlTicketera: 'https://example.com/entradas/techno',
    fotoUrl: null,
  },
];

export function buscarPlan(id: string) {
  return planesEjemplo.find((plan) => plan.id === id) ?? null;
}
