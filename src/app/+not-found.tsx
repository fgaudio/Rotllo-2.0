import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EstadoVacio } from '@/components/EstadoVacio';
import { crearEstilos } from '@/theme/useTema';

// Cualquier enlace que no exista (por ejemplo, un plan borrado compartido en Instagram).
export default function NoEncontrado() {
  const { t } = useTranslation();
  const s = useEstilos();
  return (
    <View style={s.pantalla}>
      <EstadoVacio
        titulo={t('plan.noExiste.titulo')}
        texto={t('plan.noExiste.texto')}
        boton={{ titulo: t('plan.noExiste.boton'), onPress: () => router.replace('/') }}
      />
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, justifyContent: 'center', backgroundColor: c.fondo },
}));
