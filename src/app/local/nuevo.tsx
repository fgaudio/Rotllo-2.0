import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Chip } from '@/components/Chip';
import { EstadoVacio } from '@/components/EstadoVacio';
import { MapaMini } from '@/components/MapaMini';
import { buscarDireccion } from '@/lib/geocodificar';
import { crearLocal, TIPOS_LOCAL, validarAlta, type CampoAlta, type DatosAlta, type TipoLocal } from '@/lib/locales';
import { siguientePaso, useSesion } from '@/lib/sesion';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Alta de un local. Nace "pendiente" hasta que el equipo de Rotllo lo revisa; mientras tanto,
// el local ya puede preparar planes en borrador. Hace falta tener la cuenta completa.
export default function NuevoLocalScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const sesion = useSesion();
  const paso = siguientePaso(sesion);
  const emailCuenta = sesion.estado === 'con-sesion' ? sesion.email : '';

  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState<TipoLocal | null>(null);
  const [direccion, setDireccion] = useState('');
  const [punto, setPunto] = useState<DatosAlta['punto']>(null);
  const [barrio, setBarrio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [emailEscrito, setEmailEscrito] = useState<string | null>(null);
  const emailContacto = emailEscrito ?? emailCuenta; // por defecto, el de la cuenta

  const [buscando, setBuscando] = useState(false);
  const [errorDireccion, setErrorDireccion] = useState<string | null>(null);
  const [mal, setMal] = useState<CampoAlta[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const fallo = (campo: CampoAlta) => (mal.includes(campo) ? t(`local.alta.errores.${campo}`) : null);
  const quitar = (campo: CampoAlta) => setMal((campos) => campos.filter((otro) => otro !== campo));

  // Busca la dirección escrita y la cambia por la que encuentra el mapa (con su punto y su barrio).
  const buscar = async () => {
    if (buscando) return;
    setErrorDireccion(null);
    setBuscando(true);
    const resultado = await buscarDireccion(direccion);
    setBuscando(false);
    if (!resultado.ok) {
      setPunto(null);
      return setErrorDireccion(t(resultado.error === 'red' ? 'local.alta.errores.red' : 'local.alta.errores.noEncontrada'));
    }
    setDireccion(resultado.lugar.direccion);
    setPunto({ lat: resultado.lugar.lat, lng: resultado.lugar.lng });
    if (!barrio.trim() && resultado.lugar.barrio) setBarrio(resultado.lugar.barrio);
    quitar('direccion');
  };

  const enviar = async () => {
    if (enviando) return;
    const datos: DatosAlta = { nombre, tipo, direccion, punto, barrio, instagram, emailContacto };
    const errores = validarAlta(datos);
    setMal(errores);
    setErrorEnvio(null);
    if (errores.length > 0) return;
    setEnviando(true);
    const resultado = await crearLocal(datos);
    setEnviando(false);
    if (!resultado.ok) return setErrorEnvio(t(resultado.error === 'sin-cuenta' ? 'local.alta.errores.sinCuenta' : 'local.alta.errores.red'));
    router.replace('/local');
  };

  if (paso === 'entrar' || paso === 'fecha-nacimiento') {
    return (
      <View style={s.pantalla}>
        <EstadoVacio
          titulo={t('local.necesitaCuenta.titulo')}
          texto={t('local.necesitaCuenta.texto')}
          boton={{ titulo: t('local.necesitaCuenta.boton'), onPress: () => router.replace('/entrar') }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <KeyboardAvoidingView style={s.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.cuerpo} keyboardShouldPersistTaps="handled">
          <View style={s.cabecera}>
            <Text style={s.titulo} accessibilityRole="header">
              {t('local.alta.titulo')}
            </Text>
            <Text style={s.texto}>{t('local.alta.texto')}</Text>
          </View>

          <CampoTexto
            etiqueta={t('local.alta.nombre')}
            valor={nombre}
            onCambio={(valor) => {
              setNombre(valor);
              quitar('nombre');
            }}
            placeholder={t('local.alta.nombrePlaceholder')}
            maxLength={80}
            error={fallo('nombre')}
          />

          <View style={s.grupo}>
            <Text style={s.etiqueta}>{t('local.alta.tipo')}</Text>
            <View style={s.chips} accessibilityRole="radiogroup">
              {TIPOS_LOCAL.map((opcion) => (
                <Chip
                  key={opcion}
                  etiqueta={t(`local.tipo.${opcion}`)}
                  activo={tipo === opcion}
                  onPress={() => {
                    setTipo(opcion);
                    quitar('tipo');
                  }}
                />
              ))}
            </View>
            {fallo('tipo') ? (
              <Text style={s.error} accessibilityRole="alert">
                {fallo('tipo')}
              </Text>
            ) : null}
          </View>

          <View style={s.grupo}>
            <CampoTexto
              etiqueta={t('local.alta.direccion')}
              valor={direccion}
              onCambio={(valor) => {
                setDireccion(valor);
                setPunto(null); // si se cambia el texto, hay que volver a buscarla
                setErrorDireccion(null);
              }}
              placeholder={t('local.alta.direccionPlaceholder')}
              autoComplete="street-address"
              returnKeyType="search"
              onSubmitEditing={buscar}
              error={errorDireccion ?? fallo('direccion')}
            />
            {punto ? (
              <>
                <Text style={s.encontrada} accessibilityLiveRegion="polite">
                  {t('local.alta.encontrada', { direccion })}
                </Text>
                <MapaMini lat={punto.lat} lng={punto.lng} etiqueta={direccion} />
              </>
            ) : (
              <Boton titulo={t('local.alta.buscar')} icono="search" variante="superficie" compacto cargando={buscando} onPress={buscar} />
            )}
          </View>

          <CampoTexto etiqueta={t('local.alta.barrio')} valor={barrio} onCambio={setBarrio} placeholder={t('local.alta.barrioPlaceholder')} maxLength={40} />

          <CampoTexto
            etiqueta={t('local.alta.instagram')}
            valor={instagram}
            onCambio={(valor) => {
              setInstagram(valor);
              quitar('instagram');
            }}
            placeholder={t('local.alta.instagramPlaceholder')}
            autoCapitalize="none"
            autoCorrect={false}
            error={fallo('instagram')}
          />

          <View style={s.grupo}>
            <CampoTexto
              etiqueta={t('local.alta.email')}
              valor={emailContacto}
              onCambio={(valor) => {
                setEmailEscrito(valor);
                quitar('emailContacto');
              }}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              error={fallo('emailContacto')}
            />
            <Text style={s.ayuda}>{t('local.alta.emailAyuda')}</Text>
          </View>

          {errorEnvio ? (
            <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {errorEnvio}
            </Text>
          ) : null}
        </ScrollView>
        <View style={s.abajo}>
          <Boton titulo={t('local.alta.enviar')} cargando={enviando} onPress={enviar} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  cuerpo: { paddingHorizontal: espacio[4], paddingTop: espacio[2], paddingBottom: espacio[6], gap: espacio[6], width: '100%', maxWidth: 560, alignSelf: 'center' },
  cabecera: { gap: espacio[2] },
  titulo: { ...texto.titulo, color: c.texto },
  texto: { ...texto.m, color: c.textoSuave },
  grupo: { gap: espacio[3] },
  etiqueta: { ...texto.xs, fontFamily: texto.l.fontFamily, color: c.textoSuave },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[2] },
  encontrada: { ...texto.s, color: c.texto },
  ayuda: { ...texto.xs, color: c.textoTenue, marginTop: -espacio[1] },
  error: { ...texto.s, color: c.error },
  abajo: { padding: espacio[4], width: '100%', maxWidth: 560, alignSelf: 'center' },
}));
