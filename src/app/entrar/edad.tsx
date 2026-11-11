import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvisoPrueba } from '@/components/AvisoPrueba';
import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { comprobarNacimiento } from '@/lib/edad';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

// Fecha de nacimiento al crear la cuenta: Rotllo es solo para mayores de 18.
// Tres campos de números (día, mes, año) en vez de un calendario: es más rápido de escribir
// y funciona igual en iPhone, Android y web. En el módulo 1 se guardará en perfiles_privados.
export default function EdadScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const { c } = useTema();
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [aviso, setAviso] = useState<'invalida' | 'menor' | null>(null);

  const soloNumeros = (fijar: (v: string) => void) => (v: string) => {
    fijar(v.replace(/\D/g, ''));
    setAviso(null);
  };

  const seguir = () => {
    const resultado = comprobarNacimiento(dia, mes, anio);
    if (resultado.estado !== 'ok') return setAviso(resultado.estado);
    router.dismissAll();
    router.replace('/');
  };

  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <KeyboardAvoidingView style={s.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.cuerpo} keyboardShouldPersistTaps="handled">
          <AvisoPrueba texto={t('entrar.prueba')} />
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
            <Text style={[s.aviso, { color: aviso === 'menor' ? c.texto : c.error }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {t(`entrar.edad.${aviso}`)}
            </Text>
          ) : null}
        </ScrollView>
        <View style={s.abajo}>
          <Boton titulo={t('entrar.edad.seguir')} onPress={seguir} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  cuerpo: { paddingHorizontal: espacio[4], paddingTop: espacio[2], paddingBottom: espacio[4], gap: espacio[6] },
  cabecera: { gap: espacio[2] },
  titulo: { ...texto.titulo, color: c.texto },
  texto: { ...texto.m, color: c.textoSuave },
  fila: { flexDirection: 'row', gap: espacio[3] },
  corto: { flex: 1 },
  largo: { flex: 1.6 },
  aviso: { ...texto.m },
  abajo: { padding: espacio[4] },
}));
