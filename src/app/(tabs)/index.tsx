import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BotonRedondo } from '@/components/BotonRedondo';
import { Cargando } from '@/components/Cargando';
import { Chip } from '@/components/Chip';
import { EstadoVacio } from '@/components/EstadoVacio';
import { FilaPlan } from '@/components/FilaPlan';
import { Marca } from '@/components/Marca';
import { TarjetaDestacada } from '@/components/TarjetaDestacada';
import { TarjetaMini } from '@/components/TarjetaMini';
import { agruparPorDia, momentoDelDia, type GrupoDia } from '@/lib/agenda';
import type { Filtro } from '@/lib/filtros';
import { formatearDia, formatearHoy } from '@/lib/formatos';
import { supabaseConfigurado } from '@/lib/supabase';
import type { Plan } from '@/lib/tipos';
import { usePlanes } from '@/lib/usePlanes';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

const FILTROS: (Filtro | null)[] = [null, 'hoy', 'finde', 'gratis'];

// Cada línea de la agenda: el encabezado de un día o un plan.
type Linea = { tipo: 'dia'; clave: string; titulo: string } | { tipo: 'plan'; clave: string; plan: Plan };

// Feed (docs/diseno.md). Es lo primero que se ve al abrir la app, sin registro.
//   · Sin filtro: el primer plan va destacado, el resto de hoy en un carrusel y lo demás en agenda.
//   · Con filtro: todo en agenda, agrupado por días.
// Lee de Supabase (buscar_planes), de 30 en 30, o de los datos de ejemplo si no hay claves en .env.
export default function FeedScreen() {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const [filtro, setFiltro] = useState<Filtro | null>(null);
  const { datos, cargando, error, recargar, cargarMas, cargandoMas } = usePlanes(filtro);
  const ahora = new Date();
  const idioma = i18n.language;

  const grupos = agruparPorDia(datos, ahora);
  const destacado = filtro === null ? datos[0] : undefined;
  // El carrusel "Hoy también" solo sale si hay al menos dos planes más hoy; uno solo va a la agenda.
  const restoDeHoy = destacado && grupos[0]?.cuando === 'hoy' ? grupos[0].planes.filter((plan) => plan.id !== destacado.id) : [];
  const hoyTambien = restoDeHoy.length >= 2 ? restoDeHoy : [];
  const yaArriba = new Set([destacado?.id, ...hoyTambien.map((plan) => plan.id)]);

  const nombreDia = (grupo: GrupoDia<Plan>) =>
    grupo.cuando === 'hoy' ? t('cuando.hoy') : grupo.cuando === 'manana' ? t('cuando.manana') : formatearDia(grupo.dia, idioma, 'agenda');

  const lineas: Linea[] = [];
  for (const grupo of grupos) {
    const planes = grupo.planes.filter((plan) => !yaArriba.has(plan.id));
    if (planes.length === 0) continue;
    lineas.push({ tipo: 'dia', clave: `dia-${grupo.clave}`, titulo: nombreDia(grupo) });
    for (const plan of planes) lineas.push({ tipo: 'plan', clave: plan.id, plan });
  }

  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <FlatList
        data={lineas}
        keyExtractor={(linea) => linea.clave}
        renderItem={({ item }) =>
          item.tipo === 'dia' ? (
            <View style={s.dia}>
              <Text style={s.diaTexto} accessibilityRole="header">
                {item.titulo}
              </Text>
              <View style={s.diaLinea} />
            </View>
          ) : (
            <View style={s.fila}>
              <FilaPlan plan={item.plan} />
            </View>
          )
        }
        contentContainerStyle={s.lista}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.5}
        refreshing={false}
        onRefresh={recargar}
        ListFooterComponent={
          cargandoMas ? (
            <View style={s.margen}>
              <Cargando etiqueta={t('comun.cargando')} soloFilas />
            </View>
          ) : undefined
        }
        ListHeaderComponent={
          <View>
            <View style={s.cabecera}>
              <Marca />
              <BotonRedondo icono="search" etiqueta={t('buscar.abrir')} onPress={() => router.push('/buscar')} />
            </View>
            <View style={s.titular}>
              <Text style={s.fecha}>
                {formatearHoy(ahora, idioma)} · {t('comun.ciudad')}
              </Text>
              <Text style={s.pregunta} accessibilityRole="header">
                {t('feed.pregunta')}
                {'\n'}
                <Text style={s.momento}>{t(`feed.momento.${filtro === 'finde' || filtro === 'gratis' ? filtro : momentoDelDia(ahora)}`)}</Text>
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel={t('feed.filtros')} contentContainerStyle={s.filtros}>
              {FILTROS.map((f) => (
                <Chip key={f ?? 'todo'} etiqueta={t(`feed.filtro.${f ?? 'todo'}`)} activo={filtro === f} onPress={() => setFiltro(f)} />
              ))}
            </ScrollView>
            {supabaseConfigurado ? null : <Text style={s.aviso}>{t('feed.datosEjemplo')}</Text>}
            {destacado ? (
              <View style={s.destacado}>
                <TarjetaDestacada plan={destacado} />
              </View>
            ) : null}
            {hoyTambien.length > 0 ? (
              <>
                <Text style={s.seccion} accessibilityRole="header">
                  {t('feed.hoyTambien')}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carril}>
                  {hoyTambien.map((plan) => (
                    <TarjetaMini key={plan.id} plan={plan} />
                  ))}
                </ScrollView>
              </>
            ) : null}
            {destacado && lineas.length > 0 ? (
              <Text style={s.seccion} accessibilityRole="header">
                {t('feed.loQueViene')}
              </Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <View style={s.margen}>
              <Cargando etiqueta={t('comun.cargando')} />
            </View>
          ) : error ? (
            <EstadoVacio
              titulo={t('comun.error.titulo')}
              texto={t('comun.error.texto')}
              boton={{ titulo: t('comun.error.boton'), onPress: recargar }}
            />
          ) : destacado ? undefined : filtro === null ? (
            <EstadoVacio
              titulo={t('feed.sinPlanes.titulo')}
              texto={t('feed.sinPlanes.texto')}
              boton={{ titulo: t('feed.sinPlanes.boton'), onPress: recargar }}
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

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  lista: { paddingBottom: espacio[10], width: '100%', maxWidth: 560, alignSelf: 'center' },
  margen: { paddingHorizontal: espacio[4], paddingTop: espacio[4] },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: espacio[4], paddingTop: espacio[1] + 2 },
  titular: { paddingHorizontal: espacio[4], paddingTop: espacio[4] - 2, paddingBottom: espacio[4], gap: espacio[2] },
  fecha: { ...texto.rotulo, color: c.textoSuave },
  pregunta: { ...texto.titular, color: c.texto },
  momento: { color: c.rotulo },
  filtros: { gap: espacio[2], paddingHorizontal: espacio[4] },
  aviso: { ...texto.xs, color: c.textoTenue, paddingHorizontal: espacio[4], paddingTop: espacio[3] },
  destacado: { paddingHorizontal: espacio[4], paddingTop: espacio[4] },
  seccion: { ...texto.seccion, color: c.texto, paddingHorizontal: espacio[4], paddingTop: espacio[10], paddingBottom: espacio[1] },
  carril: { gap: espacio[3], paddingHorizontal: espacio[4], paddingTop: espacio[3] },
  dia: { flexDirection: 'row', alignItems: 'center', gap: espacio[3], paddingHorizontal: espacio[4], paddingTop: espacio[4] },
  diaTexto: { ...texto.dia, color: c.textoSuave },
  diaLinea: { flex: 1, height: 1, backgroundColor: c.linea },
  fila: { paddingHorizontal: espacio[4], paddingVertical: espacio[3] + 2 },
}));
