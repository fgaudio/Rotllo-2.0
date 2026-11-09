import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { borde, espacio, fuentes, radio, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Props = {
  valor: string;
  onCambio: (texto: string) => void;
};

// Barra de búsqueda (docs/diseno.md): 48 de alto, marco de 2 px y lupa. Se conecta a la base
// de datos en el módulo de planes; mientras tanto no se enseña en ninguna pantalla.
export function BarraBusqueda({ valor, onCambio }: Props) {
  const { t } = useTranslation();
  const { c } = useTema();
  const s = useEstilos();
  return (
    <View style={s.caja}>
      <Ionicons name="search" size={20} color={c.textoSuave} />
      <TextInput
        value={valor}
        onChangeText={onCambio}
        placeholder={t('busqueda.placeholder')}
        placeholderTextColor={c.textoSuave}
        accessibilityLabel={t('busqueda.etiqueta')}
        returnKeyType="search"
        style={s.campo}
      />
      {valor ? (
        <Pressable onPress={() => onCambio('')} accessibilityRole="button" accessibilityLabel={t('busqueda.borrar')} style={s.borrar}>
          <Ionicons name="close" size={20} color={c.texto} />
        </Pressable>
      ) : null}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  caja: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio[2],
    paddingLeft: espacio[3],
    borderWidth: borde,
    borderColor: c.marco,
    borderRadius: radio.m,
    backgroundColor: c.superficie,
  },
  campo: { flex: 1, minHeight: zonaTactilMinima, fontFamily: fuentes.normal, fontSize: 17, color: c.texto },
  borrar: { minWidth: zonaTactilMinima, minHeight: zonaTactilMinima, alignItems: 'center', justifyContent: 'center' },
}));
