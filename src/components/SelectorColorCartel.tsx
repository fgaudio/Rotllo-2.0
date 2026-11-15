import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { coloresCartel, espacio, pop, zonaTactilMinima, type NombreColorCartel } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { Chip } from './Chip';

type Props = {
  valor: string | null; // null = automático (el de la categoría)
  onCambio: (color: NombreColorCartel | null) => void;
};

const NOMBRES = Object.keys(coloresCartel) as NombreColorCartel[];

// Para elegir el color del cartel (docs/diseno.md): "Automático" y un círculo por combinación,
// con el fondo y un punto del color de la figura. El elegido lleva una marca; cada círculo tiene
// su nombre para el lector de pantalla (el color no es lo único que lo distingue).
export function SelectorColorCartel({ valor, onCambio }: Props) {
  const { t } = useTranslation();
  const s = useEstilos();
  return (
    <View style={s.fila} accessibilityRole="radiogroup">
      <Chip etiqueta={t('misPlanes.automatico')} activo={valor === null} onPress={() => onCambio(null)} />
      {NOMBRES.map((nombre) => {
        const color = coloresCartel[nombre];
        const elegido = valor === nombre;
        return (
          <Pressable
            key={nombre}
            accessibilityRole="radio"
            accessibilityLabel={t(`misPlanes.colores.${nombre}`)}
            accessibilityState={{ selected: elegido }}
            onPress={() => onCambio(nombre)}
            style={({ pressed }) => [s.circulo, { backgroundColor: color.fondo }, elegido && s.elegido, pressed && s.pulsado]}>
            {elegido ? <Ionicons name="checkmark" size={22} color={color.tinta} /> : <View style={[s.punto, { backgroundColor: color.figura }]} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  fila: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: espacio[2] },
  circulo: { width: zonaTactilMinima, height: zonaTactilMinima, borderRadius: zonaTactilMinima / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: pop.tinta },
  elegido: { borderColor: c.texto, borderWidth: 3 },
  pulsado: { opacity: 0.8 },
  punto: { width: 14, height: 14, borderRadius: 7 },
}));
