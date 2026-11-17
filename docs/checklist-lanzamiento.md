# Checklist de lanzamiento (Fase 3, prompt 3.4)

> Qué tiene que estar listo antes de abrir Rotllo al público, y qué hacer el día del lanzamiento y la semana siguiente.
> Fecha: 16 de noviembre de 2026. Responsable: Fran. Leyenda: ✅ hecho · 🟡 a medias · ⬜ por hacer.

## Dónde estamos

**La app de la v1 está construida y probada en el navegador.** Lo que falta para lanzar casi no es código: cuentas, dominio, correo, textos legales, probar en móviles de verdad y, sobre todo, **locales con planes**.

## 1. Bloqueantes: sin esto no se lanza

| | Qué | Por qué bloquea | Quién |
|---|---|---|---|
| ⬜ | **20-30 locales** dados de alta y verificados, con planes para las 3 primeras semanas | Una cartelera vacía no vuelve a abrirse. Es el riesgo principal de Rotllo | Fran |
| ⬜ | **Dominio** `rotllo.app` (u otro) | Los enlaces que se comparten (`rotllo.app/p/…`) no abren nada sin él | Fran |
| ⬜ | **Correo propio (SMTP)** conectado a Supabase, con el remitente de Rotllo | Hoy solo te llegan correos a ti: **nadie más puede entrar** | Fran (cuenta), Claude (configuración y plantillas en español) |
| ⬜ | **Plan Pro de Supabase** | Copias de seguridad diarias y que el proyecto no se pause | Fran |
| ✅ | **Arreglos de seguridad aplicados** (S1, S2, S4-S10) | Aplicados el 17 nov y comprobados contra el Supabase real | Hecho |
| ✅ | **Login con PKCE** (S3) | Evita que alguien te meta en su cuenta con un enlace preparado | Hecho el 16 nov |
| ⬜ | **Probado en un iPhone y un Android** con la lista de `docs/test-plan.md` | Nada se ha visto aún en un móvil: permisos, mapa, compartir, enlaces | Fran (cuenta de Expo) y Claude |
| 🟡 | **Política de privacidad, términos (usuarios y locales) y aviso legal**, revisados por un abogado | Lo exigen el RGPD, la LSSI y las dos tiendas | Borradores en `docs/legal/` (17 nov). Faltan los datos del titular y la revisión del abogado |
| ⬜ | **Un email de soporte** (por ejemplo, hola@rotllo.app) puesto en la app, la web y las tiendas | Lo piden el RGPD, la DSA y las tiendas, y la app dice «escríbenos» sin decir dónde | Fran |
| ⬜ | **Sentry** conectado | Si la app falla en el móvil de alguien, hoy no nos enteramos | Fran (cuenta), Claude |

## 2. Antes de mandar la app a las tiendas

| | Qué | Detalle |
|---|---|---|
| ⬜ | Cuentas de **Apple Developer** (99 $/año) y **Google Play Console** (25 $, una vez) | Google pide además una prueba cerrada con testers antes de publicar a todos en cuentas nuevas de particular |
| ⬜ | **Identificador de la app** `app.rotllo` confirmado | No se puede cambiar después de publicar (`app.config.ts`) |
| ⬜ | **Icono y pantalla de inicio** definitivos | Hoy son los de la plantilla de Expo |
| ⬜ | **Clave de Google Maps para Android**, restringida a la app | Sin ella, el mapa sale en gris en Android |
| ⬜ | **Universal links y App Links** con el dominio | Para que `rotllo.app/p/…` y el enlace del correo abran la app instalada (ADR-001) |
| ⬜ | Dirección `https://rotllo.app/**` en **Supabase → Redirect URLs**, y la Site URL cambiada | Si no, el enlace del correo no vuelve a la app ni a la web |
| ⬜ | **Clasificación por edad: 18+** en las dos tiendas | Se promociona ocio nocturno y alcohol |
| ⬜ | **Etiquetas de privacidad** (App Store) y **Seguridad de los datos** (Google Play) | Tienen que coincidir con la política de privacidad: email, fecha de nacimiento, ubicación aproximada sin guardar, fotos (locales) |
| ⬜ | **Cómo entra el revisor de Apple** | Apple pide poder probar todo, también el panel del local, y con el enlace por email no puede entrar. Lo más sencillo: añadir «Entrar con Apple» antes de enviar, o darle un correo de pruebas al que tenga acceso |
| ⬜ | **Textos y capturas de las fichas** en español e inglés | Claude puede prepararlos a partir de los prototipos |
| ✅ | **Borrar la cuenta desde la app** | Perfil → Borrar cuenta (Apple 5.1.1, Google Play) |
| ⬜ | **Enlace web para borrar la cuenta** | Google Play lo pide además del botón en la app |
| ✅ | **Permiso de ubicación** explicado y solo al usar «Cerca de mí» | |

## 3. Antes de lanzar: comprobaciones técnicas

| | Qué | Cómo |
|---|---|---|
| ✅ | Tests de la app y de la base de datos pasando | `npm test` y `scripts/db/probar.sh` |
| 🟡 | Tests automáticos en GitHub en verde | Primera ejecución pendiente de mirar en GitHub → Actions |
| ✅ | Prueba de humo en el navegador | `npm run e2e` |
| ⬜ | Avisos de seguridad de Supabase revisados | Panel → Advisors. Quedan los intencionados (funciones abiertas a propósito). La protección de contraseñas filtradas no hace nada porque no hay contraseñas, pero se puede activar para quitar el aviso |
| ⬜ | Límites de Auth (correos por hora) subidos para el lanzamiento | Authentication → Rate Limits, con el SMTP propio |
| ⬜ | **La web publicada** en el dominio | La versión web de Expo Router, para quien abre un enlace sin la app |
| ⬜ | **Copia de seguridad** hecha a mano justo antes | Panel → Database → Backups |
| ✅ | Runbook escrito | `docs/runbook.md` |
| ⬜ | Datos de prueba borrados de la base de datos real | Hoy está limpia: solo tu cuenta |

## 4. El día del lanzamiento

1. ⬜ Aplicar las migraciones pendientes y comprobar los avisos de Supabase.
2. ⬜ Compilar la versión de producción con EAS y mandarla a las tiendas. Hazlo unos días antes: la revisión de Apple y de Google no es inmediata.
3. ⬜ Publicar la web.
4. ⬜ Prueba de humo en producción, en un iPhone y un Android:
   - abrir la app;
   - ver un plan y «Cómo llegar»;
   - entrar con el enlace del correo;
   - guardar un plan;
   - «Pillar entrada»;
   - compartir en stories.
5. ⬜ Avisar a los locales para que compartan sus planes **ese mismo día**: cada historia suya es la mejor publicidad.
6. ⬜ Mirar Sentry y los logs de Supabase durante las primeras horas, sobre todo la primera noche de finde.

## 5. Cuándo dar marcha atrás

Decidido antes, para no improvisar:

| Si pasa esto | Se hace esto |
|---|---|
| Nadie puede entrar (los correos no llegan o el enlace no vuelve) | Avisar en Instagram. Mirar el apartado 2 del runbook. La app se puede seguir usando sin cuenta |
| La app se cierra sola en más del 2 % de las aperturas (Sentry) | Mandar una versión corregida y pedir a Apple una revisión urgente. Para poder corregir sin pasar por las tiendas hace falta `expo-updates` (EAS Update), que aún no está: conviene añadirlo antes de lanzar |
| Se ve un dato privado de otra persona | **Parar.** Suspender lo que lo enseña, avisar a la AEPD en 72 h si hubo fuga (runbook, apartado 8) y arreglarlo con un test que lo pruebe |
| Una migración rompe el feed | Migración nueva que la deshace. En el peor caso, restaurar la copia de antes del lanzamiento |

## 6. La primera semana

- ⬜ Revisar a diario los locales nuevos (Perfil → «Locales por revisar»).
- ⬜ Contestar todo lo que llegue al email de soporte en menos de 24 h.
- ⬜ Hablar con 5 locales: ¿les llega gente? ¿Qué les falta?
- ⬜ Apuntar qué filtros y qué planes se miran más, para la Fase 4 (analítica, prompt 4.1).
