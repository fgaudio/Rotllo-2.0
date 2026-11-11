import { describe, expect, test } from '@jest/globals';

import { coloresCartel } from '@/theme/tokens';

import { inicialDe, resolverCartel } from './cartel';

const plan = { id: 'salsa-russafa', titulo: 'Noche de salsa', categoria: 'musica-en-directo', cartel: null };

describe('cartel generado', () => {
  test('sin configuración: color de la categoría y el título en mayúsculas', () => {
    const c = resolverCartel(plan);
    expect(c.nombreColor).toBe('amarillo');
    expect(c.color).toBe(coloresCartel.amarillo);
    expect(c.texto).toBe('NOCHE DE SALSA');
  });
  test('el mismo plan da siempre el mismo estilo', () => {
    expect(resolverCartel(plan).estilo).toBe(resolverCartel({ ...plan }).estilo);
  });
  test('el local elige estilo, color y texto', () => {
    const c = resolverCartel({ ...plan, cartel: { estilo: 'cinta', color: 'violeta', texto: '  2x1 hasta la 1  ' } });
    expect(c).toMatchObject({ estilo: 'cinta', nombreColor: 'violeta', texto: '2X1 HASTA LA 1' });
  });
  test('valores que no existen se ignoran', () => {
    const c = resolverCartel({ ...plan, cartel: { estilo: 'neon' as never, color: 'fucsia', texto: '   ' } });
    expect(c.nombreColor).toBe('amarillo');
    expect(['cinta', 'inicial', 'serie']).toContain(c.estilo);
    expect(c.texto).toBe('NOCHE DE SALSA');
  });
  test('el texto propio se corta a 40 letras', () => {
    expect(resolverCartel({ ...plan, cartel: { texto: 'a'.repeat(60) } }).texto).toHaveLength(40);
  });
  test('categoría desconocida: rosa', () => {
    expect(resolverCartel({ ...plan, categoria: 'otra' }).nombreColor).toBe('rosa');
  });
  test('inicial: salta signos', () => {
    expect(inicialDe('¿QUÉ HACEMOS?')).toBe('Q');
    expect(inicialDe('2X1')).toBe('2');
    expect(inicialDe('···')).toBe('?');
  });
});
