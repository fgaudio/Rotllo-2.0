# ADR-006: Notificaciones push

**Estado:** Propuesto (se construye después de la v1, como dice `CLAUDE.md`)
**Fecha:** 2026-11-07
**Decide:** responsable de Rotllo

## Contexto

Las notificaciones push llegan más tarde, pero conviene elegir ya el sistema para que la base de datos y la app estén preparadas. Usos previstos:

- **Entradas (v2):** "Tu entrada está lista", "El plan se ha cancelado y te devolvemos el dinero", "Hoy es la fiesta: tu QR está en Mis entradas".
- **Jam (v2):** "Marta ha escrito en Salsa el sábado", "Nueva votación: ¿dónde cenamos?".
- **Favoritos:** "El plan que guardaste es mañana".
- **Locales:** "Tu local ya está verificado".

Por debajo, en iPhone siempre pasa por **APNs** (el servicio de Apple) y en Android por **FCM** (el de Google). Lo que elegimos es quién habla con ellos por nosotros.

## Decisión (propuesta)

El **servicio de push de Expo** (`expo-notifications`). Las notificaciones se envían desde Supabase: una Edge Function o un aviso automático de la base de datos (por ejemplo, cuando un plan pasa a `cancelado`).

## Opciones consideradas

### Opción A: Servicio de push de Expo (recomendada)

| Dimensión | Valoración |
|---|---|
| Complejidad | Baja |
| Coste/mes con 1.000 usuarios | **0 $** |
| Coste/mes con 20.000 usuarios | **0 $** (el servicio es gratis; tiene un límite de unos 600 envíos por segundo, de sobra para nosotros) |
| Escalabilidad | Buena para nuestro tamaño |
| Dificultad para aprender | **Baja**: un solo "token" por móvil y una sola llamada para enviar a iPhone y a Android |

**Pros:** está integrado con EAS, que gestiona las credenciales de Apple y Google. Es la forma más sencilla con Expo.
**Contras:** no trae panel de campañas (por ejemplo, "enviar a todos los de Russafa") ni estadísticas de apertura. Habría que hacerlo nosotros si llega a hacer falta.

### Opción B: Firebase Cloud Messaging (FCM) directo

| Dimensión | Valoración |
|---|---|
| Complejidad | Media |
| Coste/mes | **0 $** con 1.000 y con 20.000 usuarios |
| Dificultad para aprender | **Media**: hay que configurar Firebase aunque el backend sea Supabase, y en iOS conectar APNs con FCM |

**Pros:** es gratis, sin intermediario, y tiene temas ("topics") para enviar a grupos.
**Contras:** añade todo un proyecto de Firebase solo para esto, con más configuración nativa.

### Opción C: OneSignal

| Dimensión | Valoración |
|---|---|
| Complejidad | Media-baja |
| Coste/mes con 1.000 usuarios | **0 $** (plan gratis para push en móvil) |
| Coste/mes con 20.000 usuarios | **0 $** si solo enviamos push básicos; los planes de pago empiezan cuando quieres segmentación avanzada o funciones de marketing |
| Dificultad para aprender | **Baja-media** |

**Pros:** panel para enviar campañas sin programar, segmentos y estadísticas.
**Contras:** un servicio externo más, los datos de los usuarios en otro sitio (hay que mirarlo por el RGPD) y su propio SDK nativo.

## Lo que necesita el diseño

Una tabla nueva en `docs/system-design.md`:

**`dispositivos_push`**

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid → perfiles | |
| `token` | text único | El token de Expo de ese móvil. |
| `plataforma` | enum `ios`/`android` | |
| `activo` | bool | Se pone a `false` si Expo dice que el token ya no vale. |
| `actualizado_en` | timestamptz | |

Y unas **preferencias por usuario**: jam sí/no, recordatorios sí/no y novedades sí/no.

**Buenas prácticas:**
- Pedir permiso para enviar notificaciones **en el momento útil** ("¿Te avisamos cuando tu entrada esté lista?"), no nada más abrir la app.
- Que las notificaciones de la jam se agrupen, para no mandar 40 avisos seguidos.

## Consecuencias

- **Más fácil:** con un solo sistema enviamos a iOS y a Android, sin coste.
- **Más difícil:** las campañas de marketing habría que programarlas nosotros.
- **A revisar:** si el equipo quiere lanzar campañas sin programar, valorar OneSignal.

## Acciones (cuando toque)

1. [ ] Añadir `expo-notifications` y la tabla `dispositivos_push`.
2. [ ] Crear la Edge Function `enviar-push` y llamarla desde los eventos (compra pagada, plan cancelado, mensaje en una jam).
3. [ ] Añadir la pantalla de preferencias de notificaciones.
