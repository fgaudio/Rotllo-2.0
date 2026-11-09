import { useId, useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { alturaBoton, borde, espacio, fuentes, radio, texto } from '@/theme/tokens';
import { crearEstilos, useTema } from '@/theme/useTema';

type Props = Omit<TextInputProps, 'value' | 'onChangeText' | 'style'> & {
  etiqueta: string;
  valor: string;
  onCambio: (texto: string) => void;
  error?: string | null;
  conError?: boolean; // marca la caja en rojo cuando el mensaje se enseña fuera (varios campos)
};

// Campo de formulario (docs/diseno.md): etiqueta arriba, caja de 52 con marco de 2 px y,
// si hay error, el marco y el mensaje en color de error (el mensaje se lee en voz alta).
// Con el foco, el marco pasa al color indicador.
export function CampoTexto({ etiqueta, valor, onCambio, error, conError, ...resto }: Props) {
  const s = useEstilos();
  const { c } = useTema();
  const id = useId();
  const [enfocado, setEnfocado] = useState(false);
  return (
    <View style={s.contenedor}>
      <Text style={s.etiqueta} nativeID={id}>
        {etiqueta}
      </Text>
      <TextInput
        value={valor}
        onChangeText={onCambio}
        accessibilityLabel={etiqueta}
        accessibilityLabelledBy={id}
        placeholderTextColor={c.textoSuave}
        style={[s.caja, enfocado && s.cajaEnfocada, error || conError ? s.cajaError : null]}
        {...resto}
        onFocus={(e) => {
          setEnfocado(true);
          resto.onFocus?.(e);
        }}
        onBlur={(e) => {
          setEnfocado(false);
          resto.onBlur?.(e);
        }}
      />
      {error ? (
        <Text style={s.error} accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const useEstilos = crearEstilos((c) => ({
  contenedor: { gap: espacio[2] },
  etiqueta: { ...texto.xs, color: c.texto },
  caja: {
    minHeight: alturaBoton,
    paddingHorizontal: espacio[3],
    borderWidth: borde,
    borderColor: c.marco,
    borderRadius: radio.m,
    backgroundColor: c.superficie,
    fontFamily: fuentes.normal,
    fontSize: 17,
    color: c.texto,
    outlineStyle: 'solid',
    outlineWidth: 0, // en la web, el foco se ve con el color del marco (cajaEnfocada)
  },
  cajaEnfocada: { borderColor: c.indicador },
  cajaError: { borderColor: c.error },
  error: { ...texto.s, color: c.error },
}));
