import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { Chip } from '@/components/Chip';
import { idiomasDisponibles } from '@/i18n';
import { espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Perfil: entrar y cambio de idioma. El login de verdad llega con Supabase Auth (módulo 1).
export default function PerfilScreen() {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={s.contenido}>
        <Text style={s.titulo} accessibilityRole="header">
          {t('perfil.titulo')}
        </Text>
        <View style={s.tarjeta}>
          <Text style={s.tarjetaTitulo} accessibilityRole="header">
            {t('perfil.entrar.titulo')}
          </Text>
          <Text style={s.tarjetaTexto}>{t('perfil.entrar.texto')}</Text>
          <Boton titulo={t('perfil.entrar.boton')} onPress={() => router.push('/entrar')} />
        </View>
        <View style={s.bloque}>
          <Text style={s.rotulo}>{t('perfil.idioma')}</Text>
          <View style={s.idiomas}>
            {idiomasDisponibles.map((idioma) => (
              <Chip key={idioma} etiqueta={t(`idiomas.${idioma}`)} activo={i18n.language === idioma} onPress={() => i18n.changeLanguage(idioma)} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  contenido: { paddingHorizontal: espacio[4], paddingTop: espacio[4], paddingBottom: espacio[10], gap: espacio[6], width: '100%', maxWidth: 560, alignSelf: 'center' },
  titulo: { ...texto.titulo, color: c.texto },
  tarjeta: { backgroundColor: c.superficie, borderRadius: radio.l, padding: espacio[5], gap: espacio[3] },
  tarjetaTitulo: { ...texto.seccion, color: c.texto },
  tarjetaTexto: { ...texto.m, color: c.textoSuave, marginBottom: espacio[2] },
  bloque: { gap: espacio[3] },
  rotulo: { ...texto.rotulo, color: c.textoSuave },
  idiomas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[2] },
}));
