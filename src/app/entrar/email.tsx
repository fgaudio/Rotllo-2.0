import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvisoPrueba } from '@/components/AvisoPrueba';
import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Comprobación básica para avisar de erratas; el email de verdad lo valida Supabase Auth.
const PARECE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Entrar con email: se manda un código de 6 cifras (sin contraseñas) y se escribe aquí.
// El envío llega con el módulo 1; de momento el paso del código se puede recorrer sin enviar nada.
export default function EmailScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = () => {
    if (!PARECE_EMAIL.test(email.trim())) return setError(t('entrar.correo.error'));
    setError(null);
    setEnviado(true);
  };

  const entrar = () => {
    if (!/^\d{6}$/.test(codigo)) return setError(t('entrar.codigo.error'));
    setError(null);
    router.push('/entrar/edad');
  };

  const cambiarEmail = () => {
    setEnviado(false);
    setCodigo('');
    setError(null);
  };

  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <KeyboardAvoidingView style={s.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.cuerpo} keyboardShouldPersistTaps="handled">
          <AvisoPrueba texto={t('entrar.prueba')} />
          {enviado ? (
            <>
              <View style={s.cabecera}>
                <Text style={s.titulo} accessibilityRole="header">
                  {t('entrar.codigo.titulo')}
                </Text>
                <Text style={s.texto}>{t('entrar.codigo.texto', { email: email.trim() })}</Text>
              </View>
              <CampoTexto
                key="codigo"
                etiqueta={t('entrar.codigo.etiqueta')}
                valor={codigo}
                onCambio={(v) => setCodigo(v.replace(/\D/g, ''))}
                error={error}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                onSubmitEditing={entrar}
              />
            </>
          ) : (
            <>
              <View style={s.cabecera}>
                <Text style={s.titulo} accessibilityRole="header">
                  {t('entrar.correo.titulo')}
                </Text>
                <Text style={s.texto}>{t('entrar.correo.texto')}</Text>
              </View>
              <CampoTexto
                key="email"
                etiqueta={t('entrar.correo.etiqueta')}
                valor={email}
                onCambio={setEmail}
                error={error}
                placeholder={t('entrar.correo.placeholder')}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                onSubmitEditing={enviar}
              />
            </>
          )}
        </ScrollView>
        <View style={s.abajo}>
          {enviado ? (
            <>
              <Boton titulo={t('entrar.codigo.entrar')} onPress={entrar} />
              <Boton titulo={t('entrar.codigo.cambiar')} variante="texto" onPress={cambiarEmail} />
            </>
          ) : (
            <Boton titulo={t('entrar.correo.enviar')} onPress={enviar} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  cuerpo: { padding: espacio[4], gap: espacio[6] },
  cabecera: { gap: espacio[2] },
  titulo: { ...texto.xl, color: c.texto },
  texto: { ...texto.m, color: c.textoSuave },
  abajo: { padding: espacio[4], gap: espacio[2] },
}));
