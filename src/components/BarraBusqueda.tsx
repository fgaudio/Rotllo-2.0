import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { borde, espacio, fuentes, radio, zonaTactilMinima } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Props = {
  valor: string;
  onCambio: (texto: string) => void;
};

// Barra de búsqueda (docs/diseno.md): 48 de alto, marco de 2 px y lupa. Va en el feed; de momento
// busca entre los planes cargados (src/lib/busqueda.ts) y en el módulo de planes, en la base de datos.
export function BarraBusqueda({ valor, onCambio }: Props) {
  const { t } = useTranslation();
  const { c } = useTema();
  const s = useEstilos();
  const [enfocada, setEnfocada] = useState(false);
  return (
    <View style={[s.caja, enfocada && s.cajaEnfocada]}>
      <Ionicons name="search" size={20} color={c.textoSuave} />
      <TextInput
        value={valor}
        onChangeText={onCambio}
        placeholder={t('busqueda.placeholder')}
        placeholderTextColor={c.textoSuave}
        accessibilityLabel={t('busqueda.etiqueta')}
        onFocus={() => setEnfocada(true)}
        onBlur={() => setEnfocada(false)}
        returnKeyType="search"
        autoCorrect={false}
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
  cajaEnfocada: { borderColor: c.indicador }, // foco visible (en la web se quita el recuadro del navegador)
  campo: { flex: 1, minHeight: zonaTactilMinima, fontFamily: fuentes.normal, fontSize: 17, color: c.texto, outlineStyle: 'solid', outlineWidth: 0 },
  borrar: { minWidth: zonaTactilMinima, minHeight: zonaTactilMinima, alignItems: 'center', justifyContent: 'center' },
}));
