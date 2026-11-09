import { Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatearFecha } from '@/lib/formatos';
import type { Plan } from '@/lib/tipos';
import { borde, espacio, radio, texto } from '@/theme/tokens';
import { crearEstilos } from '@/theme/useTema';

import { BadgePrecio, EtiquetaEdad } from './BadgePrecio';
import { FotoPlan } from './FotoPlan';

const ANCHO_FOTO = 120;

// Tarjeta de plan (docs/diseno.md): imagen de 120 px a la izquierda y la cartela a la
// derecha, con marco de 2 px. Toda la tarjeta se pulsa y abre la ficha. La imagen ocupa todo
// el alto de la tarjeta, aunque el título salga en dos líneas.
export function TarjetaPlan({ plan }: { plan: Plan }) {
  const { t, i18n } = useTranslation();
  const s = useEstilos();
  const [alto, setAlto] = useState(ANCHO_FOTO);
  const fecha = formatearFecha(plan.empiezaEn, i18n.language);
  return (
    <Link href={{ pathname: '/p/[id]', params: { id: plan.id } }} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={`${plan.titulo}. ${fecha}. ${plan.barrio}`}>
        {/* El estilo va en la View de dentro: en la web, Link asChild no reenvía el estilo del Pressable. */}
        <View style={s.tarjeta}>
          <View style={s.foto} onLayout={(e) => setAlto(Math.max(1, Math.round(e.nativeEvent.layout.height)))}>
            <View style={StyleSheet.absoluteFill}>
              <FotoPlan
                uri={plan.fotoUrl}
                categoria={plan.categoria}
                descripcion={t('plan.foto', { titulo: plan.titulo })}
                proporcion={(ANCHO_FOTO - borde) / alto}
              />
            </View>
          </View>
          <View style={s.cuerpo}>
            <Text style={s.titulo} numberOfLines={2}>
              {plan.titulo}
            </Text>
            <Text style={s.meta}>
              {fecha} · {plan.barrio}
            </Text>
            <View style={s.etiquetas}>
              <BadgePrecio esGratis={plan.esGratis} precioDesdeCentimos={plan.precioDesdeCentimos} />
              <EtiquetaEdad edad={plan.edadMinima} />
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const useEstilos = crearEstilos((c) => ({
  tarjeta: {
    flexDirection: 'row',
    backgroundColor: c.superficie,
    borderWidth: borde,
    borderColor: c.marco,
    borderRadius: radio.m,
    overflow: 'hidden',
  },
  foto: { width: ANCHO_FOTO, minHeight: ANCHO_FOTO, borderRightWidth: borde, borderRightColor: c.marco },
  cuerpo: { flex: 1, padding: espacio[3], gap: espacio[1] },
  titulo: { ...texto.l, fontSize: 20, lineHeight: 25, color: c.texto },
  meta: { ...texto.s, color: c.textoSuave },
  etiquetas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio[2], marginTop: espacio[1] },
}));
