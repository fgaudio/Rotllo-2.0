# Compartir en Instagram (módulo 7)

**Estado:** construido el 15 de noviembre de 2026. Probado en el navegador; falta verlo en un móvil.

## Qué hace

Cada plan tiene una **imagen para stories**: vertical, de 1080 × 1920 px (el tamaño de una historia de Instagram), con el logo, el cartel del plan, cuándo es, el título, el sitio y el precio.

Se llega desde dos sitios:

- **La ficha del plan**, en el bloque «Mejor con tu gente»: botón «Imagen para stories».
- **El panel del local**, al editar un plan publicado: botón «Imagen para stories». Es el uso principal: que el local anuncie su plan en su propio Instagram.

La pantalla (`/compartir/<id>`) enseña la imagen tal como va a quedar y tiene dos botones:

| Botón | En el móvil | En el navegador |
|---|---|---|
| **Compartir imagen** | Abre el menú de compartir: Instagram (historia), WhatsApp, guardar en fotos… | Se llama «Descargar imagen» y la baja como archivo PNG |
| **Compartir el enlace** | Abre el menú de compartir con el enlace del plan | Copia el enlace |

## Decisiones

- **La imagen y el enlace van por separado.** Instagram no deja poner enlaces en una imagen: hay que añadir su «sticker de enlace» a mano. La pantalla lo explica.
- **La imagen se hace en el móvil**, «fotografiando» un trozo de la pantalla (`react-native-view-shot`). No hace falta servidor y sale idéntica a lo que se ve.
- **Siempre oscura**, se haga con el móvil en claro o en oscuro: así todas las historias de Rotllo se reconocen.
- **Aire arriba y abajo:** Instagram tapa esas zonas con su interfaz (el nombre de la cuenta arriba, la caja de mensaje abajo).
- **Fecha completa** («sáb, 21 nov · 23:00») y no «hoy» o «mañana»: una historia se ve durante 24 horas y el plan puede ser otro día.
- **El título se encoge** si es largo, para que quepan siempre el sitio y el precio.
- **Planes cancelados:** no se puede hacer su imagen.

## Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `src/components/HistoriaPlan.tsx` | El dibujo de la imagen |
| `src/lib/historia.ts` | Hacer la foto y compartirla o descargarla |
| `src/app/compartir/[id].tsx` | La pantalla |

Paquetes nuevos: `react-native-view-shot` y `expo-sharing` (nativos: hay que rehacer la development build) y `html2canvas-pro` (solo para el navegador).

## Probado

- **Tests:** el nombre del archivo y el tamaño del título.
- **En el navegador, con los planes de ejemplo:** llegar desde la ficha, descargar la imagen de cuatro planes (los tres estilos de cartel generado), comprobar que miden 1080 × 1920 y revisarlas a ojo. Están en `prototipos/compartir/`.
- **No probado:** el menú de compartir de un iPhone o un Android, y la imagen de un plan con foto subida por el local (en el navegador, las fotos de otro servidor a veces no se dejan «fotografiar»).

## Pendiente

- **El dominio `rotllo.app`.** El enlace que se comparte es `https://rotllo.app/p/<id>`. Hasta que el dominio exista y tenga la web publicada, ese enlace no abre nada.
- **Compartir directamente en la historia de Instagram**, sin pasar por el menú del móvil. Se puede, pero exige dar de alta la app en Meta.
- **Vista previa del enlace** en WhatsApp y otras apps (la imagen pequeña que sale al pegar un enlace). Necesita que la web se genere en un servidor.
