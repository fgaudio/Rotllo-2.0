import { Image } from 'expo-image';
import { useId, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Mask, Pattern, Rect, Stop } from 'react-native-svg';

import { inicialDe, resolverCartel, type CartelResuelto } from '@/lib/cartel';
import type { Plan } from '@/lib/tipos';
import { celdasSerie, fuentes, pop, radio } from '@/theme/tokens';

type Props = {
  plan: Pick<Plan, 'id' | 'titulo' | 'categoria' | 'fotoUrl' | 'cartel'>;
  descripcion: string; // lo que lee el lector de pantalla
  proporcion?: number; // ancho / alto, cuando ocupa todo el ancho disponible
  ancho?: number; // o un tamaño fijo
  alto?: number;
  redondeo?: number;
  sello?: { arriba: string; abajo: string } | null;
};

type Tamano = { w: number; h: number };

// El cartel de un plan (docs/diseno.md). Si el local ha subido una foto o un flyer, se enseña
// tal cual, sin nada encima: es su publicidad. Si no, se genera uno con el texto, el color y
// el estilo que haya elegido el local (o los que tocan por defecto, ver src/lib/cartel.ts).
export function Cartel({ plan, descripcion, proporcion = 1, ancho, alto, redondeo = radio.s, sello }: Props) {
  const fijo = ancho !== undefined && alto !== undefined;
  const [medido, setMedido] = useState<Tamano | null>(null);
  const tamano = fijo ? { w: ancho, h: alto } : medido;

  const alMedir = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const w = Math.round(width);
    const h = Math.round(height);
    if (w > 0 && h > 0 && (medido?.w !== w || medido?.h !== h)) setMedido({ w, h });
  };

  const cartel = resolverCartel(plan);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={descripcion}
      onLayout={fijo ? undefined : alMedir}
      style={[
        estilos.caja,
        { borderRadius: redondeo, backgroundColor: plan.fotoUrl ? pop.tinta : cartel.color.fondo },
        fijo ? { width: ancho, height: alto } : { width: '100%', aspectRatio: proporcion },
      ]}>
      {plan.fotoUrl ? (
        <Image source={{ uri: plan.fotoUrl }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
      ) : tamano ? (
        <Generado cartel={cartel} tamano={tamano} />
      ) : null}
      {sello && tamano ? <Sello arriba={sello.arriba} abajo={sello.abajo} ancho={tamano.w} /> : null}
    </View>
  );
}

// ── Carteles generados ──────────────────────────────────────────────────────
// Todas las medidas salen del ancho y el alto del cartel, para que se vea igual en grande
// (la ficha) que en pequeño (la agenda).

function Generado({ cartel, tamano }: { cartel: CartelResuelto; tamano: Tamano }) {
  if (cartel.estilo === 'cinta') return <Cinta cartel={cartel} tamano={tamano} />;
  if (cartel.estilo === 'inicial') return <Inicial cartel={cartel} tamano={tamano} />;
  return <Serie cartel={cartel} tamano={tamano} />;
}

const FILAS_CINTA = [0, 1, 2, 3, 4, 5, 6];

// Cinta: el texto repetido en filas inclinadas, alternando dos colores.
function Cinta({ cartel, tamano: { w, h } }: { cartel: CartelResuelto; tamano: Tamano }) {
  const cuerpo = Math.round(h / 4.3);
  const frase = `${cartel.texto} · `;
  // Letras suficientes para cruzar el cartel inclinado, y una caja más ancha que el texto
  // para que nunca salte de línea ni se corte con puntos suspensivos.
  const letras = Math.ceil((26 * w) / h) + frase.length;
  const fila = frase.repeat(Math.ceil(letras / frase.length));
  const anchoFila = fila.length * cuerpo * 0.62;
  return (
    <>
      <View style={{ position: 'absolute', left: -0.3 * w, top: -0.18 * h, width: 1.6 * w, transform: [{ rotate: '-9deg' }] }}>
        {FILAS_CINTA.map((i) => (
          <View key={i} style={{ width: anchoFila, marginTop: i === 0 ? 0 : -cuerpo * 0.27, marginLeft: -(((i * 23) % 60) / 100) * 1.6 * w }}>
            <Text
              allowFontScaling={false}
              style={[estilos.letra, { fontSize: cuerpo, lineHeight: cuerpo * 1.2, color: i % 2 === 0 ? cartel.color.tinta : cartel.color.figura }]}>
              {fila}
            </Text>
          </View>
        ))}
      </View>
      <Trama w={w} h={h} desde="abajo" />
    </>
  );
}

// Inicial: la primera letra, gigante y recortada, con un disco detrás.
function Inicial({ cartel, tamano: { w, h } }: { cartel: CartelResuelto; tamano: Tamano }) {
  const cuerpo = Math.round(h * 1.22);
  const letra = inicialDe(cartel.texto);
  const base = { fontSize: cuerpo, lineHeight: cuerpo * 1.2, position: 'absolute' as const, top: -0.08 * h };
  return (
    <>
      <View style={{ position: 'absolute', width: 0.74 * w, height: 0.74 * w, borderRadius: w, right: -0.16 * w, top: -0.1 * h, backgroundColor: cartel.color.figura }} />
      <Trama w={w} h={h} desde="arriba" />
      <Text allowFontScaling={false} style={[estilos.letra, base, { left: 0.03 * w, top: -0.12 * h, color: 'rgba(0,0,0,0.16)' }]}>
        {letra}
      </Text>
      <Text allowFontScaling={false} style={[estilos.letra, base, { left: -0.04 * w, color: cartel.color.tinta }]}>
        {letra}
      </Text>
    </>
  );
}

// Serie: la misma letra cuatro veces, cada una con una pareja de colores (el guiño a Warhol).
function Serie({ cartel, tamano: { w, h } }: { cartel: CartelResuelto; tamano: Tamano }) {
  const cuerpo = Math.round(Math.min(h * 0.46, w * 0.56));
  const letra = inicialDe(cartel.texto);
  return (
    <>
      <View style={estilos.rejilla}>
        {celdasSerie.map((celda, i) => (
          <View key={i} style={[estilos.celda, { backgroundColor: celda.fondo }]}>
            <Text allowFontScaling={false} style={[estilos.letra, { fontSize: cuerpo, lineHeight: cuerpo * 1.2, marginTop: -cuerpo * 0.1, color: celda.figura }]}>
              {letra}
            </Text>
          </View>
        ))}
      </View>
      <Trama w={w} h={h} desde="abajo" />
    </>
  );
}

// Trama de puntos de imprenta que se desvanece en diagonal.
function Trama({ w, h, desde }: { w: number; h: number; desde: 'arriba' | 'abajo' }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const arriba = desde === 'arriba';
  return (
    <Svg width={w} height={h} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={`p${id}`} width={9} height={9} patternUnits="userSpaceOnUse">
          <Circle cx={4.5} cy={4.5} r={1.7} fill="#000" fillOpacity={0.3} />
        </Pattern>
        <LinearGradient id={`g${id}`} x1={arriba ? 1 : 0} y1={arriba ? 0 : 1} x2={arriba ? 0.3 : 0.7} y2={arriba ? 1 : 0}>
          <Stop offset={0} stopColor="#fff" stopOpacity={1} />
          <Stop offset={0.62} stopColor="#fff" stopOpacity={0} />
        </LinearGradient>
        <Mask id={`m${id}`}>
          <Rect width={w} height={h} fill={`url(#g${id})`} />
        </Mask>
      </Defs>
      <Rect width={w} height={h} fill={`url(#p${id})`} mask={`url(#m${id})`} />
    </Svg>
  );
}

// Sello redondo con el día y la hora. El círculo es el motivo de la marca (rotllo = corro).
function Sello({ arriba, abajo, ancho }: { arriba: string; abajo: string; ancho: number }) {
  const lado = Math.min(84, Math.max(54, Math.round(ancho * 0.2)));
  return (
    <View style={[estilos.sello, { width: lado, height: lado, borderRadius: lado, right: Math.max(8, ancho * 0.045), top: Math.max(8, ancho * 0.04) }]}>
      <Text allowFontScaling={false} numberOfLines={1} style={[estilos.letra, estilos.selloTexto, { fontSize: lado * 0.2, lineHeight: lado * 0.24 }]}>
        {arriba}
      </Text>
      <Text allowFontScaling={false} numberOfLines={1} style={[estilos.letra, estilos.selloTexto, { fontSize: lado * 0.3, lineHeight: lado * 0.35 }]}>
        {abajo}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { overflow: 'hidden' },
  letra: { fontFamily: fuentes.cartel, textTransform: 'uppercase', includeFontPadding: false },
  rejilla: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row', flexWrap: 'wrap' },
  celda: { width: '50%', height: '50%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sello: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pop.papel,
    borderWidth: 2,
    borderColor: pop.tinta,
    transform: [{ rotate: '9deg' }],
  },
  selloTexto: { color: pop.tinta, textAlign: 'center' },
});
