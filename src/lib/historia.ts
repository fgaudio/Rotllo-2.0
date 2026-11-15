// La imagen para stories de un plan (módulo 7): un cartel vertical de 1080 × 1920 px con el
// plan, listo para subir a Instagram. Se "hace una foto" a un trozo de la pantalla (el componente
// HistoriaPlan) y se comparte o se descarga.
import type { ComponentRef, RefObject } from 'react';
import { Platform, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { crearSlug } from './locales';

// Medidas de una story de Instagram, y las de la vista que se fotografía (un tercio).
export const HISTORIA = { ancho: 1080, alto: 1920 } as const;
export const VISTA = { ancho: 360, alto: 640 } as const;

// "rotllo-noche-de-salsa.png": el nombre con el que se descarga o se comparte.
export function nombreDeArchivo(titulo: string): string {
  return `rotllo-${crearSlug(titulo).replace(/^local-/, 'plan-')}.png`;
}

// El tamaño de letra del título según lo largo que sea, para que quepa en tres líneas como mucho.
export function tamanoDeTitulo(titulo: string): number {
  const letras = titulo.trim().length;
  if (letras <= 16) return 46;
  if (letras <= 30) return 38;
  if (letras <= 48) return 31;
  return 26;
}

// La vista a la que se le hace la foto.
export type RefVista = RefObject<ComponentRef<typeof View> | null>;

export type ResultadoHistoria = 'compartida' | 'descargada' | 'error';

// Fotografía la vista y la comparte (móvil) o la descarga (navegador).
export async function compartirHistoria(vista: RefVista, titulo: string): Promise<ResultadoHistoria> {
  try {
    if (!vista.current) return 'error';
    const web = Platform.OS === 'web';
    const imagen = await captureRef(vista, { format: 'png', quality: 1, result: web ? 'data-uri' : 'tmpfile', width: HISTORIA.ancho, height: HISTORIA.alto });
    if (web) {
      const enlace = document.createElement('a');
      enlace.href = imagen;
      enlace.download = nombreDeArchivo(titulo);
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      return 'descargada';
    }
    if (!(await Sharing.isAvailableAsync())) return 'error';
    // Abre el menú de compartir del móvil: Instagram (historia), WhatsApp, guardar en fotos...
    await Sharing.shareAsync(imagen, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: titulo });
    return 'compartida';
  } catch {
    return 'error';
  }
}
