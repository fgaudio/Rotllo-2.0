import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraBusqueda } from '@/components/BarraBusqueda';
import { BotonRedondo } from '@/components/BotonRedondo';
import { Cargando } from '@/components/Cargando';
import { EstadoVacio } from '@/components/EstadoVacio';
import { FilaPlan } from '@/components/FilaPlan';
import { buscarEnPlanes } from '@/lib/busqueda';
import { usePlanes } from '@/lib/usePlanes';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Búsqueda: se llega con la lupa del feed. Sin tildes ni mayúsculas, por título, local y barrio.
// De momento busca entre los planes cargados; en el módulo de planes pasará a la base de datos.
export default function BuscarScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const [consulta, setConsulta] = useState('');
  const { datos, cargando } = usePlanes(null);
  const buscando = consulta.trim() !== '';
  const encontrados = buscarEnPlanes(datos, consulta);

  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <View style={s.arriba}>
        <BotonRedondo icono="chevron-back" etiqueta={t('comun.volver')} variante="plano" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <BarraBusqueda valor={consulta} onCambio={setConsulta} autoFoco />
      </View>
      <FlatList
        data={encontrados}
        keyExtractor={(plan) => plan.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={s.lista}
        renderItem={({ item }) => <FilaPlan plan={item} conDia />}
        ListHeaderComponent={buscando || cargando ? undefined : <Text style={s.pista}>{t('buscar.pista')}</Text>}
        ListEmptyComponent={
          cargando ? (
            <Cargando etiqueta={t('comun.cargando')} soloFilas />
          ) : buscando ? (
            <EstadoVacio
              titulo={t('buscar.sinResultados.titulo')}
              texto={t('buscar.sinResultados.texto', { consulta: consulta.trim() })}
              boton={{ titulo: t('buscar.sinResultados.boton'), onPress: () => setConsulta('') }}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  arriba: { width: '100%', maxWidth: 560, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: espacio[1], paddingLeft: espacio[2], paddingRight: espacio[4], paddingVertical: espacio[2] },
  lista: { paddingHorizontal: espacio[4], paddingTop: espacio[3], paddingBottom: espacio[10], gap: espacio[5], width: '100%', maxWidth: 560, alignSelf: 'center' },
  pista: { ...texto.s, color: c.textoSuave },
}));
