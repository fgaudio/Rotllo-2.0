import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cargando } from '@/components/Cargando';
import { Chip } from '@/components/Chip';
import { EstadoVacio } from '@/components/EstadoVacio';
import { TarjetaPlan } from '@/components/TarjetaPlan';
import type { Filtro } from '@/lib/filtros';
import { supabaseConfigurado } from '@/lib/supabase';
import { usePlanes } from '@/lib/usePlanes';
import { colores, espacio, texto } from '@/theme/tokens';

const FILTROS: Filtro[] = ['hoy', 'finde', 'gratis'];

// Feed de planes con filtros, de 30 en 30. Lee de Supabase (buscar_planes), o de los datos de
// ejemplo si no hay claves en .env.
export default function FeedScreen() {
  const { t } = useTranslation();
  const [filtro, setFiltro] = useState<Filtro | null>(null);
  const { datos: planes, cargando, error, recargar, cargarMas, cargandoMas } = usePlanes(filtro);

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <FlatList
        data={planes}
        keyExtractor={(plan) => plan.id}
        renderItem={({ item }) => <TarjetaPlan plan={item} />}
        contentContainerStyle={styles.lista}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.5}
        ListFooterComponent={cargandoMas ? <Cargando etiqueta={t('comun.cargando')} /> : undefined}
        ListHeaderComponent={
          <View style={styles.cabecera}>
            <Text style={styles.titulo} accessibilityRole="header">
              {t('feed.titulo')}
            </Text>
            <Text style={styles.subtitulo}>{t('feed.subtitulo')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              accessibilityLabel={t('feed.filtros')}
              contentContainerStyle={styles.filtros}>
              {FILTROS.map((f) => (
                <Chip
                  key={f}
                  etiqueta={t(`feed.filtro.${f}`)}
                  activo={filtro === f}
                  onPress={() => setFiltro(filtro === f ? null : f)}
                />
              ))}
            </ScrollView>
            {supabaseConfigurado ? null : <Text style={styles.aviso}>{t('feed.datosEjemplo')}</Text>}
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
          ) : (
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

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  lista: { padding: espacio[4], gap: espacio[4] },
  cabecera: { gap: espacio[2] },
  titulo: { ...texto.xl, fontWeight: '800', color: colores.tinta },
  subtitulo: { ...texto.m, color: colores.tintaSuave },
  filtros: { gap: espacio[2], paddingVertical: espacio[2] },
  aviso: { ...texto.xs, color: colores.tintaSuave },
});
