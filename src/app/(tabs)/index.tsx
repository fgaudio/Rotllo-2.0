import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cargando } from '@/components/Cargando';
import { Chip } from '@/components/Chip';
import { DestacadoSerie } from '@/components/DestacadoSerie';
import { EstadoVacio } from '@/components/EstadoVacio';
import { Logo } from '@/components/Logo';
import { TarjetaPlan } from '@/components/TarjetaPlan';
import { ventanas, type Filtro } from '@/lib/filtros';
import { supabaseConfigurado } from '@/lib/supabase';
import { usePlanes } from '@/lib/usePlanes';
import { espacio, fuentes, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

const FILTROS: Filtro[] = ['hoy', 'finde', 'gratis'];

// Feed de planes con filtros, de 30 en 30. Lee de Supabase (buscar_planes), o de los datos de
// ejemplo si no hay claves en .env. Sin filtro, el primer plan sale como destacado en serie.
export default function FeedScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const [filtro, setFiltro] = useState<Filtro | null>(null);
  const { datos, cargando, error, recargar, cargarMas, cargandoMas } = usePlanes(filtro);

  const destacado = filtro === null ? datos[0] : undefined;
  const lista = destacado ? datos.slice(1) : datos;
  const rotulo =
    destacado && Date.parse(destacado.empiezaEn) < ventanas(new Date()).hoyFin.getTime()
      ? t('feed.destacado.hoy')
      : t('feed.destacado.proximo');

  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <FlatList
        data={lista}
        keyExtractor={(plan) => plan.id}
        renderItem={({ item }) => <TarjetaPlan plan={item} />}
        contentContainerStyle={s.lista}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.5}
        ListFooterComponent={cargandoMas ? <Cargando etiqueta={t('comun.cargando')} /> : undefined}
        ListHeaderComponent={
          <View style={s.cabecera}>
            <View style={s.filaLogo}>
              <Logo />
              <Text style={s.pregunta}>{t('feed.titulo')}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              accessibilityLabel={t('feed.filtros')}
              contentContainerStyle={s.filtros}>
              {FILTROS.map((f) => (
                <Chip key={f} etiqueta={t(`feed.filtro.${f}`)} activo={filtro === f} onPress={() => setFiltro(filtro === f ? null : f)} />
              ))}
            </ScrollView>
            {supabaseConfigurado ? null : <Text style={s.aviso}>{t('feed.datosEjemplo')}</Text>}
            {destacado ? <DestacadoSerie plan={destacado} rotulo={rotulo} /> : null}
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <Cargando etiqueta={t('comun.cargando')} />
          ) : error ? (
            <EstadoVacio
              titulo={t('comun.error.titulo')}
              texto={t('comun.error.texto')}
              boton={{ titulo: t('comun.error.boton'), onPress: recargar }}
            />
          ) : destacado ? undefined : (
            <EstadoVacio
              titulo={t('feed.vacio.titulo')}
              texto={t('feed.vacio.texto')}
              boton={{ titulo: t('feed.vacio.boton'), onPress: () => setFiltro(null) }}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  lista: { padding: espacio[4], gap: espacio[3] },
  cabecera: { gap: espacio[3] },
  filaLogo: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingTop: espacio[2] },
  pregunta: { fontFamily: fuentes.negrita, fontSize: 17, color: c.texto },
  filtros: { gap: espacio[2] },
  aviso: { ...texto.xs, color: c.textoSuave },
}));
