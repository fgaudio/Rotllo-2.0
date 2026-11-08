# ADR-005: Imágenes de planes y locales

**Estado:** Aceptado (2026-11-08)
**Fecha:** 2026-11-07
**Decide:** responsable de Rotllo

## Contexto

- Los locales suben **fotos de planes** (hasta 6 por plan) y su **logo y portada**. Los usuarios suben su **avatar**.
- El feed y el mapa muestran muchas fotos pequeñas, y la ficha las muestra grandes.
- Las fotos que se hacen con el móvil pesan **3-8 MB**. Si se sirven tal cual, la app va lenta y gasta datos.
- Hay que generar la **imagen para Instagram stories** de cada plan.

## Decisión

- **Dónde guardarlas: Supabase Storage**, que ya viene incluido en el plan Pro (100 GB) y usa las mismas reglas de permisos que la base de datos.
- **Cómo optimizarlas: en el móvil, antes de subirlas**, con `expo-image-manipulator`:
  - Versión grande: 1600 px de ancho, WebP o JPEG al 75 %, unos 200-300 KB.
  - Miniatura: 600 px, unos 50-80 KB.
- **Cómo mostrarlas: `expo-image`**, que guarda las fotos en caché en el móvil y las va mostrando poco a poco con un desenfoque mientras cargan.
- **Imagen de stories: se genera en el móvil**. Se dibuja una tarjeta en React (foto + título + fecha), se convierte en imagen con `react-native-view-shot` y se comparte con el menú de compartir del sistema.

## Opciones consideradas

### Opción A: Supabase Storage + comprimir en el móvil (recomendada)

| Dimensión | Valoración |
|---|---|
| Complejidad | Baja |
| Coste/mes con 1.000 usuarios | **0 $ extra**: ~600 fotos al mes son menos de 1 GB, y ~15 GB de transferencia caben de sobra en los 250 GB del plan Pro |
| Coste/mes con 20.000 usuarios | **~0-5 $**: ~300 GB de transferencia al mes; el exceso sobre los 250 GB son unos 50 GB a ~0,09 $/GB |
| Escalabilidad | Buena, con la CDN de Supabase (red de servidores que entrega las fotos desde cerca del usuario) |
| Dificultad para aprender | **Baja** |

**Pros:** sin servicios extra ni facturas sorpresa, y las reglas de quién puede subir fotos son las mismas que las de la base de datos.
**Contras:** si mañana queremos un tamaño nuevo (por ejemplo, 300 px), habría que volver a procesar las fotos antiguas.

### Opción B: Supabase Storage + Image Transformations (Supabase redimensiona al servir)

| Dimensión | Valoración |
|---|---|
| Complejidad | Muy baja |
| Coste/mes con 1.000 usuarios | **~5-10 $**: 100 fotos originales incluidas y luego 5 $ por cada 1.000 |
| Coste/mes con 20.000 usuarios | **~40 $** (unas 8.000 fotos originales al mes) |
| Dificultad para aprender | **Muy baja**: se pide `?width=600` en la URL |

**Pros:** cualquier tamaño, cuando lo pidas, sin tocar las fotos guardadas.
**Contras:** cuesta más, y cuanto más subimos, más pagamos. Además, conviene comprimir en el móvil igualmente para que la subida sea rápida.

### Opción C: Cloudinary (o Cloudflare Images)

| Dimensión | Valoración |
|---|---|
| Complejidad | Media |
| Coste/mes con 1.000 usuarios | **0 $** (plan gratis) |
| Coste/mes con 20.000 usuarios | **~90 $** (plan de pago de Cloudinary); Cloudflare Images saldría más barato, por uso |
| Dificultad para aprender | **Media**: otra cuenta, otra clave y otras reglas de permisos |

**Pros:** el más potente: recortes inteligentes, formatos automáticos, efectos…
**Contras:** un servicio más que pagar y aprender, y los permisos ya no los controla la base de datos.

## Organización en Storage

```
planes/{plan_id}/{foto_id}-1600.webp      # público (si el plan es visible)
planes/{plan_id}/{foto_id}-600.webp
locales/{local_id}/logo-600.webp           # público
locales/{local_id}/portada-1600.webp
avatares/{user_id}/300.webp                # público
```

- **Quién sube**: solo los miembros del local (planes y local) o el propio usuario (avatar). Son las mismas reglas RLS que en `docs/system-design.md`.
- **Límites**: 10 MB por archivo, solo imágenes y un máximo de 6 fotos por plan.
- **Moderación**: las fotos se pueden reportar como el resto del contenido.

## Consecuencias

- **Más fácil:** todo en Supabase, coste casi nulo y app rápida porque las fotos ya llegan pequeñas.
- **Más difícil:** añadir un tamaño nuevo en el futuro.
- **A revisar:** si el feed necesita muchos tamaños distintos, activar Image Transformations (opción B).

## Acciones

1. [ ] Crear los buckets (carpetas de Storage) `planes`, `locales` y `avatares` con sus reglas.
2. [ ] Crear la función `subirFoto()`: comprimir, generar las dos versiones, subir y guardar en `fotos_plan`.
3. [ ] Usar `expo-image` en todas las imágenes, con `texto_alternativo`.
4. [ ] Hacer el prototipo de la imagen de stories con `react-native-view-shot`.
