import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { Chip } from '@/components/Chip';
import { idiomasDisponibles } from '@/i18n';
import { EtiquetaEstado } from '@/components/EtiquetaEstado';
import { borrarCuenta, cerrarSesion } from '@/lib/auth';
import { esAdmin, obtenerLocalesPorRevisar, obtenerMisLocales, type Local } from '@/lib/locales';
import { siguientePaso, useSesion } from '@/lib/sesion';
import { useCarga } from '@/lib/usePlanes';
import { espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

// Perfil: entrar (o la cuenta, si ya se ha entrado) y el idioma.
export default function PerfilScreen() {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const sesion = useSesion();
  const paso = siguientePaso(sesion);

  return (
    <SafeAreaView style={s.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={s.contenido}>
        <Text style={s.titulo} accessibilityRole="header">
          {t('perfil.titulo')}
        </Text>

        {paso === 'esperar' ? (
          <View style={[s.tarjeta, s.tarjetaVacia]} accessible accessibilityRole="progressbar" accessibilityLabel={t('comun.cargando')} />
        ) : paso === 'entrar' ? (
          <View style={s.tarjeta}>
            <Text style={s.tarjetaTitulo} accessibilityRole="header">
              {t('perfil.entrar.titulo')}
            </Text>
            <Text style={s.tarjetaTexto}>{t('perfil.entrar.texto')}</Text>
            <Boton titulo={t('perfil.entrar.boton')} onPress={() => router.push('/entrar')} />
          </View>
        ) : sesion.estado === 'con-sesion' ? (
          <>
            {paso === 'fecha-nacimiento' ? (
              <View style={s.tarjeta}>
                <Text style={s.tarjetaTitulo} accessibilityRole="header">
                  {t('perfil.completar.titulo')}
                </Text>
                <Text style={s.tarjetaTexto}>{t('perfil.completar.texto')}</Text>
                <Boton titulo={t('perfil.completar.boton')} onPress={() => router.push('/entrar/edad')} />
              </View>
            ) : null}
            {paso === 'listo' ? <ZonaLocal /> : null}
            <Cuenta email={sesion.email} />
          </>
        ) : null}

        <View style={s.bloque}>
          <Text style={s.rotulo}>{t('perfil.idioma')}</Text>
          <View style={s.idiomas}>
            {idiomasDisponibles.map((idioma) => (
              <Chip key={idioma} etiqueta={t(`idiomas.${idioma}`)} activo={i18n.language === idioma} onPress={() => i18n.changeLanguage(idioma)} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type DatosLocal = { locales: Local[]; porRevisar: number | null };
const SIN_DATOS: DatosLocal = { locales: [], porRevisar: null };
const TONO = { verificado: 'bien', pendiente: 'espera', rechazado: 'mal', suspendido: 'mal' } as const;

// Si algo de esto falla (sin conexión), simplemente no sale: no es imprescindible en Perfil.
async function cargarZonaLocal(): Promise<DatosLocal> {
  const [locales, admin] = await Promise.all([obtenerMisLocales(), esAdmin()]);
  return { locales, porRevisar: admin ? (await obtenerLocalesPorRevisar()).length : null };
}

// Para quien tiene cuenta completa: su local (o la invitación a darlo de alta) y, para el
// equipo de Rotllo, los locales por revisar.
function ZonaLocal() {
  const { t } = useTranslation();
  const s = useEstilos();
  const { datos, cargando, error } = useCarga(cargarZonaLocal, SIN_DATOS);
  if (cargando || error) return null;
  const local = datos.locales[0];
  return (
    <>
      {datos.porRevisar !== null ? (
        <View style={s.tarjeta}>
          <Text style={s.tarjetaTitulo} accessibilityRole="header">
            {t('admin.porRevisar')}
          </Text>
          <Text style={s.tarjetaTexto}>{datos.porRevisar > 0 ? t('admin.porRevisarN', { n: datos.porRevisar }) : t('admin.vacio.texto')}</Text>
          <Boton titulo={t('admin.porRevisar')} variante="superficie" onPress={() => router.push('/admin/locales')} />
        </View>
      ) : null}
      {local ? (
        <View style={s.tarjeta}>
          <Text style={s.rotulo}>{t('local.miLocal')}</Text>
          <Text style={s.tarjetaTitulo} accessibilityRole="header">
            {local.nombre}
          </Text>
          <EtiquetaEstado texto={t(`local.estado.${local.estado}`)} tono={TONO[local.estado]} />
          <Boton titulo={t('local.ver')} variante="superficie" onPress={() => router.push('/local')} />
        </View>
      ) : (
        <View style={s.tarjeta}>
          <Text style={s.tarjetaTitulo} accessibilityRole="header">
            {t('local.tengo.titulo')}
          </Text>
          <Text style={s.tarjetaTexto}>{t('local.tengo.texto')}</Text>
          <Boton titulo={t('local.tengo.boton')} variante="superficie" onPress={() => router.push('/local/nuevo')} />
        </View>
      )}
    </>
  );
}

// La cuenta: con qué email se ha entrado, cerrar sesión y borrar la cuenta.
// Borrar pide confirmación aquí mismo (un cuadro de diálogo del sistema no funciona en la web).
function Cuenta({ email }: { email: string }) {
  const { t } = useTranslation();
  const s = useEstilos();
  const [confirmando, setConfirmando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const borrar = async () => {
    setBorrando(true);
    setError(null);
    const resultado = await borrarCuenta();
    setBorrando(false);
    if (!resultado.ok) setError(resultado.error === 'local' ? t('perfil.cuenta.borrarLocal') : t('perfil.cuenta.borrarError'));
    // Si ha ido bien, la sesión se cierra sola y esta tarjeta desaparece.
  };

  return (
    <View style={s.bloque}>
      <Text style={s.rotulo}>{t('perfil.cuenta.titulo')}</Text>
      <View style={s.tarjeta}>
        <Text style={s.email} selectable>
          {email}
        </Text>
        {confirmando ? (
          <>
            <Text style={s.tarjetaTitulo} accessibilityRole="header">
              {t('perfil.cuenta.borrarTitulo')}
            </Text>
            <Text style={s.tarjetaTexto}>{t('perfil.cuenta.borrarTexto')}</Text>
            {error ? (
              <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}
            <Boton titulo={t('perfil.cuenta.borrarNo')} variante="superficie" desactivado={borrando} onPress={() => setConfirmando(false)} />
            <Boton titulo={t('perfil.cuenta.borrarSi')} variante="peligro" cargando={borrando} onPress={borrar} />
          </>
        ) : (
          <>
            <Boton titulo={t('perfil.cuenta.cerrar')} variante="superficie" onPress={cerrarSesion} />
            <Boton
              titulo={t('perfil.cuenta.borrar')}
              variante="texto"
              onPress={() => {
                setError(null);
                setConfirmando(true);
              }}
            />
          </>
        )}
      </View>
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  contenido: { paddingHorizontal: espacio[4], paddingTop: espacio[4], paddingBottom: espacio[10], gap: espacio[6], width: '100%', maxWidth: 560, alignSelf: 'center' },
  titulo: { ...texto.titulo, color: c.texto },
  tarjeta: { backgroundColor: c.superficie, borderRadius: radio.l, padding: espacio[5], gap: espacio[3] },
  tarjetaVacia: { height: 190 },
  tarjetaTitulo: { ...texto.seccion, color: c.texto },
  tarjetaTexto: { ...texto.m, color: c.textoSuave, marginBottom: espacio[2] },
  email: { ...texto.l, color: c.texto, marginBottom: espacio[2] },
  error: { ...texto.s, color: c.error },
  bloque: { gap: espacio[3] },
  rotulo: { ...texto.rotulo, color: c.textoSuave },
  idiomas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[2] },
}));
