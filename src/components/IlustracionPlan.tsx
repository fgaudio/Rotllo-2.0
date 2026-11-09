import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Pattern, Rect } from 'react-native-svg';

import { parejaDe, serie, type Pareja } from '@/theme/tokens';

// Ilustración de serigrafía (docs/diseno.md): la pareja de colores de la categoría,
// lunares de semitono, la figura con contorno de tinta y dos destellos.
// Se usa mientras el local no suba fotos, y en la serie del destacado.

type Figura = 'musica' | 'fiesta' | 'copa' | 'balon' | 'sol' | 'estrella';

const FIGURA_DE_CATEGORIA: Record<string, Figura> = {
  'musica-en-directo': 'musica',
  fiesta: 'fiesta',
  'bar-y-tardeo': 'copa',
  gastro: 'copa',
  deporte: 'balon',
  'aire-libre': 'sol',
};

const DESTELLO = 'M0 -22 C3 -6 6 -3 22 0 C6 3 3 6 0 22 C-3 6 -6 3 -22 0 C-6 -3 -3 -6 0 -22Z';

function DibujoFigura({ figura, pareja }: { figura: Figura; pareja: Pareja }) {
  const trazo = { stroke: serie.tinta, strokeWidth: 5, strokeLinejoin: 'round' as const };
  switch (figura) {
    case 'musica':
      return (
        <G {...trazo}>
          <Ellipse cx={68} cy={138} rx={20} ry={15} fill={pareja.figura} />
          <Ellipse cx={128} cy={124} rx={20} ry={15} fill={pareja.figura} />
          <Path d="M86 136 V58 L146 46 V122" fill="none" strokeWidth={8} />
          <Path d="M86 72 L146 60" strokeWidth={8} />
        </G>
      );
    case 'fiesta':
      return (
        <G {...trazo}>
          <Line x1={100} y1={0} x2={100} y2={44} />
          <Circle cx={100} cy={108} r={52} fill={pareja.figura} />
          <Path
            d="M48 108 H152 M56 82 H144 M56 134 H144 M100 56 V160 M74 62 Q60 108 74 154 M126 62 Q140 108 126 154"
            fill="none"
            strokeWidth={3.5}
          />
        </G>
      );
    case 'copa':
      return (
        <G {...trazo}>
          <Path d="M56 52 H144 L100 112 Z" fill={pareja.figura} />
          <Path d="M100 112 V156 M74 158 H126" fill="none" strokeWidth={7} strokeLinecap="round" />
          <Path d="M92 52 L128 30" strokeWidth={4} />
          <Circle cx={132} cy={60} r={10} fill={pareja.fondo} />
        </G>
      );
    case 'balon':
      return (
        <G {...trazo}>
          <Circle cx={100} cy={104} r={52} fill={pareja.figura} />
          <Path d="M56 80 Q100 104 148 86 M50 118 Q96 124 142 142 M100 52 Q76 104 108 156" fill="none" strokeWidth={4} />
        </G>
      );
    case 'sol':
      return (
        <G {...trazo}>
          <Circle cx={100} cy={104} r={42} fill={pareja.figura} />
          <Path
            d="M100 36 V50 M100 158 V172 M32 104 H46 M154 104 H168 M52 56 L62 66 M138 142 L148 152 M148 56 L138 66 M62 142 L52 152"
            strokeWidth={6}
            strokeLinecap="round"
          />
        </G>
      );
    default:
      return <Path d={DESTELLO} transform="translate(100 104) scale(3.2)" fill={pareja.figura} {...trazo} strokeWidth={1.6} />;
  }
}

type Props = {
  categoria: string;
  descripcion: string; // texto alternativo
  pareja?: Pareja; // para la serie del destacado
  proporcion?: number; // ancho / alto (1 = cuadrada)
};

export function IlustracionPlan({ categoria, descripcion, pareja, proporcion = 1 }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const colores = pareja ?? parejaDe(categoria);
  const figura = FIGURA_DE_CATEGORIA[categoria] ?? 'estrella';
  const ancho = 200 * Math.max(proporcion, 1);
  const alto = 200 / Math.min(proporcion, 1);
  const dx = (ancho - 200) / 2;
  const dy = (alto - 200) / 2;
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${ancho} ${alto}`}
      preserveAspectRatio="xMidYMid slice"
      accessibilityRole="image"
      accessibilityLabel={descripcion}>
      <Defs>
        <Pattern id={`lunares${id}`} width={12} height={12} patternUnits="userSpaceOnUse">
          <Circle cx={6} cy={6} r={2.4} fill="rgba(0,0,0,0.13)" />
        </Pattern>
      </Defs>
      <Rect width={ancho} height={alto} fill={colores.fondo} />
      <Rect width={ancho} height={alto} fill={`url(#lunares${id})`} />
      <G transform={`translate(${dx} ${dy})`}>
        <DibujoFigura figura={figura} pareja={colores} />
        <Path d={DESTELLO} transform="translate(164 40)" fill={serie.blanco} />
        <Path d={DESTELLO} transform="translate(38 168) scale(0.55)" fill={serie.blanco} />
      </G>
    </Svg>
  );
}
