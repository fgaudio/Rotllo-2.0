// Búsqueda de texto en el feed: por título, local y barrio, sin importar tildes ni mayúsculas
// ("musica" encuentra "Música", "russafa" encuentra "Russafa").
// De momento busca entre los planes ya cargados; en el módulo de planes pasará a la base de datos.
import type { Plan } from './tipos';

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñç]+/g, ' ')
    .trim();
}

export function buscarEnPlanes(planes: Plan[], consulta: string): Plan[] {
  const palabras = normalizar(consulta).split(' ').filter(Boolean);
  if (palabras.length === 0) return planes;
  return planes.filter((plan) => {
    const donde = normalizar(`${plan.titulo} ${plan.local} ${plan.barrio}`);
    return palabras.every((palabra) => donde.includes(palabra));
  });
}
