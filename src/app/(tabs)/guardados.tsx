import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstadoVacio } from '@/components/EstadoVacio';
import { crearEstilos } from '@/theme/useTema';

// Guardados: se llenará con la tabla `favoritos` cuando haya cuentas (Supabase Auth).
export default function GuardadosScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  return (
    <SafeAreaView style={s.pantalla}>
      <EstadoVacio
        titulo={t('guardados.vacio.titulo')}
        texto={t('guardados.vacio.texto')}
        boton={{ titulo: t('guardados.vacio.boton'), onPress: () => router.navigate('/') }}
      />
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, justifyContent: 'center', backgroundColor: c.fondo },
}));
