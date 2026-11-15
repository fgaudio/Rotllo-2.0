import { Link, router } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { obtenerPlanesDeLocal, situacionDe, type PlanLocal, type Situacion } from '@/lib/planesLocal';
import { textosDeFecha } from '@/lib/textosPlan';
import { useCarga } from '@/lib/usePlanes';
import { espacio, fuentes, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { Boton } from './Boton';
import { Cargando } from './Cargando';
import { Cartel } from './Cartel';
import { EtiquetaEstado } from './EtiquetaEstado';

const SIN_PLANES: PlanLocal[] = [];
const TONO: Record<Situacion, 'bien' | 'espera' | 'mal' | 'neutro'> = { publicado: 'bien', borrador: 'espera', cancelado: 'mal', finalizado: 'neutro', terminado: 'neutro' };

// "Tus planes" en el panel del local: el botón para crear uno y la lista, con su estado y los
// clics en "Pillar entrada". `version` cambia cada vez que se vuelve a la pantalla, para recargar.
export function PlanesDelLocal({ localId, version }: { localId: string; version: number }) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` está para volver a cargar al regresar a la pantalla
  const cargar = useCallback(() => obtenerPlanesDeLocal(localId), [localId, version]);
  const { datos: planes, cargando, error, recargar } = useCarga(cargar, SIN_PLANES);
  const ahora = new Date();

  return (
    <View style={s.bloque}>
      <Text style={s.titulo} accessibilityRole="header">
        {t('misPlanes.titulo')}
      </Text>
      <Boton titulo={t('misPlanes.crear')} icono="add" onPress={() => router.push({ pathname: '/local/plan/[id]', params: { id: 'nuevo', local: localId } })} />
      {cargando ? (
        <Cargando etiqueta={t('comun.cargando')} soloFilas />
      ) : error ? (
        <Boton titulo={t('comun.error.boton')} variante="superficie" onPress={recargar} />
      ) : planes.length === 0 ? (
        <Text style={s.vacio}>{t('misPlanes.vacio')}</Text>
      ) : (
        planes.map((plan) => {
          const situacion = situacionDe(plan, ahora);
          const fecha = textosDeFecha(plan, t, i18n.language, ahora);
          return (
            <Link key={plan.id} href={{ pathname: '/local/plan/[id]', params: { id: plan.id } }} asChild>
              <Pressable accessibilityRole="link" accessibilityLabel={`${plan.titulo}. ${t(`misPlanes.situacion.${situacion}`)}. ${fecha.rotulo}`}>
                <View style={s.fila}>
                  <Cartel plan={{ ...plan, fotoUrl: null }} descripcion={t('plan.cartel', { titulo: plan.titulo })} ancho={72} alto={72} />
                  <View style={s.textos}>
                    <Text style={s.nombre} numberOfLines={2}>
                      {plan.titulo}
                    </Text>
                    <Text style={s.meta}>{fecha.rotulo}</Text>
                    <View style={s.abajo}>
                      <EtiquetaEstado texto={t(`misPlanes.situacion.${situacion}`)} tono={TONO[situacion]} />
                      {plan.modoEntradas === 'enlace_externo' ? <Text style={s.meta}>{t('misPlanes.clics', { count: plan.clics })}</Text> : null}
                    </View>
                  </View>
                </View>
              </Pressable>
            </Link>
          );
        })
      )}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  bloque: { gap: espacio[4], marginTop: espacio[6] },
  titulo: { ...texto.seccion, color: c.texto },
  vacio: { ...texto.m, color: c.textoSuave },
  fila: { flexDirection: 'row', alignItems: 'center', gap: espacio[3] },
  textos: { flex: 1, gap: espacio[1] },
  nombre: { fontFamily: fuentes.negrita, fontSize: 17, lineHeight: 21, color: c.texto },
  meta: { ...texto.xs, color: c.textoSuave },
  abajo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espacio[2], marginTop: espacio[1] },
}));
