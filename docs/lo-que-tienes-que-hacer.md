# Lo que tienes que hacer tú

Cosas que Claude no puede hacer por ti, porque piden entrar en tus cuentas, pagar o decidir. Están por orden: primero lo que desbloquea el trabajo ahora, después lo que hace falta antes de lanzar.

Última revisión: 16 de noviembre de 2026.

## Ahora

### 1. Decirle a Supabase que el enlace del correo puede volver a Rotllo (3 minutos)

**Para qué:** ahora se entra tocando el enlace que llega al correo (ya no hay código, así que no hay que tocar ninguna plantilla). Supabase solo devuelve a la gente a las direcciones que tú le apuntes en una lista. En el navegador ya funciona; este paso hace falta para la app instalada en el móvil.

1. Entra en [supabase.com/dashboard](https://supabase.com/dashboard) y abre el proyecto de Rotllo.
2. En el menú de la izquierda: **Authentication** → **URL Configuration**.
3. En **Redirect URLs**, toca **Add URL**, escribe `rotllo://**` y guarda.
4. Repite con `http://localhost:8081/**`.

No hace falta que avises: la app ya está preparada. La explicación completa está en `docs/login.md`.

**Para probarlo ya en el navegador:** sigue «Cómo probarlo tú» de `docs/login.md`. El correo llega en inglés y a nombre de «Supabase Auth»; se podrá cambiar cuando haya correo propio (tabla de «Antes de lanzar»).

### 2. Una cuenta de Expo, para ver la app en tu móvil (cuando se pueda)

**Para qué:** todo lo hecho hasta ahora está probado en el navegador. Falta verlo en un móvil de verdad: la galería de fotos, el mapa, que «Cómo llegar» abra la app de mapas, el menú de compartir, que el enlace del correo abra la app y el permiso de ubicación de «Cerca de mí».

**Estado (15 de noviembre):** Expo no te ha dejado crear la cuenta. No bloquea nada de momento: el trabajo sigue en el navegador. Cuando quieras reintentarlo:

1. Prueba en [expo.dev/signup](https://expo.dev/signup) con otro navegador o sin bloqueador de anuncios, o con «Continue with Google» o «Continue with GitHub». Si da un error, copia el texto del error y pásaselo a Claude.
2. Dentro, ve a los ajustes de tu cuenta → **Access tokens** → **Create token**. Ponle de nombre «Rotllo» y copia el texto que te da.
3. **No pegues ese texto en el chat.** Dile a Claude «tengo el token de Expo»: te abrirá un formulario seguro para guardarlo.
4. Con eso, Claude intentará lanzar la compilación de prueba para **Android**. Cuando termine, Expo da un enlace y un código QR para instalarla en el móvil.

**iPhone:** para instalar la app en un iPhone hace falta la cuenta de desarrollador de Apple (99 $ al año). Se puede dejar para más adelante y empezar por Android.

**Sin cuenta de Expo** también se puede compilar la app, pero en un ordenador tuyo con Android Studio instalado (gratis, pesa varios GB). Es más lento de preparar; si la cuenta sigue sin salir, Claude te guía.

Aviso: este camino no se ha recorrido todavía en este proyecto. Puede hacer falta algún ajuste por el camino.

### 3. El dominio `rotllo.app` (10 minutos y unos 15-20 € al año)

**Para qué:** los enlaces que comparte la app son `https://rotllo.app/p/…`. Hasta que el dominio sea tuyo y tenga la web publicada, esos enlaces no abren nada.

1. Mira si está libre en cualquier tienda de dominios (Cloudflare, Namecheap, Porkbun, IONOS…): escribe `rotllo.app` en su buscador.
2. Si está libre, cómpralo. Activa la renovación automática.
3. Dile a Claude dónde lo has comprado. Te dirá qué apuntar para publicar la web y para que los enlaces abran la app.

**Si no está libre:** elige otro (por ejemplo `rotllo.es` o `rotllovalencia.com`) y díselo a Claude. Cambiarlo en la app es una línea.

## Antes de lanzar

| Qué | Para qué | Coste | Depende de |
|---|---|---|---|
| **Correo propio (SMTP)**, por ejemplo con Resend | Hoy Supabase solo deja mandar correos a tu propia dirección, y pocos por hora. Sin esto, nadie más puede registrarse | Gratis hasta unos miles al mes | El dominio (punto 3) |
| **Clave de Google Maps para Android** | El mapa de la app en Android | Gratis con el uso previsto | Una cuenta de Google Cloud |
| **Cuenta de Sentry** | Enterarnos de los errores que le pasen a la gente | Gratis | — |
| **Google Play Console** | Publicar en Android | 25 $, una vez | — |
| **Apple Developer** | Publicar en iPhone y «Entrar con Apple» | 99 $ al año | — |
| **Plan Pro de Supabase** | Copias de seguridad y que el proyecto no se pause | 25 $ al mes | Cuando haya usuarios reales |
| **Protección de contraseñas filtradas** | Aviso de seguridad de Supabase (Authentication → ajustes) | Gratis | — |
| **Un abogado** | Revisar privacidad y condiciones (`docs/legal-checklist.md`) | Según el abogado | — |

Para cada una, dile a Claude «vamos con X» y te dará los pasos en ese momento.

La lista completa para el lanzamiento, con lo técnico, lo legal y lo de las tiendas, está en `docs/checklist-lanzamiento.md`.

## Lo que no es técnico (y es lo más importante)

Tu propia guía lo dice: el mayor riesgo de Rotllo no es el código, es que los locales publiquen. La meta antes de lanzar son **20-30 locales comprometidos**, con planes cargados para las primeras semanas.

Ya puedes enseñarles algo real: el panel donde dan de alta su local, crean un plan, diseñan su cartel o suben su flyer, y sacan la imagen para su Instagram. Las capturas están en `prototipos/panel-local/` y `prototipos/compartir/`.

## Lo que Claude puede seguir haciendo sin ti

- **Borradores de la política de privacidad, los términos y el aviso legal**, para que los revise el abogado.
- Mejoras del panel: repetir un plan cada semana, duplicarlo, varias fotos.
