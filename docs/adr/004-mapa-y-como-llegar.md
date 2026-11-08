# ADR-004: Mapa y "Cómo llegar"

**Estado:** Aceptado (2026-11-08)
**Fecha:** 2026-11-07
**Decide:** responsable de Rotllo

## Contexto

En Rotllo, los mapas sirven para tres cosas:

1. **Mapa de planes**: puntos en Valencia; al tocar uno, se abre la ficha. Lo usa casi todo el mundo.
2. **"Cómo llegar"**: abrir Google Maps o Apple Maps con la dirección del plan. Las indicaciones paso a paso **no** las hacemos nosotros.
3. **Escribir la dirección** al dar de alta un local o un plan (autocompletar y convertirla en coordenadas). Esto lo usan solo los locales, así que hay pocas peticiones.

## Decisión

- **Mapa**: `react-native-maps` con el proveedor nativo de cada móvil: **Apple Maps en iPhone y Google Maps en Android**. Los dos son **gratis y sin límite** dentro de apps móviles.
- **Cómo llegar**: abrir un enlace a la app de mapas, también gratis:
  - iPhone: `https://maps.apple.com/?daddr=<dirección>`
  - Android: `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`
- **Escribir direcciones** (solo en el panel de locales): Google Places Autocomplete, que entra en la cuota gratuita mensual con nuestro volumen.

## Opciones consideradas

### Opción A: `react-native-maps` con Apple Maps (iOS) y Google Maps (Android) (recomendada)

| Dimensión | Valoración |
|---|---|
| Complejidad | Baja |
| Coste/mes con 1.000 usuarios | **0 $**. El SDK de mapas de Google para Android e iOS es gratis e ilimitado, y Apple Maps también |
| Coste/mes con 20.000 usuarios | **0 $** (las direcciones de los locales caben en la cuota gratis) |
| Escalabilidad | Muy buena |
| Dificultad para aprender | **Baja**: es la librería de mapas más usada en React Native y funciona con Expo |

**Pros:** gratis, lo más sencillo de configurar y el mapa "de siempre" que la gente ya conoce en su móvil.
**Contras:** el mapa se ve distinto en iPhone y en Android. En Android se puede personalizar el estilo con colores de Rotllo; en iPhone, mucho menos.

### Opción B: `react-native-maps` con Google Maps en los dos sistemas

| Dimensión | Valoración |
|---|---|
| Complejidad | Baja-media (en iOS hay que configurar la clave de Google) |
| Coste/mes | **0 $** con 1.000 y con 20.000 usuarios (los mapas en móvil siguen siendo gratis) |
| Dificultad para aprender | **Baja-media** |

**Pros:** el mismo mapa y el mismo estilo de marca en los dos sistemas.
**Contras:** una clave de API más que proteger (restringida a nuestra app) y algo más de configuración en iOS.

### Opción C: Mapbox (`@rnmapbox/maps`)

| Dimensión | Valoración |
|---|---|
| Complejidad | Media |
| Coste/mes con 1.000 usuarios | **0 $** (25.000 usuarios del mapa al mes gratis, según fuentes no oficiales) |
| Coste/mes con 20.000 usuarios | **0 $** mientras no pasemos de unos 25.000 usuarios que abren el mapa. A partir de ahí, ~4 $ por cada 1.000 |
| Escalabilidad | Muy buena |
| Dificultad para aprender | **Media**: SDK propio, estilos con Mapbox Studio y token secreto para descargar el SDK al compilar |

**Pros:** el mapa más personalizable (colores de Rotllo, iconos, modo noche) y el mismo en iOS y Android.
**Contras:** se paga en cuanto crecemos, y la configuración es más compleja. Además, "Cómo llegar" seguiría abriendo Google o Apple Maps, porque es lo que la gente usa para ir.

## Análisis

En el MVP, el mapa es una herramienta, no la seña de identidad. Lo que diferencia a Rotllo son los planes y el tono. La opción A es gratis y la más simple. Si más adelante queremos un mapa con marca muy propia, la opción B cambia poco código (se cambia el proveedor) y la C es el paso grande.

## Consecuencias

- **Más fácil:** cero coste y cero cuentas extra para el mapa.
- **Más difícil:** el estilo de marca en el mapa de iPhone es limitado.
- **A revisar:** si el diseño pide un mapa propio, pasar a la opción B; si además piden modo noche o 3D, a Mapbox.

## Acciones

1. [ ] Instalar `react-native-maps` y crear la clave de Google Maps para Android, restringida a la app.
2. [ ] Crear el componente `BotonComoLlegar` con los enlaces de Apple y Google.
3. [ ] Google Places Autocomplete solo en el panel de locales, con alertas de presupuesto en Google Cloud.
4. [ ] Agrupar los puntos cercanos del mapa cuando haya muchos planes (más adelante).
