import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { CampoTexto } from '@/components/CampoTexto';
import { Cargando } from '@/components/Cargando';
import { Cartel } from '@/components/Cartel';
import { Chip } from '@/components/Chip';
import { EstadoVacio } from '@/components/EstadoVacio';
import { EtiquetaEstado } from '@/components/EtiquetaEstado';
import { SelectorColorCartel } from '@/components/SelectorColorCartel';
import { es } from '@/i18n/es';
import { ESTILOS_CARTEL, TEXTO_CARTEL_MAX } from '@/lib/cartel';
import { formatearDia } from '@/lib/formatos';
import { elegirFoto, quitarFotoDePlan, subirFotoDePlan, type FotoElegida } from '@/lib/fotos';
import { obtenerMisLocales, type Local } from '@/lib/locales';
import {
  aFormulario,
  borrarBorrador,
  cancelarPlan,
  cartelDe,
  DESCRIPCION_MAX,
  diasParaElegir,
  EDADES,
  guardarPlan,
  nocheALaQuePertenece,
  obtenerPlanDeLocal,
  PLAN_VACIO,
  situacionDe,
  TITULO_MAX,
  validarPlan,
  type CampoPlan,
  type DatosPlan,
  type PlanLocal,
} from '@/lib/planesLocal';
import { useCarga } from '@/lib/usePlanes';
import { espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

const CATEGORIAS = Object.keys(es.categorias) as (keyof typeof es.categorias)[];
type Cargado = { locales: Local[]; plan: PlanLocal | null };
const SIN_CARGAR: Cargado = { locales: [], plan: null };

// Crear o editar un plan (docs/panel-local.md). La ruta es /local/plan/nuevo?local=<id> para
// uno nuevo y /local/plan/<id> para editar. El cartel se ve cambiar mientras se elige.
export default function PlanDelLocalScreen() {
  const { id, local: localParam } = useLocalSearchParams<{
    id: string;
    local?: string;
  }>();
  const { t } = useTranslation();
  const s = useEstilos();
  const esNuevo = id === 'nuevo';

  const cargar = useCallback(async (): Promise<Cargado> => {
    const [locales, plan] = await Promise.all([obtenerMisLocales(), esNuevo ? null : obtenerPlanDeLocal(id)]);
    return { locales, plan };
  }, [id, esNuevo]);
  const { datos: cargado, cargando, error, recargar } = useCarga(cargar, SIN_CARGAR);

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
        <EstadoVacio titulo={t('comun.error.titulo')} texto={t('misPlanes.errores.red')} boton={{ titulo: t('comun.error.boton'), onPress: recargar }} />
      </View>
    );
  }
  // Para un plan nuevo hace falta un local propio; para editar, que el plan exista y se pueda ver.
  const local = cargado.locales.find((l) => l.id === localParam) ?? cargado.locales[0];
  if (!local || (!esNuevo && !cargado.plan)) {
    return (
      <View style={s.pantalla}>
        <EstadoVacio
          titulo={t('plan.noExiste.titulo')}
          texto={t('misPlanes.noExiste')}
          boton={{
            titulo: t('local.ver'),
            onPress: () => router.replace('/local'),
          }}
        />
      </View>
    );
  }
  return <Formulario key={cargado.plan?.id ?? 'nuevo'} local={local} plan={cargado.plan} />;
}

type Confirmacion = 'cancelar' | 'borrar' | null;

function Formulario({ local, plan }: { local: Local; plan: PlanLocal | null }) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const ahora = new Date();
  const situacion = plan ? situacionDe(plan, ahora) : 'borrador';
  const editable = situacion === 'borrador' || situacion === 'publicado';
  const verificado = local.estado === 'verificado';

  const [datos, setDatos] = useState<DatosPlan>(() => (plan ? aFormulario(plan) : PLAN_VACIO));
  const [mal, setMal] = useState<CampoPlan[]>([]);
  const [guardando, setGuardando] = useState<'borrador' | 'publicar' | 'cambios' | null>(null);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<Confirmacion>(null);
  // La foto: una recién elegida (aún sin subir), la que ya tenía el plan, o ninguna.
  const [fotoNueva, setFotoNueva] = useState<FotoElegida | null>(null);
  const [fotoQuitada, setFotoQuitada] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);
  // Un plan nuevo recibe su id al guardarse; se recuerda para no crearlo dos veces si la foto falla.
  const [idGuardado, setIdGuardado] = useState(plan?.id);
  const fotoVisible = fotoNueva?.uri ?? (fotoQuitada ? null : (plan?.fotoUrl ?? null));
  const [motivo, setMotivo] = useState('');
  const [actuando, setActuando] = useState(false);

  const cambiar = (cambios: Partial<DatosPlan>, ...campos: CampoPlan[]) => {
    setDatos((antes) => ({ ...antes, ...cambios }));
    if (campos.length > 0) setMal((antes) => antes.filter((campo) => !campos.includes(campo)));
    setErrorGuardar(null);
  };
  const fallo = (campo: CampoPlan) => (mal.includes(campo) ? t(`misPlanes.errores.${campo}`) : null);

  const guardar = async (modo: 'borrador' | 'publicar' | 'cambios') => {
    if (guardando) return;
    // Al editar un plan ya publicado no se vuelve a exigir que la fecha sea futura si no se ha tocado.
    const errores = validarPlan(datos, plan && modo === 'cambios' && aFormulario(plan).dia === datos.dia && aFormulario(plan).hora === datos.hora ? new Date(0) : ahora);
    setMal(errores);
    if (errores.length > 0) return setErrorGuardar(t('misPlanes.errores.revisa'));
    setErrorGuardar(null);
    setGuardando(modo);
    const resultado = await guardarPlan(local.id, datos, {
      id: idGuardado,
      publicar: modo === 'publicar',
    });
    if (!resultado.ok) {
      setGuardando(null);
      const clave = {
        'sin-verificar': 'sinVerificar',
        'sin-permiso': 'errores.sinPermiso',
        'no-editable': 'yaNoEditable',
        'sin-servicio': 'errores.red',
        red: 'errores.red',
      } as const;
      return setErrorGuardar(t(`misPlanes.${clave[resultado.error]}`));
    }
    // El plan ya está guardado. Ahora la foto: subir la nueva o quitar la que había.
    setIdGuardado(resultado.valor);
    if (fotoNueva) {
      const subida = await subirFotoDePlan(resultado.valor, fotoNueva);
      if (!subida.ok) {
        setGuardando(null);
        return setErrorGuardar(t(subida.error === 'formato' ? 'misPlanes.foto.formato' : subida.error === 'grande' ? 'misPlanes.foto.grande' : 'misPlanes.foto.errorSubir'));
      }
    } else if (fotoQuitada && plan?.fotoUrl) {
      await quitarFotoDePlan(resultado.valor);
    }
    setGuardando(null);
    router.back();
  };

  const elegir = async () => {
    setErrorFoto(null);
    const eleccion = await elegirFoto();
    if (!eleccion.ok) return setErrorFoto(t(eleccion.error === 'permiso' ? 'misPlanes.foto.permiso' : 'misPlanes.foto.formato'));
    if (!eleccion.valor) return; // cerró la galería sin elegir
    setFotoNueva(eleccion.valor);
    setFotoQuitada(false);
    setErrorGuardar(null);
  };
  const quitarFoto = () => {
    setFotoNueva(null);
    setFotoQuitada(true);
    setErrorFoto(null);
  };

  const confirmar = async () => {
    if (!plan || actuando) return;
    setActuando(true);
    const resultado = confirmando === 'cancelar' ? await cancelarPlan(plan.id, motivo) : await borrarBorrador(plan.id);
    setActuando(false);
    if (!resultado.ok) return setErrorGuardar(t(resultado.error === 'sin-permiso' ? 'misPlanes.errores.sinPermiso' : 'misPlanes.errores.red'));
    router.back();
  };

  const dias = diasParaElegir(ahora);
  const nombreDia = (clave: string, i: number) =>
    i === 0 ? t('cuando.hoy') : i === 1 ? t('cuando.manana') : formatearDia(new Date(`${clave}T00:00:00Z`), i18n.language, 'agenda').replace(/^(\p{L}{3})\p{L}*/u, '$1');
  // Si el plan que se edita es de un día que ya no está en la lista (pasado o muy lejano), se añade.
  const diasConElegido = datos.dia && !dias.includes(datos.dia) ? [datos.dia, ...dias] : dias;
  const noche = datos.dia ? nocheALaQuePertenece(datos.dia, datos.hora) : null;

  const vistaPrevia = {
    id: plan?.id ?? `nuevo-${local.id}`,
    titulo: datos.titulo.trim() || t('misPlanes.tituloPlaceholder'),
    categoria: datos.categoria ?? '',
    fotoUrl: fotoVisible,
    cartel: cartelDe(datos),
  };

  return (
    <SafeAreaView style={s.pantalla} edges={['bottom']}>
      <KeyboardAvoidingView style={s.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.cuerpo} keyboardShouldPersistTaps="handled">
          <View style={s.cabecera}>
            <Text style={s.titulo} accessibilityRole="header">
              {plan ? t('misPlanes.editar') : t('misPlanes.nuevo')}
            </Text>
            <Text style={s.local}>{local.nombre}</Text>
            {plan ? (
              <EtiquetaEstado
                texto={t(`misPlanes.situacion.${situacion}`)}
                tono={situacion === 'publicado' ? 'bien' : situacion === 'borrador' ? 'espera' : situacion === 'cancelado' ? 'mal' : 'neutro'}
              />
            ) : null}
            {!editable ? <Text style={s.aviso}>{t('misPlanes.yaNoEditable')}</Text> : null}
            {editable && !verificado ? <Text style={s.aviso}>{t('misPlanes.sinVerificar')}</Text> : null}
          </View>

          <Seccion titulo={t('misPlanes.basico')}>
            <CampoTexto
              etiqueta={t('misPlanes.tituloCampo')}
              valor={datos.titulo}
              onCambio={(titulo) => cambiar({ titulo }, 'titulo')}
              placeholder={t('misPlanes.tituloPlaceholder')}
              maxLength={TITULO_MAX}
              editable={editable}
              error={fallo('titulo')}
            />
            <Grupo etiqueta={t('misPlanes.categoria')} error={fallo('categoria')}>
              {CATEGORIAS.map((slug) => (
                <Chip key={slug} etiqueta={t(`categorias.${slug}`)} activo={datos.categoria === slug} onPress={() => editable && cambiar({ categoria: slug }, 'categoria')} />
              ))}
            </Grupo>
            <CampoTexto
              etiqueta={t('misPlanes.descripcion')}
              valor={datos.descripcion}
              onCambio={(descripcion) => cambiar({ descripcion })}
              placeholder={t('misPlanes.descripcionPlaceholder')}
              maxLength={DESCRIPCION_MAX}
              multiline
              numberOfLines={4}
              editable={editable}
            />
          </Seccion>

          <Seccion titulo={t('misPlanes.cuando')}>
            <View style={s.grupo}>
              <Text style={s.etiqueta}>{t('misPlanes.dia')}</Text>
              {/* A sangre (sin margen) para que se vea que la fila sigue hacia la derecha. */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.sangre} contentContainerStyle={s.dias} accessibilityRole="radiogroup">
                {diasConElegido.map((clave) => (
                  <Chip key={clave} etiqueta={nombreDia(clave, dias.indexOf(clave))} activo={datos.dia === clave} onPress={() => editable && cambiar({ dia: clave }, 'dia', 'hora')} />
                ))}
              </ScrollView>
              {fallo('dia') ? (
                <Text style={s.error} accessibilityRole="alert">
                  {fallo('dia')}
                </Text>
              ) : null}
            </View>
            <View style={s.dosColumnas}>
              <View style={s.columna}>
                <CampoTexto
                  etiqueta={t('misPlanes.hora')}
                  valor={datos.hora}
                  onCambio={(hora) => cambiar({ hora }, 'hora')}
                  placeholder={t('misPlanes.horaPlaceholder')}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  editable={editable}
                  conError={mal.includes('hora')}
                />
              </View>
              <View style={s.columna}>
                <CampoTexto
                  etiqueta={t('misPlanes.horaFin')}
                  valor={datos.horaFin}
                  onCambio={(horaFin) => cambiar({ horaFin }, 'horaFin')}
                  placeholder={t('misPlanes.horaFinPlaceholder')}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                  editable={editable}
                  conError={mal.includes('horaFin')}
                />
              </View>
            </View>
            {(fallo('hora') ?? fallo('horaFin')) ? (
              <Text style={s.error} accessibilityRole="alert">
                {fallo('hora') ?? fallo('horaFin')}
              </Text>
            ) : noche ? (
              <Text style={s.nota}>
                {t('misPlanes.madrugada', {
                  dia: formatearDia(noche, i18n.language, 'agenda'),
                })}
              </Text>
            ) : null}
          </Seccion>

          <Seccion titulo={t('misPlanes.precioTitulo')}>
            <View style={s.chips} accessibilityRole="radiogroup">
              <Chip etiqueta={t('misPlanes.gratis')} activo={datos.gratis} onPress={() => editable && cambiar({ gratis: true }, 'precio')} />
              <Chip etiqueta={t('misPlanes.dePago')} activo={!datos.gratis} onPress={() => editable && cambiar({ gratis: false })} />
            </View>
            {datos.gratis ? null : (
              <CampoTexto
                etiqueta={t('misPlanes.precio')}
                valor={datos.precio}
                onCambio={(precio) => cambiar({ precio }, 'precio')}
                placeholder={t('misPlanes.precioPlaceholder')}
                keyboardType="decimal-pad"
                maxLength={7}
                editable={editable}
                error={fallo('precio')}
              />
            )}
            <Grupo etiqueta={t('misPlanes.entrada')}>
              <Chip etiqueta={t('misPlanes.sinTicketera')} activo={!datos.conTicketera} onPress={() => editable && cambiar({ conTicketera: false }, 'urlTicketera')} />
              <Chip etiqueta={t('misPlanes.conTicketera')} activo={datos.conTicketera} onPress={() => editable && cambiar({ conTicketera: true })} />
            </Grupo>
            {datos.conTicketera ? (
              <CampoTexto
                etiqueta={t('misPlanes.url')}
                valor={datos.urlTicketera}
                onCambio={(urlTicketera) => cambiar({ urlTicketera }, 'urlTicketera')}
                placeholder={t('misPlanes.urlPlaceholder')}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                editable={editable}
                error={fallo('urlTicketera')}
              />
            ) : null}
            <Grupo etiqueta={t('misPlanes.edad')}>
              {EDADES.map((edad) => (
                <Chip key={edad} etiqueta={t('plan.edadMinima', { edad })} activo={datos.edadMinima === edad} onPress={() => editable && cambiar({ edadMinima: edad })} />
              ))}
            </Grupo>
          </Seccion>

          <Seccion titulo={t('misPlanes.cartel')}>
            <Text style={s.ayuda}>{t('misPlanes.cartelAyuda')}</Text>
            <View style={s.vistaPrevia}>
              <Cartel plan={vistaPrevia} descripcion={t('plan.cartel', { titulo: vistaPrevia.titulo })} ancho={240} alto={300} />
              {fotoVisible ? <Text style={s.pie}>{t('misPlanes.foto.enFicha')}</Text> : null}
            </View>
            {fotoVisible ? (
              <>
                {/* Con foto se enseña también el recorte apaisado del feed, para que no haya sorpresas. */}
                <View style={s.vistaPrevia}>
                  <Cartel plan={vistaPrevia} descripcion="" ancho={240} alto={158} />
                  <Text style={s.pie}>{t('misPlanes.foto.enFeed')}</Text>
                </View>
                <Text style={s.ayuda}>{t('misPlanes.foto.conFoto')}</Text>
              </>
            ) : null}
            {editable ? (
              <View style={s.grupo}>
                <Boton titulo={fotoVisible ? t('misPlanes.foto.cambiar') : t('misPlanes.foto.subir')} icono="image-outline" variante="superficie" onPress={elegir} />
                {fotoVisible ? <Boton titulo={t('misPlanes.foto.quitar')} variante="texto" onPress={quitarFoto} /> : <Text style={s.ayuda}>{t('misPlanes.foto.ayuda')}</Text>}
                {errorFoto ? (
                  <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
                    {errorFoto}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {fotoVisible ? null : (
              <>
                <Grupo etiqueta={t('misPlanes.estilo')}>
                  <Chip etiqueta={t('misPlanes.automatico')} activo={datos.cartelEstilo === null} onPress={() => editable && cambiar({ cartelEstilo: null })} />
                  {ESTILOS_CARTEL.map((estilo) => (
                    <Chip key={estilo} etiqueta={t(`misPlanes.estilos.${estilo}`)} activo={datos.cartelEstilo === estilo} onPress={() => editable && cambiar({ cartelEstilo: estilo })} />
                  ))}
                </Grupo>
                <View style={s.grupo}>
                  <Text style={s.etiqueta}>{t('misPlanes.color')}</Text>
                  <SelectorColorCartel valor={datos.cartelColor} onCambio={(cartelColor) => editable && cambiar({ cartelColor })} />
                </View>
                <CampoTexto
                  etiqueta={t('misPlanes.textoCartel')}
                  valor={datos.cartelTexto}
                  onCambio={(cartelTexto) => cambiar({ cartelTexto }, 'cartelTexto')}
                  placeholder={t('misPlanes.textoCartelPlaceholder')}
                  maxLength={TEXTO_CARTEL_MAX}
                  editable={editable}
                  error={fallo('cartelTexto')}
                />
              </>
            )}
          </Seccion>

          {plan && situacion === 'publicado' ? (
            <View style={s.grupo}>
              <Boton titulo={t('misPlanes.verEnApp')} icono="eye-outline" variante="superficie" onPress={() => router.push({ pathname: '/p/[id]', params: { id: plan.id } })} />
              <Boton titulo={t('compartir.paraStories')} icono="logo-instagram" variante="superficie" onPress={() => router.push({ pathname: '/compartir/[id]', params: { id: plan.id } })} />
            </View>
          ) : null}

          {/* Cancelar o borrar piden confirmación aquí mismo (un diálogo del sistema no funciona en la web). */}
          {plan && editable ? (
            confirmando ? (
              <View style={s.confirmacion}>
                <Text style={s.confirmacionTitulo} accessibilityRole="header">
                  {confirmando === 'cancelar' ? t('misPlanes.cancelarTitulo') : t('misPlanes.borrar')}
                </Text>
                {confirmando === 'cancelar' ? (
                  <>
                    <Text style={s.ayuda}>{t('misPlanes.cancelarTexto')}</Text>
                    <CampoTexto etiqueta={t('misPlanes.motivo')} valor={motivo} onCambio={setMotivo} maxLength={200} />
                  </>
                ) : null}
                <Boton titulo={confirmando === 'cancelar' ? t('misPlanes.cancelarNo') : t('misPlanes.borrarNo')} variante="superficie" desactivado={actuando} onPress={() => setConfirmando(null)} />
                <Boton titulo={confirmando === 'cancelar' ? t('misPlanes.cancelarSi') : t('misPlanes.borrarSi')} variante="peligro" cargando={actuando} onPress={confirmar} />
              </View>
            ) : (
              <Boton
                titulo={situacion === 'publicado' ? t('misPlanes.cancelarPlan') : t('misPlanes.borrar')}
                variante="texto"
                onPress={() => setConfirmando(situacion === 'publicado' ? 'cancelar' : 'borrar')}
              />
            )
          ) : null}
        </ScrollView>

        {editable ? (
          <View style={s.abajo}>
            {errorGuardar ? (
              <Text style={s.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
                {errorGuardar}
              </Text>
            ) : null}
            {situacion === 'publicado' ? (
              <Boton titulo={t('misPlanes.guardarCambios')} cargando={guardando === 'cambios'} onPress={() => guardar('cambios')} />
            ) : (
              <View style={s.dosColumnas}>
                <View style={s.columna}>
                  <Boton titulo={t('misPlanes.guardarBorrador')} variante="superficie" cargando={guardando === 'borrador'} desactivado={guardando === 'publicar'} onPress={() => guardar('borrador')} />
                </View>
                <View style={s.columna}>
                  <Boton titulo={t('misPlanes.publicar')} cargando={guardando === 'publicar'} desactivado={!verificado || guardando === 'borrador'} onPress={() => guardar('publicar')} />
                </View>
              </View>
            )}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  const s = useEstilos();
  return (
    <View style={s.seccion}>
      <Text style={s.seccionTitulo} accessibilityRole="header">
        {titulo}
      </Text>
      {children}
    </View>
  );
}

// Una etiqueta con sus opciones (chips) debajo y, si hay, el error.
function Grupo({ etiqueta, error, children }: { etiqueta: string; error?: string | null; children: ReactNode }) {
  const s = useEstilos();
  return (
    <View style={s.grupo}>
      <Text style={s.etiqueta}>{etiqueta}</Text>
      <View style={s.chips} accessibilityRole="radiogroup">
        {children}
      </View>
      {error ? (
        <Text style={s.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  pantalla: { flex: 1, backgroundColor: c.fondo },
  margen: { padding: espacio[4] },
  cuerpo: {
    paddingHorizontal: espacio[4],
    paddingTop: espacio[2],
    paddingBottom: espacio[8],
    gap: espacio[8],
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  cabecera: { gap: espacio[2] },
  titulo: { ...texto.titulo, color: c.texto },
  local: { ...texto.m, color: c.textoSuave },
  aviso: {
    ...texto.s,
    color: c.texto,
    backgroundColor: c.superficie,
    borderRadius: radio.m,
    padding: espacio[3],
    marginTop: espacio[2],
  },
  seccion: { gap: espacio[5] },
  seccionTitulo: { ...texto.seccion, color: c.texto },
  grupo: { gap: espacio[3] },
  etiqueta: {
    ...texto.xs,
    fontFamily: texto.l.fontFamily,
    color: c.textoSuave,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[2] },
  sangre: { marginHorizontal: -espacio[4] },
  dias: { gap: espacio[2], paddingHorizontal: espacio[4] },
  dosColumnas: { flexDirection: 'row', gap: espacio[3] },
  columna: { flex: 1 },
  ayuda: { ...texto.s, color: c.textoSuave },
  nota: { ...texto.s, color: c.textoSuave, marginTop: -espacio[2] },
  vistaPrevia: { alignItems: 'center', gap: espacio[2] },
  pie: { ...texto.xs, color: c.textoTenue },
  confirmacion: {
    backgroundColor: c.superficie,
    borderRadius: radio.l,
    padding: espacio[5],
    gap: espacio[3],
  },
  confirmacionTitulo: { ...texto.seccion, color: c.texto },
  error: { ...texto.s, color: c.error },
  abajo: {
    paddingHorizontal: espacio[4],
    paddingTop: espacio[3],
    paddingBottom: espacio[3],
    gap: espacio[2],
    borderTopWidth: 1,
    borderTopColor: c.linea,
    backgroundColor: c.fondo,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
}));
