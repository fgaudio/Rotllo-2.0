import * as Linking from 'expo-linking';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EstadoVacio } from '@/components/EstadoVacio';
import { entrarConEnlace, type ErrorAuth } from '@/lib/auth';
import { siguientePaso, useSesion } from '@/lib/sesion';
import { espacio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Estado = { url: string | null; resultado: 'ok' | ErrorAuth };

// Aquí llega la persona al tocar el enlace del correo (rotllo.app/entrar/enlace). La dirección trae
// las llaves de la sesión: se guardan y la app sigue con la fecha de nacimiento (la primera vez)
// o con el perfil. Si el enlace ha caducado o ya se usó, se explica y se ofrece pedir otro.
export default function EnlaceScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const { c } = useTema();
  const url = Linking.useLinkingURL(); // la dirección completa con la que se ha abierto la app
  const paso = siguientePaso(useSesion());
  const [estado, setEstado] = useState<Estado | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    entrarConEnlace(url).then((resultado) => {
      if (vigente) setEstado({ url, resultado: resultado.ok ? 'ok' : resultado.error });
    });
    return () => {
      vigente = false;
    };
  }, [url, intento]);

  // El resultado solo cuenta si es de la dirección actual (puede llegar un enlace nuevo con esta pantalla abierta).
  const resultado = estado?.url === url ? estado.resultado : null;

  // Con la sesión abierta (por este enlace o porque ya lo estaba), se sigue adelante.
  if (resultado && paso === 'fecha-nacimiento') return <Redirect href="/entrar/edad" />;
  if (resultado && paso === 'listo') return <Redirect href="/perfil" />;

  const fallo = resultado && resultado !== 'ok' && paso === 'entrar' ? resultado : null;

  return (
    <SafeAreaView style={s.pantalla}>
      {fallo === 'sin-servicio' ? (
        <EstadoVacio titulo={t('entrar.enlace.sinConexionTitulo')} texto={t('entrar.sinServicio')} />
      ) : fallo === 'red' || fallo === 'espera' ? (
        <EstadoVacio
          titulo={t('entrar.enlace.sinConexionTitulo')}
          texto={t(`entrar.errores.${fallo}`)}
          boton={{ titulo: t('entrar.enlace.reintentar'), onPress: () => setIntento((n) => n + 1) }}
        />
      ) : fallo ? (
        <EstadoVacio
          titulo={t('entrar.enlace.caducadoTitulo')}
          texto={t('entrar.enlace.caducadoTexto')}
          boton={{ titulo: t('entrar.enlace.pedirOtro'), onPress: () => router.replace('/entrar/email') }}
        />
      ) : (
        <View style={s.entrando} accessibilityRole="progressbar" accessibilityLabel={t('entrar.enlace.entrando')}>
          <ActivityIndicator color={c.texto} />
          <Text style={s.texto}>{t('entrar.enlace.entrando')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo, justifyContent: 'center' },
  entrando: { alignItems: 'center', gap: espacio[3], padding: espacio[6] },
  texto: { ...texto.m, color: c.textoSuave },
}));
