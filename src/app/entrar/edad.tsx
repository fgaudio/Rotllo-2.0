import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { borrarCuenta, cerrarSesion, guardarFechaNacimiento } from '@/lib/auth';
import { aFechaIso, comprobarNacimiento } from '@/lib/edad';
import { volverAlPerfil } from '@/lib/navegar';
import { refrescarPerfil, siguientePaso, useSesion } from '@/lib/sesion';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Aviso = 'invalida' | 'menor' | 'red' | null;

// Fecha de nacimiento, la primera vez que se entra: Rotllo es solo para mayores de 18.
// Tres campos de números (día, mes, año) en vez de un calendario: es más rápido de escribir
// y funciona igual en iPhone, Android y web. Se guarda en perfiles_privados una sola vez;
// la base de datos vuelve a comprobar los 18 años aunque alguien se salte esta pantalla.
export default function EdadScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const { c } = useTema();
  const paso = siguientePaso(useSesion());
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [aviso, setAviso] = useState<Aviso>(null);
  const [cargando, setCargando] = useState(false);

  const soloNumeros = (fijar: (valor: string) => void) => (valor: string) => {
    fijar(valor.replace(/\D/g, ''));
    setAviso(null);
  };

  const seguir = async () => {
    if (cargando) return;
    const resultado = comprobarNacimiento(dia, mes, anio);
    if (resultado.estado !== 'ok') return setAviso(resultado.estado);
    setCargando(true);
    const guardado = await guardarFechaNacimiento(aFechaIso({ dia: Number(dia), mes: Number(mes), anio: Number(anio) }));
    if (guardado.ok) await refrescarPerfil(); // el perfil pasa a "activo" y el Redirect de abajo cierra la pantalla
    setCargando(false);
    if (!guardado.ok) setAviso(guardado.error === 'menor' ? 'menor' : 'red');
  };

  // Un menor no puede tener cuenta: al salir se borra la que se acaba de crear (solo tenía el email).
  const salirSinCuenta = async () => {
    setCargando(true);
    const borrada = await borrarCuenta();
    if (!borrada.ok) await cerrarSesion();
    setCargando(false);
    router.replace('/');
  };

  if (paso === 'entrar') return <Redirect href="/entrar" />;
  if (paso === 'listo') return <Redirect href="/perfil" />;

  const menor = aviso === 'menor';
  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <KeyboardAvoidingView style={s.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.cuerpo} keyboardShouldPersistTaps="handled">
          <View style={s.cabecera}>
            <Text style={s.titulo} accessibilityRole="header">
              {t('entrar.edad.titulo')}
            </Text>
            <Text style={s.texto}>{t('entrar.edad.texto')}</Text>
          </View>
          <View style={s.fila}>
            <View style={s.corto}>
              <CampoTexto etiqueta={t('entrar.edad.dia')} valor={dia} onCambio={soloNumeros(setDia)} placeholder="DD" keyboardType="number-pad" maxLength={2} autoComplete="birthdate-day" autoFocus conError={aviso === 'invalida'} />
            </View>
            <View style={s.corto}>
              <CampoTexto etiqueta={t('entrar.edad.mes')} valor={mes} onCambio={soloNumeros(setMes)} placeholder="MM" keyboardType="number-pad" maxLength={2} autoComplete="birthdate-month" conError={aviso === 'invalida'} />
            </View>
            <View style={s.largo}>
              <CampoTexto etiqueta={t('entrar.edad.anio')} valor={anio} onCambio={soloNumeros(setAnio)} placeholder="AAAA" keyboardType="number-pad" maxLength={4} autoComplete="birthdate-year" onSubmitEditing={seguir} conError={aviso === 'invalida'} />
            </View>
          </View>
          {aviso ? (
            <Text style={[s.aviso, { color: menor ? c.texto : c.error }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {aviso === 'red' ? t('entrar.errores.red') : t(`entrar.edad.${aviso}`)}
            </Text>
          ) : (
            <Text style={s.nota}>{t('entrar.edad.unaVez')}</Text>
          )}
        </ScrollView>
        <View style={s.abajo}>
          {menor ? (
            <>
              <Boton titulo={t('entrar.edad.corregir')} variante="superficie" desactivado={cargando} onPress={() => setAviso(null)} />
              <Boton titulo={t('entrar.edad.salir')} variante="texto" cargando={cargando} onPress={salirSinCuenta} />
            </>
          ) : (
            <>
              <Boton titulo={t('entrar.edad.seguir')} cargando={cargando} onPress={seguir} />
              <Boton titulo={t('entrar.edad.ahoraNo')} variante="texto" desactivado={cargando} onPress={volverAlPerfil} />
            </>
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
  fila: { flexDirection: 'row', gap: espacio[3] },
  corto: { flex: 1 },
  largo: { flex: 1.6 },
  aviso: { ...texto.m, marginTop: -espacio[2] },
  nota: { ...texto.s, color: c.textoTenue, marginTop: -espacio[2] },
  abajo: { padding: espacio[4], gap: espacio[1], width: '100%', maxWidth: 560, alignSelf: 'center' },
}));
