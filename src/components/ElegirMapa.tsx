import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { abrirComoLlegar, appsDeMapas, type AppMapas, type Destino } from '@/lib/mapas';
import { espacio, fuentes, radio, texto, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

import { Boton } from './Boton';

type Props = {
  visible: boolean;
  destino: Destino;
  alCerrar: () => void;
};

// Hoja para elegir con qué app de mapas ir a un sitio (docs/diseno.md): Google Maps o Apple Maps.
// Sale desde abajo al tocar "Cómo llegar" o "Ver en el mapa".
export function ElegirMapa({ visible, destino, alCerrar }: Props) {
  const { t } = useTranslation();
  const s = useEstilos();
  const { c } = useTema();
  const margenes = useSafeAreaInsets();
  const [fallo, setFallo] = useState(false);

  const cerrar = () => {
    setFallo(false);
    alCerrar();
  };

  const abrir = async (app: AppMapas) => {
    if (await abrirComoLlegar(destino, app)) cerrar();
    else setFallo(true);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={cerrar} statusBarTranslucent>
      <Pressable style={s.fondo} onPress={cerrar} accessibilityRole="button" accessibilityLabel={t('mapas.cancelar')} />
      <View style={[s.hoja, { paddingBottom: Math.max(margenes.bottom, espacio[4]) }]} accessibilityViewIsModal>
        <Text style={s.titulo} accessibilityRole="header">
          {t('mapas.abrirEn')}
        </Text>
        {destino.direccion ? <Text style={s.direccion}>{destino.direccion}</Text> : null}
        <View style={s.opciones}>
          {appsDeMapas().map((app) => (
            <Pressable
              key={app}
              accessibilityRole="link"
              accessibilityLabel={t(`mapas.${app}`)}
              accessibilityHint={t('mapas.ayuda')}
              onPress={() => abrir(app)}
              style={({ pressed }) => [s.opcion, pressed && s.pulsada]}>
              <View style={s.icono}>
                <Ionicons name={app === 'apple' ? 'logo-apple' : 'logo-google'} size={20} color={c.texto} />
              </View>
              <Text style={s.nombre}>{t(`mapas.${app}`)}</Text>
              <Ionicons name="open-outline" size={18} color={c.textoTenue} />
            </Pressable>
          ))}
        </View>
        {fallo ? (
          <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {t('mapas.error')}
          </Text>
        ) : null}
        <Boton titulo={t('mapas.cancelar')} variante="texto" onPress={cerrar} />
      </View>
    </Modal>
  );
}

const useEstilos = crearEstilos((c) => ({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  hoja: {
    backgroundColor: c.superficie,
    borderTopLeftRadius: radio.l,
    borderTopRightRadius: radio.l,
    paddingHorizontal: espacio[4],
    paddingTop: espacio[5],
    gap: espacio[2],
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  titulo: { ...texto.seccion, color: c.texto },
  direccion: { ...texto.s, color: c.textoSuave },
  opciones: { gap: espacio[2], marginTop: espacio[3] },
  opcion: { minHeight: zonaTactilMinima + 12, flexDirection: 'row', alignItems: 'center', gap: espacio[3], paddingHorizontal: espacio[3], borderRadius: radio.m, backgroundColor: c.superficie2 },
  pulsada: { opacity: 0.8 },
  icono: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.superficie, alignItems: 'center', justifyContent: 'center' },
  nombre: { flex: 1, fontFamily: fuentes.negrita, fontSize: 17, lineHeight: 22, color: c.texto },
  error: { ...texto.s, color: c.error, marginTop: espacio[2] },
}));
