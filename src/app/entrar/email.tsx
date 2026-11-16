import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { enviarEnlace, esEmailValido, ESPERA_REENVIO_S, limpiarEmail, type ErrorAuth } from '@/lib/auth';
import { siguientePaso, useSesion } from '@/lib/sesion';
import { espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

// Entrar con email: se manda un enlace al correo (sin contraseñas ni códigos). Al tocarlo, se abre
// la pantalla /entrar/enlace, que inicia la sesión. Si el email es nuevo, la cuenta se crea sola.
// Esta pantalla se queda esperando: si la sesión llega mientras está abierta, sigue con la fecha
// de nacimiento (la primera vez) o vuelve al perfil.
export default function EmailScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const { c } = useTema();
  const paso = siguientePaso(useSesion());
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(0); // segundos hasta poder pedir otro enlace
  const [ultimoEnvio, setUltimoEnvio] = useState<string | null>(null); // a qué email se mandó el último enlace

  // Cuenta atrás para "Enviar otro enlace".
  useEffect(() => {
    if (espera <= 0) return;
    const reloj = setTimeout(() => setEspera((segundos) => segundos - 1), 1000);
    return () => clearTimeout(reloj);
  }, [espera]);

  const explicar = (motivo: ErrorAuth) =>
    motivo === 'sin-servicio' ? t('entrar.sinServicio') : motivo === 'menor' || motivo === 'local' || motivo === 'otro-dispositivo' ? t('entrar.errores.red') : t(`entrar.errores.${motivo}`);

  const enviar = async () => {
    if (cargando) return;
    if (!esEmailValido(email)) return setError(t('entrar.errores.email'));
    setError(null);
    setCargando(true);
    const resultado = await enviarEnlace(email);
    setCargando(false);
    // "Espera" justo después de mandar un enlace a este mismo email: el enlace ya está en el
    // correo, así que se enseña «Mira tu correo» en vez de un error.
    const yaEnviado = !resultado.ok && resultado.error === 'espera' && ultimoEnvio === limpiarEmail(email);
    if (!resultado.ok && !yaEnviado) return setError(explicar(resultado.error));
    setEnviado(true);
    if (resultado.ok) {
      setUltimoEnvio(limpiarEmail(email));
      setEspera(ESPERA_REENVIO_S);
    }
  };

  const cambiarEmail = () => {
    setEnviado(false);
    setError(null);
  };

  if (paso === 'fecha-nacimiento') return <Redirect href="/entrar/edad" />;
  if (paso === 'listo') return <Redirect href="/perfil" />;

  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <KeyboardAvoidingView style={s.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.cuerpo} keyboardShouldPersistTaps="handled">
          {enviado ? (
            <>
              <View style={s.sobre}>
                <Ionicons name="mail-unread-outline" size={32} color={c.texto} />
              </View>
              <View style={s.cabecera}>
                <Text style={s.titulo} accessibilityRole="header">
                  {t('entrar.enlace.titulo')}
                </Text>
                <Text style={s.texto}>{t('entrar.enlace.texto', { email: limpiarEmail(email) })}</Text>
                <Text style={s.texto}>{t('entrar.enlace.pasos')}</Text>
              </View>
              {error ? (
                <Text style={s.error} accessibilityRole="alert">
                  {error}
                </Text>
              ) : (
                <Text style={s.nota}>{t('entrar.enlace.noLlega')}</Text>
              )}
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
                onCambio={(valor) => {
                  setEmail(valor);
                  setError(null);
                }}
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
              {espera > 0 ? (
                <Text style={s.espera}>{t('entrar.enlace.reenviarEn', { segundos: espera })}</Text>
              ) : (
                <Boton titulo={t('entrar.enlace.reenviar')} variante="superficie" cargando={cargando} onPress={enviar} />
              )}
              <Boton titulo={t('entrar.enlace.cambiar')} variante="texto" desactivado={cargando} onPress={cambiarEmail} />
            </>
          ) : (
            <Boton titulo={t('entrar.correo.enviar')} cargando={cargando} onPress={enviar} />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  cuerpo: { paddingHorizontal: espacio[4], paddingTop: espacio[2], paddingBottom: espacio[4], gap: espacio[6], width: '100%', maxWidth: 560, alignSelf: 'center' },
  cabecera: { gap: espacio[2] },
  titulo: { ...texto.titulo, color: c.texto },
  texto: { ...texto.m, color: c.textoSuave },
  sobre: { width: 72, height: 72, borderRadius: radio.pildora, backgroundColor: c.superficie, alignItems: 'center', justifyContent: 'center' },
  nota: { ...texto.s, color: c.textoTenue, marginTop: -espacio[3] },
  error: { ...texto.s, color: c.error, marginTop: -espacio[3] },
  abajo: { padding: espacio[4], gap: espacio[1], width: '100%', maxWidth: 560, alignSelf: 'center' },
  espera: { ...texto.s, color: c.textoTenue, textAlign: 'center', minHeight: 44, textAlignVertical: 'center', paddingTop: espacio[3] },
}));
