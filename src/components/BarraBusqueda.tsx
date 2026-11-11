import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { espacio, fuentes, radio, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Props = {
  valor: string;
  onCambio: (texto: string) => void;
  autoFoco?: boolean;
};

// Barra de búsqueda (docs/diseno.md): píldora de 48 con lupa y botón de borrar. Vive en la
// pantalla de búsqueda (/buscar); en el feed solo hay un icono para llegar a ella.
export function BarraBusqueda({ valor, onCambio, autoFoco }: Props) {
  const { t } = useTranslation();
  const { c } = useTema();
  const s = useEstilos();
  return (
    <View style={s.caja}>
      <Ionicons name="search" size={20} color={c.textoSuave} />
      <TextInput
        value={valor}
        onChangeText={onCambio}
        placeholder={t('buscar.placeholder')}
        placeholderTextColor={c.textoTenue}
        accessibilityLabel={t('buscar.etiqueta')}
        returnKeyType="search"
        autoCorrect={false}
        autoFocus={autoFoco}
        style={s.campo}
      />
      {valor ? (
        <Pressable onPress={() => onCambio('')} accessibilityRole="button" accessibilityLabel={t('buscar.borrar')} style={s.borrar}>
          <Ionicons name="close-circle" size={20} color={c.textoSuave} />
        </Pressable>
      ) : null}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  caja: { flex: 1, minWidth: 0, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: espacio[2], paddingLeft: espacio[4], borderRadius: radio.pildora, backgroundColor: c.superficie },
  campo: { flex: 1, minWidth: 0, minHeight: zonaTactilMinima, fontFamily: fuentes.normal, fontSize: 17, color: c.texto, outlineStyle: 'solid', outlineWidth: 0 },
  borrar: { minWidth: zonaTactilMinima, minHeight: zonaTactilMinima, alignItems: 'center', justifyContent: 'center' },
}));
