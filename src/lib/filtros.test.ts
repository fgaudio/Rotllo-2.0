// Mismos casos que supabase/tests/database/02_feed_y_clics.test.sql, para que la app con
// datos de ejemplo y la base de datos filtren igual.
import { describe, expect, test } from '@jest/globals';

import { filtrarPlanes, instanteValencia, ventanas } from './filtros';
import type { Plan } from './tipos';

function plan(id: string, empiezaValencia: [number, number, number, number, number?], gratis = false): Plan {
  const [y, m, d, h, min = 0] = empiezaValencia;
  const empieza = new Date(instanteValencia(y, m, d, h).getTime() + min * 60 * 1000);
  return {
    id,
    titulo: id,
    descripcion: '',
    categoria: 'fiesta',
    empiezaEn: empieza.toISOString(),
    terminaEn: null,
    local: 'Local',
    direccion: '',
    barrio: '',
    lat: 39.47,
    lng: -0.37,
    esGratis: gratis,
    precioDesdeCentimos: gratis ? null : 800,
    edadMinima: 18,
    modoEntradas: 'ninguna',
    urlTicketera: null,
    fotoUrl: null,
  };
}

// Marzo de 2030: jueves 14, viernes 15, sábado 16, domingo 17, lunes 18
const planes = [
  plan('jueves noche', [2030, 3, 14, 22]),
  plan('viernes madrugada', [2030, 3, 16, 0, 30]),
  plan('sábado tarde', [2030, 3, 16, 20]),
  plan('domingo madrugada', [2030, 3, 18, 3]),
  plan('lunes mañana', [2030, 3, 18, 10]),
  plan('lunes gratis', [2030, 3, 18, 12], true),
];
const titulos = (lista: Plan[]) => lista.map((p) => p.titulo);
const enValencia = (d: number, h: number, min = 0) => new Date(instanteValencia(2030, 3, d, h).getTime() + min * 60 * 1000);

describe('filtros del feed (hora de Valencia, día de 06:00 a 06:00)', () => {
  const viernes2330 = enValencia(15, 23, 30);

  test('instanteValencia tiene en cuenta el horario de invierno (UTC+1)', () => {
    expect(instanteValencia(2030, 3, 15, 23).toISOString()).toBe('2030-03-15T22:00:00.000Z');
  });

  test('y el de verano (UTC+2)', () => {
    expect(instanteValencia(2030, 7, 15, 23).toISOString()).toBe('2030-07-15T21:00:00.000Z');
  });

  test('viernes 23:30: "Hoy" incluye la fiesta de las 00:30 del sábado', () => {
    expect(titulos(filtrarPlanes(planes, 'hoy', viernes2330))).toEqual(['viernes madrugada']);
  });

  test('"Este finde" va del viernes 06:00 al lunes 06:00', () => {
    expect(titulos(filtrarPlanes(planes, 'finde', viernes2330))).toEqual([
      'viernes madrugada',
      'sábado tarde',
      'domingo madrugada',
    ]);
  });

  test('"Gratis" solo enseña los gratis', () => {
    expect(titulos(filtrarPlanes(planes, 'gratis', viernes2330))).toEqual(['lunes gratis']);
  });

  test('por tipo de plan, solo o combinado con otro filtro', () => {
    // Todos los planes de prueba son "fiesta" menos uno, que se cambia aquí a "deporte".
    const mezclados = planes.map((p) => (p.titulo === 'lunes gratis' ? { ...p, categoria: 'deporte' } : p));
    expect(titulos(filtrarPlanes(mezclados, null, viernes2330, 'deporte'))).toEqual(['lunes gratis']);
    expect(titulos(filtrarPlanes(mezclados, 'gratis', viernes2330, 'deporte'))).toEqual(['lunes gratis']);
    expect(titulos(filtrarPlanes(mezclados, 'gratis', viernes2330, 'fiesta'))).toEqual([]);
    expect(titulos(filtrarPlanes(mezclados, 'hoy', viernes2330, 'fiesta'))).toEqual(titulos(filtrarPlanes(planes, 'hoy', viernes2330)));
    expect(titulos(filtrarPlanes(mezclados, null, viernes2330, 'no-existe'))).toEqual([]);
  });

  test('sin filtro: lo que no ha terminado, por fecha', () => {
    expect(titulos(filtrarPlanes(planes, null, viernes2330))).toEqual([
      'viernes madrugada',
      'sábado tarde',
      'domingo madrugada',
      'lunes mañana',
      'lunes gratis',
    ]);
  });

  test('sábado 05:30 sigue siendo la noche del viernes', () => {
    expect(titulos(filtrarPlanes(planes, 'hoy', enValencia(16, 5, 30)))).toEqual(['viernes madrugada']);
  });

  test('sábado 07:00 ya es sábado', () => {
    expect(titulos(filtrarPlanes(planes, 'hoy', enValencia(16, 7)))).toEqual(['sábado tarde']);
  });

  test('un miércoles, "Este finde" es el que viene', () => {
    expect(titulos(filtrarPlanes(planes, 'finde', enValencia(13, 12)))).toEqual([
      'viernes madrugada',
      'sábado tarde',
      'domingo madrugada',
    ]);
  });

  test('el domingo por la tarde, el finde aún es el actual', () => {
    const v = ventanas(enValencia(17, 18));
    expect(v.findeInicio.toISOString()).toBe(instanteValencia(2030, 3, 15, 6).toISOString());
    expect(v.findeFin.toISOString()).toBe(instanteValencia(2030, 3, 18, 6).toISOString());
  });
});

// Mismos casos que supabase/tests/database/08_cerca_de_mi.test.sql.
describe('«Cerca de mí»: dentro de cada día, primero lo más cercano', () => {
  const ayuntamiento = { lat: 39.4699, lng: -0.3763 };
  const malvarrosa = { lat: 39.478, lng: -0.325 };
  const en = (base: Plan, lat: number, lng: number, extra: Partial<Plan> = {}): Plan => ({ ...base, lat, lng, ...extra });
  const hastaElSabadoALaUna = instanteValencia(2030, 3, 16, 1).toISOString();
  const cercanos = [
    en(plan('jueves abierto', [2030, 3, 14, 23]), 39.476, -0.379, { terminaEn: hastaElSabadoALaUna }),
    en(plan('viernes medio', [2030, 3, 15, 20]), 39.485, -0.362),
    en(plan('viernes lejos', [2030, 3, 15, 22]), 39.478, -0.325),
    en(plan('viernes cerca', [2030, 3, 16, 0, 30]), 39.462, -0.374),
    en(plan('sábado gratis', [2030, 3, 16, 18], true), 39.478, -0.325, { categoria: 'musica-en-directo' }),
    en(plan('sábado tarde', [2030, 3, 16, 19]), 39.47, -0.376),
    en(plan('sábado noche', [2030, 3, 16, 23]), 39.47, -0.376),
  ];
  const viernes2330 = enValencia(15, 23, 30);

  test('primero el día y, dentro del día, lo más cercano', () => {
    expect(titulos(filtrarPlanes(cercanos, null, viernes2330, null, ayuntamiento))).toEqual([
      'jueves abierto',
      'viernes cerca',
      'viernes medio',
      'viernes lejos',
      'sábado tarde',
      'sábado noche',
      'sábado gratis',
    ]);
  });

  test('sin «Cerca de mí», sigue por orden de fecha', () => {
    expect(titulos(filtrarPlanes(cercanos, null, viernes2330))).toEqual([
      'jueves abierto',
      'viernes medio',
      'viernes lejos',
      'viernes cerca',
      'sábado gratis',
      'sábado tarde',
      'sábado noche',
    ]);
  });

  test('desde otro sitio, el orden dentro de cada día cambia', () => {
    expect(titulos(filtrarPlanes(cercanos, null, viernes2330, null, malvarrosa))).toEqual([
      'viernes lejos',
      'viernes medio',
      'viernes cerca',
      'jueves abierto',
      'sábado gratis',
      'sábado tarde',
      'sábado noche',
    ]);
  });

  test('con los filtros de siempre', () => {
    expect(titulos(filtrarPlanes(cercanos, 'hoy', viernes2330, null, ayuntamiento))).toEqual(['jueves abierto', 'viernes cerca', 'viernes medio', 'viernes lejos']);
    expect(titulos(filtrarPlanes(cercanos, 'gratis', viernes2330, null, ayuntamiento))).toEqual(['sábado gratis']);
    expect(titulos(filtrarPlanes(cercanos, 'finde', viernes2330, 'musica-en-directo', ayuntamiento))).toEqual(['sábado gratis']);
  });

  test('mismo día y mismo sitio: por hora', () => {
    expect(titulos(filtrarPlanes(cercanos, null, enValencia(16, 12), null, ayuntamiento))).toEqual(['sábado tarde', 'sábado noche', 'sábado gratis']);
  });

  test('una posición que no existe no devuelve nada', () => {
    expect(filtrarPlanes(cercanos, null, viernes2330, null, { lat: 91, lng: -0.3763 })).toEqual([]);
    expect(filtrarPlanes(cercanos, null, viernes2330, null, { lat: 39.4699, lng: 181 })).toEqual([]);
    expect(filtrarPlanes(cercanos, null, viernes2330, null, { lat: NaN, lng: NaN })).toEqual([]);
  });

  test('salen los mismos planes que sin «Cerca de mí», solo cambia el orden', () => {
    expect(titulos(filtrarPlanes(cercanos, null, viernes2330, null, ayuntamiento)).sort()).toEqual(titulos(filtrarPlanes(cercanos, null, viernes2330)).sort());
  });
});
