import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { IlustracionPlan } from '@/components/IlustracionPlan';
import { Logo } from '@/components/Logo';
import { marcarBienvenidaVista } from '@/lib/bienvenida';
import { borde, espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Cada paso de la bienvenida con su ilustración (la figura sale de la categoría).
const PASOS = [
  { clave: 'uno', categoria: 'fiesta' },
  { clave: 'dos', categoria: 'aire-libre' },
  { clave: 'tres', categoria: 'musica-en-directo' },
] as const;

// Bienvenida: 3 pasos que se ven solo la primera vez que se abre la app. Termina en "Entrar".
export default function BienvenidaScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const [paso, setPaso] = useState(0);
  const actual = PASOS[paso];
  const ultimo = paso === PASOS.length - 1;

  const terminar = () => {
    marcarBienvenidaVista();
    router.replace('/entrar');
  };

  return (
    <SafeAreaView style={s.pantalla}>
      <View style={s.arriba}>
        <Logo tamano={24} />
        {ultimo ? null : <Boton titulo={t('bienvenida.saltar')} variante="texto" onPress={terminar} />}
      </View>

      <ScrollView contentContainerStyle={s.cuerpo}>
        <View style={s.marco}>
          <IlustracionPlan key={actual.clave} categoria={actual.categoria} descripcion="" proporcion={1} />
        </View>
        <Text style={s.titulo} accessibilityRole="header">
          {t(`bienvenida.${actual.clave}.titulo`)}
        </Text>
        <Text style={s.texto}>{t(`bienvenida.${actual.clave}.texto`)}</Text>
      </ScrollView>

      <View style={s.abajo}>
        <View style={s.puntos} accessible accessibilityLabel={t('bienvenida.paso', { actual: paso + 1, total: PASOS.length })}>
          {PASOS.map((p, i) => (
            <View key={p.clave} style={[s.punto, i === paso && s.puntoActivo]} />
          ))}
        </View>
        <Boton
          titulo={ultimo ? t('bienvenida.empezar') : t('bienvenida.siguiente')}
          icono={ultimo ? undefined : 'arrow-forward'}
          onPress={ultimo ? terminar : () => setPaso(paso + 1)}
        />
      </View>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  arriba: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: espacio[4],
  },
  cuerpo: { padding: espacio[4], gap: espacio[4] },
  marco: { borderWidth: borde, borderColor: c.marco, borderRadius: radio.m, overflow: 'hidden' },
  titulo: { ...texto.xl, color: c.texto },
  texto: { ...texto.m, color: c.textoSuave },
  abajo: { padding: espacio[4], gap: espacio[4] },
  puntos: { flexDirection: 'row', justifyContent: 'center', gap: espacio[2] },
  punto: { width: 12, height: 12, borderRadius: radio.s, borderWidth: borde, borderColor: c.marco },
  puntoActivo: { width: 32, backgroundColor: c.indicador, borderColor: c.indicador },
}));
