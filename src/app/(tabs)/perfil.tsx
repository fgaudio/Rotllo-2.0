import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { idiomasDisponibles } from '@/i18n';
import { colores, espacio, texto } from '@/theme/tokens';

// Perfil: de momento, cambio de idioma. El login llegará con Supabase Auth.
export default function PerfilScreen() {
  const { t, i18n } = useTranslation();
  return (
    <SafeAreaView style={styles.pantalla}>
      <View style={styles.bloque}>
        <Text style={styles.titulo} accessibilityRole="header">
          {t('perfil.entrar.titulo')}
        </Text>
        <Text style={styles.texto}>{t('perfil.entrar.texto')}</Text>
      </View>
      <View style={styles.bloque}>
        <Text style={styles.subtitulo}>{t('perfil.idioma')}</Text>
        <View style={styles.idiomas}>
          {idiomasDisponibles.map((idioma) => (
            <Chip
              key={idioma}
              etiqueta={t(`idiomas.${idioma}`)}
              activo={i18n.language === idioma}
              onPress={() => i18n.changeLanguage(idioma)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo, padding: espacio[4], gap: espacio[8] },
  bloque: { gap: espacio[2] },
  titulo: { ...texto.xl, fontWeight: '800', color: colores.tinta },
  texto: { ...texto.m, color: colores.tintaSuave },
  subtitulo: { ...texto.m, fontWeight: '700', color: colores.tinta },
  idiomas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[2] },
});
