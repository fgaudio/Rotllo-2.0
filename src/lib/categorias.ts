// El nombre de una categoría en el idioma de la app, a partir de su slug ("bar-y-tardeo").
import type { TFunction } from 'i18next';

import { es } from '@/i18n/es';

type Slug = keyof typeof es.categorias;

export function nombreCategoria(t: TFunction, slug: string): string | null {
  return Object.hasOwn(es.categorias, slug) ? t(`categorias.${slug as Slug}`) : null;
}
