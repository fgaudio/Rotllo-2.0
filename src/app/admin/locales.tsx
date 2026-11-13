import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Cargando } from '@/components/Cargando';
import { EstadoVacio } from '@/components/EstadoVacio';
import { esAdmin, obtenerLocalesPorRevisar, revisarLocal, type LocalPorRevisar } from '@/lib/locales';
import { useCarga } from '@/lib/usePlanes';
import { espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

type Datos = { admin: boolean; locales: LocalPorRevisar[] };
const VACIO: Datos = { admin: false, locales: [] };

async function cargar(): Promise<Datos> {
  const admin = await esAdmin();
  return { admin, locales: admin ? await obtenerLocalesPorRevisar() : [] };
}

// Locales por revisar: solo para el equipo de Rotllo. Esconder esta pantalla no es lo que
// protege los datos: aunque alguien llegue aquí, la base de datos solo deja aprobar a un admin.
export default function RevisarLocalesScreen() {
  const { t } = useTranslation();
  const s = useEstilos();
  const { datos, cargando, error, recargar } = useCarga(cargar, VACIO);

  if (cargando) {
    return (
      <View style={[s.pantalla, s.margen]}>
        <Cargando etiqueta={t('comun.cargando')} soloFilas />
      </View>
    );
  }
  if (error) {
    return (
      <View style={s.pantalla}>
        <EstadoVacio titulo={t('comun.error.titulo')} texto={t('admin.error')} boton={{ titulo: t('comun.error.boton'), onPress: recargar }} />
      </View>
    );
  }
  if (!datos.admin) {
    return (
      <View style={s.pantalla}>
        <EstadoVacio titulo={t('admin.sinPermiso.titulo')} texto={t('admin.sinPermiso.texto')} boton={{ titulo: t('admin.sinPermiso.boton'), onPress: () => router.replace('/') }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <ScrollView contentContainerStyle={s.cuerpo} keyboardShouldPersistTaps="handled">
        <Text style={s.titulo} accessibilityRole="header">
          {t('admin.porRevisar')}
        </Text>
        {datos.locales.length === 0 ? (
          <EstadoVacio titulo={t('admin.vacio.titulo')} texto={t('admin.vacio.texto')} />
        ) : (
          datos.locales.map((local) => <LocalPendiente key={local.id} local={local} alTerminar={recargar} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LocalPendiente({ local, alTerminar }: { local: LocalPorRevisar; alTerminar: () => void }) {
  const { t } = useTranslation();
  const s = useEstilos();
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState<'aprobar' | 'rechazar' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const decidir = async (aprobar: boolean) => {
    if (guardando) return;
    if (!aprobar && motivo.trim().length < 3) return setError(t('admin.faltaMotivo'));
    setError(null);
    setGuardando(aprobar ? 'aprobar' : 'rechazar');
    const resultado = await revisarLocal(local.id, aprobar ? { aprobar: true } : { aprobar: false, motivo });
    setGuardando(null);
    if (!resultado.ok) return setError(t('admin.error'));
    alTerminar();
  };

  return (
    <View style={s.tarjeta}>
      <Text style={s.nombre} accessibilityRole="header">
        {local.nombre}
      </Text>
      <Text style={s.dato}>{[t(`local.tipo.${local.tipo}`), local.direccion, local.barrio].filter(Boolean).join(' · ')}</Text>
      {local.instagram ? <Text style={s.dato}>Instagram: @{local.instagram}</Text> : null}
      {local.emailContacto ? (
        <Text style={s.dato} selectable>
          {t('admin.contacto', { email: local.emailContacto })}
        </Text>
      ) : null}
      {rechazando ? (
        <>
          <CampoTexto
            etiqueta={t('admin.motivo')}
            valor={motivo}
            onCambio={(valor) => {
              setMotivo(valor);
              setError(null);
            }}
            maxLength={300}
            multiline
            error={error}
          />
          <Text style={s.ayuda}>{t('admin.motivoAyuda')}</Text>
          <Boton titulo={t('admin.confirmarRechazo')} variante="peligro" cargando={guardando === 'rechazar'} onPress={() => decidir(false)} />
          <Boton titulo={t('admin.cancelar')} variante="texto" desactivado={guardando !== null} onPress={() => setRechazando(false)} />
        </>
      ) : (
        <>
          {error ? (
            <Text style={s.error} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
          <View style={s.botones}>
            <View style={s.mitad}>
              <Boton titulo={t('admin.rechazar')} variante="superficie" desactivado={guardando !== null} onPress={() => setRechazando(true)} />
            </View>
            <View style={s.mitad}>
              <Boton titulo={t('admin.aprobar')} cargando={guardando === 'aprobar'} onPress={() => decidir(true)} />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  margen: { padding: espacio[4] },
  cuerpo: { paddingHorizontal: espacio[4], paddingTop: espacio[2], paddingBottom: espacio[10], gap: espacio[5], width: '100%', maxWidth: 560, alignSelf: 'center' },
  titulo: { ...texto.titulo, color: c.texto },
  tarjeta: { backgroundColor: c.superficie, borderRadius: radio.l, padding: espacio[5], gap: espacio[2] },
  nombre: { ...texto.seccion, color: c.texto },
  dato: { ...texto.s, color: c.textoSuave },
  ayuda: { ...texto.xs, color: c.textoTenue },
  error: { ...texto.s, color: c.error },
  botones: { flexDirection: 'row', gap: espacio[3], marginTop: espacio[3] },
  mitad: { flex: 1 },
}));
