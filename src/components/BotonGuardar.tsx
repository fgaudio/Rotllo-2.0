import { useTranslation } from 'react-i18next';

import { alternarGuardado, useEstaGuardado } from '@/lib/guardados';
import { useTema } from '@/theme/useTema';

import { BotonRedondo } from './BotonRedondo';

type Props = { planId: string; variante?: 'superficie' | 'superficie2' | 'cristal' | 'plano' };

// El corazón: guarda el plan en el móvil (sin cuenta) o lo quita. Se ve lleno si está guardado.
export function BotonGuardar({ planId, variante = 'superficie2' }: Props) {
  const { t } = useTranslation();
  const { c } = useTema();
  const guardado = useEstaGuardado(planId);
  return (
    <BotonRedondo
      icono={guardado ? 'heart' : 'heart-outline'}
      etiqueta={guardado ? t('plan.quitar') : t('plan.guardar')}
      seleccionado={guardado}
      variante={variante}
      color={guardado ? c.vivo : variante === 'plano' ? c.textoSuave : undefined}
      onPress={() => alternarGuardado(planId)}
    />
  );
}
