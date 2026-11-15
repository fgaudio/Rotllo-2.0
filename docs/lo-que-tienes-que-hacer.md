# Lo que tienes que hacer tú

Cosas que Claude no puede hacer por ti, porque piden entrar en tus cuentas, pagar o decidir. Están por orden: primero lo que desbloquea el trabajo ahora, después lo que hace falta antes de lanzar.

Última revisión: 15 de noviembre de 2026.

## Ahora

### 1. Que el correo de Supabase mande un código (5 minutos)

**Para qué:** hoy nadie puede entrar en la app. El correo trae un enlace, y la app pide un código.

1. Entra en [supabase.com/dashboard](https://supabase.com/dashboard) y abre el proyecto de Rotllo.
2. En el menú de la izquierda: **Authentication** → **Emails** (puede llamarse «Email Templates»).
3. Abre la plantilla **Magic Link**. Borra lo que hay en el cuerpo y pega esto:

   ```html
   <h2>Tu código para entrar en Rotllo</h2>
   <p style="font-size:28px;letter-spacing:4px"><strong>{{ .Token }}</strong></p>
   <p>Escríbelo en la app. Caduca en unos minutos y solo vale una vez.</p>
   <p>Si no lo has pedido tú, no hagas nada.</p>
   ```

   En el asunto pon: `Tu código para entrar en Rotllo`. Guarda.
4. Abre la plantilla **Confirm signup** (la que llega a quien entra por primera vez) y haz lo mismo, con el mismo texto. Guarda.
5. En **Authentication** → **Sign In / Providers** → **Email**, busca **Email OTP Expiration** y pon `600` (10 minutos). Guarda.

**Cuando esté:** dile a Claude «plantilla hecha». Repetirá la prueba de entrar con el código de verdad.

Lo importante es `{{ .Token }}`: Supabase lo cambia por el código de cada persona. Es lo que indica su documentación para mandar un código en vez de un enlace.

### 2. Una cuenta de Expo, para ver la app en tu móvil (15 minutos)

**Para qué:** todo lo hecho hasta ahora está probado en el navegador. Falta verlo en un móvil de verdad: la galería de fotos, el mapa, que «Cómo llegar» abra la app de mapas y el menú de compartir.

1. Crea una cuenta gratis en [expo.dev](https://expo.dev) («Sign up»).
2. Dentro, ve a los ajustes de tu cuenta → **Access tokens** → **Create token**. Ponle de nombre «Rotllo» y copia el texto que te da.
3. **No pegues ese texto en el chat.** Dile a Claude «tengo el token de Expo»: te abrirá un formulario seguro para guardarlo.
4. Con eso, Claude intentará lanzar la compilación de prueba para **Android**. Cuando termine, Expo da un enlace y un código QR para instalarla en el móvil.

**iPhone:** para instalar la app en un iPhone hace falta la cuenta de desarrollador de Apple (99 $ al año). Se puede dejar para más adelante y empezar por Android.

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

## Lo que no es técnico (y es lo más importante)

Tu propia guía lo dice: el mayor riesgo de Rotllo no es el código, es que los locales publiquen. La meta antes de lanzar son **20-30 locales comprometidos**, con planes cargados para las primeras semanas.

Ya puedes enseñarles algo real: el panel donde dan de alta su local, crean un plan, diseñan su cartel o suben su flyer, y sacan la imagen para su Instagram. Las capturas están en `prototipos/panel-local/` y `prototipos/compartir/`.

## Lo que Claude puede seguir haciendo sin ti

- El módulo de **mapa**: planes cerca de ti, con el permiso de ubicación.
- La **fase 3** de tu guía: plan de tests, revisión de seguridad de todo el proyecto, README y guía para locales.
- Mejoras del panel: repetir un plan cada semana, duplicarlo, varias fotos.
