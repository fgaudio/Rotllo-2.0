import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { CODIGO_MAX, enviarCodigo, esCodigoValido, esEmailValido, ESPERA_REENVIO_S, limpiarEmail, verificarCodigo, type ErrorAuth } from '@/lib/auth';
import { siguientePaso, useSesion } from '@/lib/sesion';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Entrar con email: se manda un código de 6 cifras (sin contraseñas) y se escribe aquí.
// Si el email es nuevo, la cuenta se crea sola. Al acertar el código, la app sigue con la fecha
// de nacimiento (la primera vez) o vuelve al perfil.
export default function EmailScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const paso = siguientePaso(useSesion());
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(0); // segundos hasta poder pedir otro código
  const [ultimoEnvio, setUltimoEnvio] = useState<string | null>(null); // a qué email se mandó el último código

  // Cuenta atrás para "Enviar otro código".
  useEffect(() => {
    if (espera <= 0) return;
    const reloj = setTimeout(() => setEspera((segundos) => segundos - 1), 1000);
    return () => clearTimeout(reloj);
  }, [espera]);

  const explicar = (motivo: ErrorAuth) =>
    motivo === 'sin-servicio' ? t('entrar.sinServicio') : motivo === 'menor' || motivo === 'local' ? t('entrar.errores.red') : t(`entrar.errores.${motivo}`);

  const enviar = async () => {
    if (cargando) return;
    if (!esEmailValido(email)) return setError(t('entrar.errores.email'));
    setError(null);
    setCargando(true);
    const resultado = await enviarCodigo(email);
    setCargando(false);
    // "Espera" justo después de mandar un código a este mismo email: el código ya está en el
    // correo, así que se pasa a escribirlo en vez de dejar a la persona bloqueada un minuto.
    const yaEnviado = !resultado.ok && resultado.error === 'espera' && ultimoEnvio === limpiarEmail(email);
    if (!resultado.ok && !yaEnviado) return setError(explicar(resultado.error));
    setEnviado(true);
    setCodigo('');
    if (resultado.ok) {
      setUltimoEnvio(limpiarEmail(email));
      setEspera(ESPERA_REENVIO_S);
    }
  };

  const entrar = async () => {
    if (cargando) return;
    if (!esCodigoValido(codigo)) return setError(t('entrar.codigo.error'));
    setError(null);
    setCargando(true);
    const resultado = await verificarCodigo(email, codigo);
    setCargando(false);
    if (!resultado.ok) setError(explicar(resultado.error));
    // Si ha ido bien, la sesión cambia sola y los Redirect de abajo llevan a la pantalla que toca.
  };

  const cambiarEmail = () => {
    setEnviado(false);
    setCodigo('');
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
              <View style={s.cabecera}>
                <Text style={s.titulo} accessibilityRole="header">
                  {t('entrar.codigo.titulo')}
                </Text>
                <Text style={s.texto}>{t('entrar.codigo.texto', { email: limpiarEmail(email) })}</Text>
              </View>
              <CampoTexto
                key="codigo"
                etiqueta={t('entrar.codigo.etiqueta')}
                valor={codigo}
                onCambio={(valor) => {
                  setCodigo(valor.replace(/\D/g, '').slice(0, CODIGO_MAX));
                  setError(null);
                }}
                error={error}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={CODIGO_MAX}
                autoFocus
                onSubmitEditing={entrar}
              />
              <Text style={s.nota}>{t('entrar.codigo.noLlega')}</Text>
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
              <Boton titulo={t('entrar.codigo.entrar')} cargando={cargando} onPress={entrar} />
              {espera > 0 ? (
                <Text style={s.espera}>{t('entrar.codigo.reenviarEn', { segundos: espera })}</Text>
              ) : (
                <Boton titulo={t('entrar.codigo.reenviar')} variante="texto" desactivado={cargando} onPress={enviar} />
              )}
              <Boton titulo={t('entrar.codigo.cambiar')} variante="texto" desactivado={cargando} onPress={cambiarEmail} />
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
  nota: { ...texto.s, color: c.textoTenue, marginTop: -espacio[3] },
  abajo: { padding: espacio[4], gap: espacio[1], width: '100%', maxWidth: 560, alignSelf: 'center' },
  espera: { ...texto.s, color: c.textoTenue, textAlign: 'center', minHeight: 44, textAlignVertical: 'center', paddingTop: espacio[3] },
}));
