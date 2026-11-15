# «Cerca de mí»

**Estado:** construido el 15 de noviembre de 2026. Probado en el navegador; en un móvil de verdad, todavía no (no hay app de pruebas).

Capturas: `prototipos/cerca-de-mi/cerca.png`.

## Qué hace

Un chip en el feed, al lado de «Todo». Al tocarlo:

1. El móvil (o el navegador) pregunta si Rotllo puede ver la ubicación. Solo pregunta entonces, nunca al abrir la app.
2. La lista se reordena: **los días siguen en su sitio** (hoy, mañana, el sábado...) y, **dentro de cada día, sale primero lo más cercano**.
3. Cada plan dice a cuánto queda: «a 600 m», «a 2,3 km».

Se puede combinar con los demás filtros («Cerca de mí» + «Hoy» + «Fiesta»). Tocarlo otra vez lo quita. «Todo» también.

### Por qué ordena dentro de cada día y no todo junto

Si se ordenara todo por distancia, un plan de dentro de tres semanas a 200 m saldría antes que la fiesta de esta noche a 900 m. Lo que la gente quiere saber es «qué tengo cerca **hoy**». Por eso manda el día y, después, la cercanía.

No quita planes: no hay un límite de «a menos de X km». Valencia es pequeña y con pocos planes un límite dejaría la lista vacía. Si hace falta, se puede añadir más adelante.

## Qué pasa con la ubicación (privacidad)

| Pregunta | Respuesta |
|---|---|
| ¿Cuándo se pide? | Solo al tocar «Cerca de mí» (o el botón del mapa). Nunca de fondo ni con la app cerrada |
| ¿Con qué precisión se usa? | Redondeada a unos 100 m. El punto exacto no sale de la función que lo lee |
| ¿Sale del móvil? | Sí: la posición redondeada se manda a la base de datos para que ordene los planes |
| ¿Se guarda? | No. No hay ninguna tabla donde quepa. En el móvil solo está en memoria mientras «Cerca de mí» está puesto; al quitarlo, se olvida |
| ¿Hace falta cuenta? | No |

Esto hay que contarlo igual en la política de privacidad (apuntado en `docs/legal-checklist.md`).

### Si no hay permiso

Debajo de los filtros sale un aviso: «Rotllo no puede ver dónde estás», con «Abrir ajustes» (en el móvil) y «Probar otra vez». La lista se queda como estaba. Si hay permiso pero no hay señal, el aviso es «No hemos podido encontrarte».

## Cómo está hecho

| Pieza | Qué hace |
|---|---|
| `supabase/migrations/…_v1_cerca_de_mi.sql` | La función `buscar_planes_cerca`: los mismos filtros que `buscar_planes`, pero ordena por día y por distancia (PostGIS). Las reglas de los filtros pasan a `privado.planes_filtrados`, que comparten las dos |
| `src/lib/distancia.ts` | Cuentas: distancia entre dos puntos, redondeo de la posición y cómo se escribe («600 m», «1,2 km») |
| `src/lib/ubicacion.ts` | Pide el permiso, lee la posición y guarda el estado: apagada, buscando, lista, denegada o fallo. Las pantallas lo leen con `useUbicacion()` |
| `src/lib/filtros.ts` | El mismo orden para los datos de ejemplo |
| `src/components/AvisoUbicacion.tsx` | La nota de privacidad y los avisos de sin permiso o sin señal |
| `src/components/Chip.tsx`, `FilaPlan.tsx` | El chip con icono y la distancia en cada fila |
| `src/components/MapaPlanes*.tsx` | En el navegador, la lista por cercanía. En el móvil, el punto azul y un botón que acerca el mapa a donde está la persona |
| `app.config.ts` | El texto que enseña el iPhone al pedir el permiso. Solo se declara la ubicación «mientras se usa la app» |

Paquete nuevo: `expo-location`. Como es un paquete nativo, **hay que rehacer la app de pruebas** para verlo en el móvil. En el navegador funciona sin más.

## Qué se ha probado y qué no

- **Tests de la base de datos (13 nuevos, 179 en total):** el orden por día y distancia desde dos sitios de Valencia, la combinación con «hoy», «gratis», «este finde» y el tipo de plan, la paginación, las posiciones imposibles y que salen los mismos planes que en el feed normal.
- **Tests de la app (169 en total):** los mismos casos de orden con los datos de ejemplo, las distancias y cómo se escriben, y los estados de la ubicación (permiso dado, denegado, sin señal, quitarlo a medias, moverse).
- **En el navegador, con una posición simulada:** el orden y las distancias en el feed y en la pestaña Mapa, la combinación con «Gratis», el aviso sin permiso y el modo claro.
- **Contra el Supabase real:** la app manda la posición redondeada (39.47, -0.376) y la base de datos responde bien. Como aún no hay planes cargados, la respuesta es una lista vacía.
- **Sin probar:** todo en un iPhone o un Android (el aviso de permiso del sistema, «Abrir ajustes», el punto azul y el botón del mapa).

## Pendiente

- Verlo en un móvil de verdad.
- Decidir si hace falta un límite de distancia cuando haya muchos planes.
- Contarlo en la política de privacidad.
