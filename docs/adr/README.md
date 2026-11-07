# Decisiones de arquitectura (ADR)

Un **ADR** (Architecture Decision Record) es una ficha corta que explica una decisión técnica: qué opciones había, cuál elegimos y por qué. Sirve para que dentro de seis meses nadie se pregunte "¿por qué hicimos esto así?".

| # | Decisión | Recomendación | Estado |
|---|---|---|---|
| [001](001-app-movil-expo.md) | App móvil | Expo + Expo Router + development build + EAS + deep links con web de respaldo | Aceptado |
| [002](002-backend-supabase-vs-firebase.md) | Backend, base de datos, login y tiempo real | Supabase | Propuesto |
| [003](003-entradas-ticketeras-y-stripe-connect.md) | Entradas | v1: enlace a la ticketera del local · v2: Stripe Connect | Propuesto |
| [004](004-mapa-y-como-llegar.md) | Mapa y "Cómo llegar" | `react-native-maps` (Apple Maps en iOS, Google Maps en Android) + enlaces a las apps de mapas | Propuesto |
| [005](005-imagenes.md) | Imágenes | Supabase Storage, comprimidas en el móvil antes de subirlas, y `expo-image` para mostrarlas | Propuesto |
| [006](006-notificaciones-push.md) | Notificaciones push | Servicio de push de Expo | Propuesto |

## Supuestos de uso para los costes

Para poder comparar, todos los ADR usan los mismos dos escenarios:

| | 1.000 usuarios | 20.000 usuarios |
|---|---|---|
| Usuarios activos al mes | ~700 | ~12.000 |
| Locales activos | ~30 | ~300 |
| Planes publicados al mes | ~150 | ~2.000 |
| Fotos subidas al mes | ~600 | ~8.000 |
| Entradas vendidas al mes (v2) | ~300 | ~6.000 |
| Personas conectadas a la vez en hora punta (chat y votos) | ~50 | ~400 |

**Ojo con los precios.** Están revisados en noviembre de 2026, pero cambian a menudo. Muchos proveedores cobran en dólares ($); a efectos prácticos, cuenta más o menos lo mismo en euros. Antes de dar de alta cada servicio, conviene comprobar su página de precios.

## Coste fijo mínimo (todo junto)

| Concepto | 1.000 usuarios | 20.000 usuarios |
|---|---|---|
| Apple Developer Program | ~8 $/mes (99 $/año) | ~8 $/mes |
| Google Play | 25 $ una sola vez | — |
| Dominio (por ejemplo, `rotllo.app`) | ~1-2 €/mes | ~1-2 €/mes |
| Supabase (ADR-002) | 25 $ | ~40-60 $ |
| Expo EAS (ADR-001) | 0 $ | 0-19 $ + uso |
| Mapas (ADR-004) | 0 $ | 0 $ |
| Imágenes (ADR-005) | 0 $ (incluido en Supabase) | ~0-5 $ |
| Push (ADR-006) | 0 $ | 0 $ |
| **Total aproximado** | **~35 $/mes** | **~50-95 $/mes** |

Lo que cobra Stripe por cada venta no está en esta tabla, porque depende de lo que se venda. Se explica en el ADR-003.
