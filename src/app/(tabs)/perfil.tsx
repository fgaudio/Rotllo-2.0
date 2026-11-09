import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { idiomasDisponibles } from '@/i18n';
import { espacio, fuentes, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Perfil: de momento, cambio de idioma. El login llegará con Supabase Auth (módulo 1).
export default function PerfilScreen() {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  return (
    <SafeAreaView style={s.pantalla}>
      <View style={s.bloque}>
        <Text style={s.titulo} accessibilityRole="header">
          {t('perfil.entrar.titulo')}
        </Text>
        <Text style={s.texto}>{t('perfil.entrar.texto')}</Text>
      </View>
      <View style={s.bloque}>
        <Text style={s.subtitulo}>{t('perfil.idioma')}</Text>
        <View style={s.idiomas}>
          {idiomasDisponibles.map((idioma) => (
            <Chip key={idioma} etiqueta={t(`idiomas.${idioma}`)} activo={i18n.language === idioma} onPress={() => i18n.changeLanguage(idioma)} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo, padding: espacio[4], gap: espacio[8] },
  bloque: { gap: espacio[2] },
  titulo: { ...texto.xl, color: c.texto },
  texto: { ...texto.m, color: c.textoSuave },
  subtitulo: { ...texto.m, fontFamily: fuentes.negrita, color: c.texto },
  idiomas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[2] },
}));
