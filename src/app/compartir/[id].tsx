import { useLocalSearchParams } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { EstadoVacio } from '@/components/EstadoVacio';
import { HistoriaPlan } from '@/components/HistoriaPlan';
import { compartirPlan } from '@/components/TarjetaDestacada';
import { enlacePlan } from '@/lib/enlaces';
import { compartirHistoria, VISTA } from '@/lib/historia';
import { volverOInicio } from '@/lib/navegar';
import { usePlan } from '@/lib/usePlanes';
import { espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Compartir un plan en stories (módulo 7): se ve la imagen tal como va a quedar y se comparte
// con el menú del móvil (o se descarga, en el navegador). El enlace del plan se comparte aparte:
// Instagram solo deja poner enlaces con su "sticker de enlace".
export default function CompartirScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const s = useEstilos();
  const { width } = useWindowDimensions();
  const { datos: plan, cargando, error, recargar } = usePlan(id);
  const vista = useRef<ComponentRef<typeof View>>(null);
  const [trabajando, setTrabajando] = useState(false);
  const [aviso, setAviso] = useState<{ texto: string; mal: boolean } | null>(null);

  if (cargando) {
    return (
      <View style={[s.pantalla, s.margen]}>
        <Cargando etiqueta={t('comun.cargando')} />
      </View>
    );
  }
  if (error || !plan || plan.cancelado) {
    return (
      <View style={s.pantalla}>
        {error ? (
          <EstadoVacio titulo={t('comun.error.titulo')} texto={t('comun.error.texto')} boton={{ titulo: t('comun.error.boton'), onPress: recargar }} />
        ) : (
          <EstadoVacio titulo={t('plan.noExiste.titulo')} texto={t('plan.noExiste.texto')} boton={{ titulo: t('plan.noExiste.boton'), onPress: volverOInicio }} />
        )}
      </View>
    );
  }

  const ancho = Math.min(VISTA.ancho, width - espacio[4] * 2);
  const web = Platform.OS === 'web';

  const imagen = async () => {
    if (trabajando) return;
    setAviso(null);
    setTrabajando(true);
    const resultado = await compartirHistoria(vista, plan.titulo);
    setTrabajando(false);
    if (resultado === 'error') setAviso({ texto: t('compartir.error'), mal: true });
    if (resultado === 'descargada') setAviso({ texto: t('compartir.descargada'), mal: false });
  };

  const enlace = async () => {
    setAviso(null);
    const resultado = await compartirPlan(plan, t('plan.compartirMensaje', { titulo: plan.titulo, url: enlacePlan(plan.id) }));
    if (resultado === 'copiado') setAviso({ texto: t('plan.enlaceCopiado'), mal: false });
  };

  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.cuerpo}>
        <View style={s.cabecera}>
          <Text style={s.titulo} accessibilityRole="header">
            {t('compartir.titulo')}
          </Text>
          <Text style={s.texto}>{t('compartir.texto')}</Text>
        </View>
        <View style={s.marco}>
          <HistoriaPlan plan={plan} ancho={ancho} refVista={vista} />
        </View>
        <Text style={s.consejo}>{t('compartir.consejo')}</Text>
      </ScrollView>
      <View style={s.abajo}>
        {aviso ? (
          <Text style={[s.aviso, aviso.mal && s.avisoMal]} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {aviso.texto}
          </Text>
        ) : null}
        <Boton titulo={web ? t('compartir.descargar') : t('compartir.imagen')} icono={web ? 'download-outline' : 'logo-instagram'} cargando={trabajando} onPress={imagen} />
        <Boton titulo={t('compartir.enlace')} icono="link-outline" variante="superficie" desactivado={trabajando} onPress={enlace} />
      </View>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  margen: { padding: espacio[4] },
  cuerpo: { paddingHorizontal: espacio[4], paddingTop: espacio[2], paddingBottom: espacio[6], gap: espacio[5], alignItems: 'center' },
  cabecera: { gap: espacio[2], alignSelf: 'stretch', maxWidth: 560 },
  titulo: { ...texto.titulo, color: c.texto },
  texto: { ...texto.m, color: c.textoSuave },
  // El marco solo es para que la imagen (que es oscura) se distinga del fondo de la pantalla.
  marco: { borderRadius: radio.m, overflow: 'hidden', borderWidth: 1, borderColor: c.linea },
  consejo: { ...texto.s, color: c.textoSuave, alignSelf: 'stretch', maxWidth: 560 },
  abajo: { paddingHorizontal: espacio[4], paddingTop: espacio[3], paddingBottom: espacio[3], gap: espacio[2], borderTopWidth: 1, borderTopColor: c.linea, width: '100%', maxWidth: 560, alignSelf: 'center' },
  aviso: { ...texto.s, color: c.texto, textAlign: 'center' },
  avisoMal: { color: c.error },
}));
