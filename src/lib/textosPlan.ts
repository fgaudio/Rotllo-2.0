// Los textos de fecha de un plan, ya traducidos: "Hoy · 23:00", "Empieza en 2 h"...
// Los usan todas las tarjetas y la ficha, para que el mismo plan diga lo mismo en todas partes.
import type { TFunction } from 'i18next';

import { diaDe, inminencia } from './agenda';
import { formatearDia, formatearHora } from './formatos';
import type { Plan } from './tipos';

export type TextosFecha = {
  dia: string; // "Hoy", "Mañana" o "vie"
  hora: string; // "23:00"
  rotulo: string; // "Hoy · 23:00"
  aviso: string | null; // "Empieza en 2 h", "Ya ha empezado" o nada
  completa: string; // "miércoles 11 de noviembre"
};

export function textosDeFecha(plan: Pick<Plan, 'empiezaEn' | 'terminaEn'>, t: TFunction, idioma: string, ahora = new Date()): TextosFecha {
  const { dia, cuando } = diaDe(plan, ahora);
  const hora = formatearHora(plan.empiezaEn, idioma);
  const nombreDia = cuando === 'hoy' ? t('cuando.hoy') : cuando === 'manana' ? t('cuando.manana') : formatearDia(dia, idioma, 'corto');
  const pronto = inminencia(plan, ahora);
  let aviso: string | null = null;
  if (pronto?.estado === 'en-curso') aviso = t('cuando.enCurso');
  if (pronto?.estado === 'pronto') {
    const { horas: h, minutos: m } = pronto;
    const tiempo = h === 0 ? t('cuando.minutos', { m }) : m === 0 ? t('cuando.horas', { h }) : t('cuando.horasMinutos', { h, m });
    aviso = t('cuando.empiezaEn', { tiempo });
  }
  return { dia: nombreDia, hora, rotulo: `${nombreDia} · ${hora}`, aviso, completa: formatearDia(dia, idioma, 'largo') };
}
