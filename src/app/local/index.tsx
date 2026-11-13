import { Redirect, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cargando } from '@/components/Cargando';
import { EstadoVacio } from '@/components/EstadoVacio';
import { EtiquetaEstado } from '@/components/EtiquetaEstado';
import { obtenerMisLocales, type EstadoLocal, type Local } from '@/lib/locales';
import { siguientePaso, useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/usePlanes';
import { espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

const SIN_LOCALES: Local[] = [];
const TONO_ESTADO: Record<EstadoLocal, 'bien' | 'espera' | 'mal'> = { verificado: 'bien', pendiente: 'espera', rechazado: 'mal', suspendido: 'mal' };

// Mi local: cómo va la revisión y (en la siguiente ronda) los planes del local.
export default function MiLocalScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const paso = siguientePaso(useSesion());
  const { datos: locales, cargando, error, recargar } = useCarga(obtenerMisLocales, SIN_LOCALES);

  if (paso === 'entrar' || paso === 'fecha-nacimiento') return <Redirect href="/local/nuevo" />;

  if (cargando || paso === 'esperar') {
    return (
      <View style={[s.pantalla, s.margen]}>
        <Cargando etiqueta={t('comun.cargando')} soloFilas />
      </View>
    );
  }
  if (error) {
    return (
      <View style={s.pantalla}>
        <EstadoVacio titulo={t('comun.error.titulo')} texto={t('local.alta.errores.red')} boton={{ titulo: t('comun.error.boton'), onPress: recargar }} />
      </View>
    );
  }
  if (locales.length === 0) {
    return (
      <View style={s.pantalla}>
        <EstadoVacio titulo={t('local.tengo.titulo')} texto={t('local.tengo.texto')} boton={{ titulo: t('local.tengo.boton'), onPress: () => router.replace('/local/nuevo') }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.cuerpo}>
        {locales.map((local) => (
          <View key={local.id} style={s.local}>
            <Text style={s.rotulo}>{t('local.miLocal')}</Text>
            <Text style={s.titulo} accessibilityRole="header">
              {local.nombre}
            </Text>
            <Text style={s.datos}>
              {[t(`local.tipo.${local.tipo}`), local.direccion, local.barrio].filter(Boolean).join(' · ')}
            </Text>
            <View style={s.tarjeta}>
              <EtiquetaEstado texto={t(`local.estado.${local.estado}`)} tono={TONO_ESTADO[local.estado]} />
              <Text style={s.texto}>{t(`local.estadoTexto.${local.estado}`)}</Text>
              {local.estado === 'rechazado' && local.motivoRechazo ? <Text style={s.texto}>{t('local.motivo', { motivo: local.motivoRechazo })}</Text> : null}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  margen: { padding: espacio[4] },
  cuerpo: { paddingHorizontal: espacio[4], paddingTop: espacio[2], paddingBottom: espacio[10], gap: espacio[10], width: '100%', maxWidth: 560, alignSelf: 'center' },
  local: { gap: espacio[2] },
  rotulo: { ...texto.rotulo, color: c.textoSuave },
  titulo: { ...texto.titulo, color: c.texto },
  datos: { ...texto.s, color: c.textoSuave },
  tarjeta: { backgroundColor: c.superficie, borderRadius: radio.l, padding: espacio[5], gap: espacio[3], marginTop: espacio[3] },
  texto: { ...texto.m, color: c.texto },
}));
