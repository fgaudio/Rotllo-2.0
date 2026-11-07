# ADR-001: App móvil con Expo

**Estado:** Aceptado (decidido antes de este ADR; aquí se documentan los detalles)
**Fecha:** 2026-11-07
**Decide:** responsable de Rotllo

## Contexto

Rotllo es "móvil primero" y tiene que estar en App Store y Google Play. La persona que lo construye está aprendiendo y no quiere mantener dos apps distintas, una para iPhone y otra para Android. Además, la app necesita:

- Pagos (Stripe, en la v2) y mapas: son **módulos nativos**, es decir, código específico de iOS o Android que no viene en la app genérica Expo Go.
- Abrir un plan concreto desde un enlace de Instagram (`rotllo.app/p/123`): esto son los **deep links**.

## Decisión

- **Expo** (React Native con TypeScript): una sola base de código para iOS y Android.
- **Expo Router** para las pantallas. Cada archivo dentro de `app/` es una pantalla y su ruta (por ejemplo, `app/plan/[id].tsx` es `rotllo.app/p/…`). Como las rutas son URLs, los deep links salen casi gratis.
- **Development build** en lugar de Expo Go. Es "tu propia Expo Go", con los módulos nativos que necesitamos (Stripe y mapas). Se instala una vez en el móvil y luego los cambios de código se ven al instante, como en Expo Go.
- **EAS Build** para compilar en la nube y **EAS Submit** para enviar a las tiendas. Así no hace falta un Mac para la versión de iPhone.
- **Deep links**: universal links en iOS y App Links en Android, con el dominio `rotllo.app`, más una **web de respaldo** para quien no tiene la app (ver más abajo).

## Opciones consideradas

### Opción A: Expo + development build + EAS (elegida)

| Dimensión | Valoración |
|---|---|
| Complejidad | Media-baja |
| Coste/mes con 1.000 usuarios | 0 $ de Expo (plan gratis) + Apple 99 $/año + Google 25 $ una vez |
| Coste/mes con 20.000 usuarios | 0-19 $ (Starter) + uso, si queremos builds más rápidas o actualizaciones al momento (EAS Update) para muchos usuarios |
| Escalabilidad | Muy buena: la usan apps con millones de usuarios |
| Dificultad para aprender | **Baja-media**: JavaScript/TypeScript, documentación excelente y muchísimos ejemplos |

**Pros**
- Un solo código para iOS y Android (y web, para la página de respaldo).
- No necesitas Mac ni Xcode: EAS compila en la nube.
- Stripe (`@stripe/stripe-react-native`), los mapas y las notificaciones tienen soporte oficial para Expo.
- EAS Update permite arreglar un error de JavaScript sin esperar la revisión de Apple.

**Contras**
- Cada vez que se añade un módulo nativo nuevo hay que hacer otra development build, que tarda entre 10 y 20 minutos en la nube.
- En el plan gratis de EAS, las builds esperan en cola: pueden tardar más en horas punta.
- Algunas cosas muy específicas de iOS o Android requieren configuración nativa (los config plugins de Expo lo resuelven en la mayoría de casos).

### Opción B: Expo sin EAS (compilando en tu ordenador)

| Dimensión | Valoración |
|---|---|
| Complejidad | Alta |
| Coste/mes | 0 $, pero **necesitas un Mac** para iOS |
| Dificultad para aprender | **Alta**: Xcode, certificados de Apple, Android Studio, Gradle… |

**Pros:** builds sin colas y sin depender de un servicio externo.
**Contras:** requiere un Mac y pelearse con certificados y firmas. Para alguien que está aprendiendo es la mayor fuente de frustración.

### Opción C: Flutter o apps nativas (Swift + Kotlin)

| Dimensión | Valoración |
|---|---|
| Complejidad | Media (Flutter) / Muy alta (dos apps nativas) |
| Coste/mes | Parecido |
| Dificultad para aprender | **Media-alta**: lenguajes nuevos (Dart, o Swift y Kotlin) y menos ejemplos con Supabase y Stripe juntos |

**Contras:** no reaprovecha JavaScript. Con dos apps nativas, todo se hace dos veces.

## Deep links desde Instagram

Así llega alguien desde una story:

```
Story con enlace  →  rotllo.app/p/123
                     ├─ Tiene la app instalada  →  se abre la ficha del plan en la app
                     └─ No la tiene             →  ve la ficha en la web + botones "Abrir en la app" / "Descargar"
```

1. **Dominio** `rotllo.app` (o el que elijamos). Ahí se publican dos archivos que Apple y Google piden para confiar en la app: `apple-app-site-association` y `assetlinks.json`. Expo los configura desde `app.json`.
2. **Web de respaldo**: las mismas rutas de Expo Router exportadas como web, con la ficha del plan (solo lectura) y botones a las tiendas. Se aloja en EAS Hosting o Vercel; en su plan gratis basta al principio.
3. **Instagram abre los enlaces dentro de su propio navegador**, y desde ahí los universal links a menudo **no abren la app directamente**. Por eso la web de respaldo es imprescindible: tiene un botón "Abrir en Rotllo" que sí abre la app.
4. **Fuera del MVP**: los "deferred deep links" (instalar la app y que, al abrirla por primera vez, vaya directa al plan del enlace). Firebase Dynamic Links, que lo hacía gratis, cerró en agosto de 2025. Si lo necesitamos, hay servicios de pago como Branch.

## Consecuencias

- **Más fácil:** un solo código, builds sin Mac y enlaces que funcionan igual en la app y en la web.
- **Más difícil:** hay que acordarse de rehacer la development build cuando se añade un módulo nativo.
- **A revisar:** si las colas del plan gratis de EAS molestan, pasar a Starter (19 $/mes).

## Acciones

1. [ ] Crear las cuentas de Expo, Apple Developer (99 $/año) y Google Play (25 $).
2. [ ] Comprar el dominio y configurar los deep links (`associatedDomains` en iOS, `intentFilters` en Android).
3. [ ] Hacer la primera development build para iOS y Android.
4. [ ] Publicar la web de respaldo con la ficha de un plan.
