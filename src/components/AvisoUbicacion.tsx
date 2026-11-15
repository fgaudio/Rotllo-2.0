import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Platform, Text, View } from 'react-native';

import { abrirAjustes, activarCerca, sePuedenAbrirAjustes, type Ubicacion } from '@/lib/ubicacion';
import { espacio, fuentes, radio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

import { Boton } from './Boton';

// Lo que se enseña debajo de los filtros según cómo va «Cerca de mí»:
//   · puesto: una línea que dice cómo se ordena y que la ubicación no se guarda
//   · sin permiso o sin señal: qué pasa y qué hacer ahora
// Con «Cerca de mí» quitado o buscando, no enseña nada.
export function AvisoUbicacion({ ubicacion }: { ubicacion: Ubicacion }) {
  const { t } = useTranslation();
  const s = useEstilos();
  const { c } = useTema();

  if (ubicacion.estado === 'lista') return <Text style={s.nota}>{t('cerca.nota')}</Text>;
  if (ubicacion.estado !== 'denegada' && ubicacion.estado !== 'fallo') return null;

  const denegada = ubicacion.estado === 'denegada';
  return (
    <View style={s.caja} accessibilityRole="alert">
      <View style={s.cabecera}>
        <Ionicons name="navigate-circle-outline" size={22} color={c.texto} />
        <Text style={s.titulo}>{t(denegada ? 'cerca.denegada.titulo' : 'cerca.fallo.titulo')}</Text>
      </View>
      <Text style={s.texto}>{t(denegada ? (Platform.OS === 'web' ? 'cerca.denegada.textoWeb' : 'cerca.denegada.texto') : 'cerca.fallo.texto')}</Text>
      <View style={s.botones}>
        {denegada && sePuedenAbrirAjustes ? <Boton titulo={t('cerca.denegada.ajustes')} variante="superficie" compacto onPress={abrirAjustes} /> : null}
        <Boton titulo={t('cerca.reintentar')} variante="superficie" compacto onPress={() => void activarCerca()} />
      </View>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  nota: { ...texto.xs, color: c.textoTenue, paddingHorizontal: espacio[4], paddingTop: espacio[3] },
  caja: { marginHorizontal: espacio[4], marginTop: espacio[3], padding: espacio[4], gap: espacio[2], borderRadius: radio.l, backgroundColor: c.superficie },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: espacio[2] },
  titulo: { fontFamily: fuentes.negrita, fontSize: 16, lineHeight: 21, color: c.texto, flex: 1 },
  texto: { ...texto.s, color: c.textoSuave },
  botones: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[2], marginTop: espacio[1] },
}));
