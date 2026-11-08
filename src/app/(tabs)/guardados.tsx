import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstadoVacio } from '@/components/EstadoVacio';
import { colores } from '@/theme/tokens';

// Guardados: se llenará con la tabla `favoritos` cuando haya cuentas (Supabase Auth).
export default function GuardadosScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={styles.pantalla}>
      <EstadoVacio
        titulo={t('guardados.vacio.titulo')}
        texto={t('guardados.vacio.texto')}
        boton={{ titulo: t('guardados.vacio.boton'), onPress: () => router.navigate('/') }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, justifyContent: 'center', backgroundColor: colores.fondo },
});
