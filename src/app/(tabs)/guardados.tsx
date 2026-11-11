import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cargando } from '@/components/Cargando';
import { EstadoVacio } from '@/components/EstadoVacio';
import { FilaPlan } from '@/components/FilaPlan';
import { usePlanesGuardados } from '@/lib/usePlanesGuardados';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Guardados: los planes con el corazón marcado. Se guardan en el móvil, sin cuenta.
export default function GuardadosScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const { planes, cargando } = usePlanesGuardados();
  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <FlatList
        data={planes}
        keyExtractor={(plan) => plan.id}
        contentContainerStyle={s.lista}
        renderItem={({ item }) => <FilaPlan plan={item} conDia />}
        ListHeaderComponent={
          <Text style={s.titulo} accessibilityRole="header">
            {t('guardados.titulo')}
          </Text>
        }
        ListEmptyComponent={
          cargando ? (
            <Cargando etiqueta={t('comun.cargando')} soloFilas />
          ) : (
            <EstadoVacio
              titulo={t('guardados.vacio.titulo')}
              texto={t('guardados.vacio.texto')}
              boton={{ titulo: t('guardados.vacio.boton'), onPress: () => router.navigate('/') }}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  lista: { paddingHorizontal: espacio[4], paddingTop: espacio[4], paddingBottom: espacio[10], gap: espacio[5], width: '100%', maxWidth: 560, alignSelf: 'center' },
  titulo: { ...texto.titulo, color: c.texto },
}));
