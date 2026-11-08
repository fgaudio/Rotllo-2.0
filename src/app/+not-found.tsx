import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { EstadoVacio } from '@/components/EstadoVacio';
import { colores } from '@/theme/tokens';

// Cualquier enlace que no exista (por ejemplo, un plan borrado compartido en Instagram).
export default function NoEncontrado() {
  const { t } = useTranslation();
  return (
    <View style={styles.pantalla}>
      <EstadoVacio
        titulo={t('plan.noExiste.titulo')}
        texto={t('plan.noExiste.texto')}
        boton={{ titulo: t('plan.noExiste.boton'), onPress: () => router.replace('/') }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, justifyContent: 'center', backgroundColor: colores.fondo },
});
