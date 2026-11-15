import { describe, expect, jest, test } from '@jest/globals';

import { instanteValencia } from './filtros';
import {
  aFormulario,
  cartelDe,
  diasParaElegir,
  fechasDelPlan,
  leerEnlace,
  leerHora,
  leerPrecio,
  nocheALaQuePertenece,
  PLAN_VACIO,
  situacionDe,
  validarPlan,
  type DatosPlan,
  type PlanLocal,
} from './planesLocal';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn() },
}));

// Sábado 14 de noviembre de 2026, 12:00 en Valencia.
const ahora = instanteValencia(2026, 11, 14, 12);

describe('la hora', () => {
  test('se puede escribir de varias formas', () => {
    expect(leerHora('23:00')).toEqual({ h: 23, min: 0 });
    expect(leerHora('9:30')).toEqual({ h: 9, min: 30 });
    expect(leerHora('2330')).toEqual({ h: 23, min: 30 });
    expect(leerHora('23')).toEqual({ h: 23, min: 0 });
    expect(leerHora('23.15')).toEqual({ h: 23, min: 15 });
    expect(leerHora('21h')).toEqual({ h: 21, min: 0 });
  });
  test('lo que no es una hora se rechaza', () => {
    for (const mal of ['', '24:00', '12:60', 'tarde', '1:2:3', '-1']) expect(leerHora(mal)).toBeNull();
  });
});

describe('el precio', () => {
  test('en euros, con coma o punto, a céntimos', () => {
    expect(leerPrecio('8')).toBe(800);
    expect(leerPrecio('8,50')).toBe(850);
    expect(leerPrecio('8.5')).toBe(850);
    expect(leerPrecio(' 12 € ')).toBe(1200);
  });
  test('cero, negativos, letras o cifras absurdas no valen', () => {
    for (const mal of ['', '0', '-5', 'ocho', '8,555', '99999']) expect(leerPrecio(mal)).toBeNull();
  });
});

describe('el enlace de la ticketera', () => {
  test('se le pone https si falta', () => {
    expect(leerEnlace('entradas.milocal.es/salsa')).toBe('https://entradas.milocal.es/salsa');
    expect(leerEnlace('http://milocal.es')).toBe('https://milocal.es/');
    expect(leerEnlace('https://xceed.me/es/valencia/event/x')).toBe('https://xceed.me/es/valencia/event/x');
  });
  test('lo que no es una dirección web se rechaza', () => {
    for (const mal of ['', 'hola', 'mi web . es', 'javascript:alert(1)', 'ftp://x.es']) expect(leerEnlace(mal)).toBeNull();
  });
});

describe('día y hora en Valencia', () => {
  test('los días para elegir empiezan hoy', () => {
    expect(diasParaElegir(ahora, 3)).toEqual(['2026-11-14', '2026-11-15', '2026-11-16']);
    // A las 23:30 UTC del 31 de diciembre ya es 1 de enero en Valencia
    expect(diasParaElegir(new Date('2026-12-31T23:30:00Z'), 1)).toEqual(['2027-01-01']);
  });
  test('las 23:00 de Valencia en noviembre son las 22:00 UTC', () => {
    expect(fechasDelPlan('2026-11-20', '23:00', '')).toEqual({ empieza: new Date('2026-11-20T22:00:00Z'), termina: null });
  });
  test('en verano la diferencia son dos horas', () => {
    expect(fechasDelPlan('2027-07-10', '20:30', '')?.empieza).toEqual(new Date('2027-07-10T18:30:00Z'));
  });
  test('si termina a una hora anterior, es al día siguiente', () => {
    expect(fechasDelPlan('2026-11-20', '23:00', '04:00')?.termina).toEqual(new Date('2026-11-21T03:00:00Z'));
    expect(fechasDelPlan('2026-11-20', '18:00', '21:00')?.termina).toEqual(new Date('2026-11-20T20:00:00Z'));
  });
  test('un plan de madrugada sale en la noche del día anterior', () => {
    // Domingo 22 a la 01:00 → la noche del sábado 21
    expect(nocheALaQuePertenece('2026-11-22', '01:00')?.toISOString().slice(0, 10)).toBe('2026-11-21');
    expect(nocheALaQuePertenece('2026-11-22', '06:00')).toBeNull();
    expect(nocheALaQuePertenece('2026-11-22', '23:00')).toBeNull();
  });
});

describe('validar el formulario', () => {
  const bien: DatosPlan = { ...PLAN_VACIO, titulo: 'Noche de salsa', categoria: 'musica-en-directo', dia: '2026-11-20', hora: '23:00' };
  test('lo mínimo: título, categoría, día y hora', () => {
    expect(validarPlan(bien, ahora)).toEqual([]);
    expect(validarPlan(PLAN_VACIO, ahora)).toEqual(['titulo', 'categoria', 'dia', 'hora']);
  });
  test('no se puede poner un plan en el pasado', () => {
    expect(validarPlan({ ...bien, dia: '2026-11-14', hora: '10:00' }, ahora)).toEqual(['hora']);
    expect(validarPlan({ ...bien, dia: '2026-11-14', hora: '13:00' }, ahora)).toEqual([]);
  });
  test('de pago: hace falta el precio', () => {
    expect(validarPlan({ ...bien, gratis: false }, ahora)).toEqual(['precio']);
    expect(validarPlan({ ...bien, gratis: false, precio: '8' }, ahora)).toEqual([]);
  });
  test('con ticketera: hace falta un enlace que valga', () => {
    expect(validarPlan({ ...bien, conTicketera: true, urlTicketera: 'mi web' }, ahora)).toEqual(['urlTicketera']);
    expect(validarPlan({ ...bien, conTicketera: true, urlTicketera: 'entradas.es/x' }, ahora)).toEqual([]);
  });
  test('hora de fin mal escrita y texto del cartel demasiado largo', () => {
    expect(validarPlan({ ...bien, horaFin: '25:00', cartelTexto: 'a'.repeat(41) }, ahora)).toEqual(['horaFin', 'cartelTexto']);
  });
});

describe('el cartel', () => {
  test('todo automático: no se guarda nada', () => {
    expect(cartelDe({ cartelEstilo: null, cartelColor: null, cartelTexto: '  ' })).toBeNull();
  });
  test('solo se guarda lo elegido', () => {
    expect(cartelDe({ cartelEstilo: 'cinta', cartelColor: null, cartelTexto: ' Techno hasta las 6 ' })).toEqual({ estilo: 'cinta', texto: 'Techno hasta las 6' });
    expect(cartelDe({ cartelEstilo: null, cartelColor: 'azul', cartelTexto: '' })).toEqual({ color: 'azul' });
  });
});

describe('editar un plan guardado', () => {
  const plan: PlanLocal = {
    id: 'p1',
    titulo: 'Techno en la Marina',
    descripcion: 'Tres DJ.',
    categoria: 'fiesta',
    empiezaEn: '2026-11-20T22:00:00Z',
    terminaEn: '2026-11-21T05:00:00Z',
    esGratis: false,
    precioDesdeCentimos: 1550,
    edadMinima: 21,
    modoEntradas: 'enlace_externo',
    urlTicketera: 'https://entradas.es/techno',
    cartel: { estilo: 'cinta', color: 'azul', texto: 'Techno hasta las 6' },
    fotoUrl: null,
    estado: 'publicado',
    motivoCancelacion: null,
    clics: 12,
  };
  test('vuelve al formulario con el día y la hora de Valencia', () => {
    expect(aFormulario(plan)).toMatchObject({ dia: '2026-11-20', hora: '23:00', horaFin: '06:00', precio: '15,5', gratis: false, conTicketera: true, edadMinima: 21, cartelEstilo: 'cinta', cartelColor: 'azul' });
  });
  test('ida y vuelta: se guarda lo mismo que había', () => {
    const datos = aFormulario(plan);
    expect(fechasDelPlan(datos.dia!, datos.hora, datos.horaFin)).toEqual({ empieza: new Date(plan.empiezaEn), termina: new Date(plan.terminaEn!) });
    expect(leerPrecio(datos.precio)).toBe(1550);
    expect(cartelDe(datos)).toEqual(plan.cartel);
  });
  test('un plan publicado que ya ha pasado está "terminado"', () => {
    expect(situacionDe(plan, ahora)).toBe('publicado');
    expect(situacionDe(plan, new Date('2026-11-21T05:00:01Z'))).toBe('terminado');
    expect(situacionDe({ ...plan, estado: 'borrador' }, new Date('2027-01-01T00:00:00Z'))).toBe('borrador');
    // Sin hora de fin: 6 horas después de empezar
    expect(situacionDe({ ...plan, terminaEn: null }, new Date('2026-11-21T03:59:00Z'))).toBe('publicado');
    expect(situacionDe({ ...plan, terminaEn: null }, new Date('2026-11-21T04:01:00Z'))).toBe('terminado');
  });
});
