# Login y cuentas (módulo 1)

**Estado:** construido el 12 de noviembre de 2026. Falta un ajuste en el panel de Supabase para que el correo traiga el código (ver «Lo que tienes que hacer tú»).

## Cómo funciona

| Paso | Qué ve la persona | Qué pasa por detrás |
|---|---|---|
| 1. Email | Escribe su email y toca «Enviar código» | Supabase Auth manda un correo. Si el email es nuevo, crea la cuenta |
| 2. Código | Escribe el código del correo | Supabase lo comprueba y abre la sesión, que se guarda en el móvil |
| 3. Fecha de nacimiento | Solo la primera vez: día, mes y año | Se guarda en `perfiles_privados`. La base de datos comprueba los 18 años y pasa el perfil a `activo` |
| 4. Listo | Vuelve a Perfil, ya con su cuenta | Los planes guardados en el móvil se suben a su cuenta |

- **Sin contraseñas.** No hay nada que recordar ni que nos puedan robar.
- **Entrar es opcional.** La app se abre en los planes; a esta pantalla se llega desde Perfil.
- **Menores de 18:** la app avisa y no guarda la fecha. Al salir, se borra la cuenta recién creada (solo tenía el email). Si alguien se salta la app, la base de datos lo rechaza igual.
- **La fecha se pone una sola vez.** Para cambiarla hay que escribir a soporte (regla de la base de datos).
- **Apple y Google:** pendientes de que existan las cuentas de desarrollador. Hasta entonces no se enseñan esos botones.

## Cuenta y datos

- **Cerrar sesión** borra la sesión del móvil y vacía los guardados del móvil, para que no acaben en la cuenta de la siguiente persona que entre.
- **Borrar cuenta** (Perfil → Borrar cuenta, con confirmación). Lo exigen Apple, Google Play y el RGPD. Llama a la función `borrar_mi_cuenta()`:
  - Se borran el perfil, los guardados, los reportes hechos por esa persona y su pertenencia a locales.
  - Se quedan, pero sin autor: los planes y locales que creó y sus clics en «Pillar entrada».
  - Quien es la única persona propietaria de un local no puede borrarla: antes hay que pasar el local a otra persona.
- **Guardados:** con cuenta completa se guardan también en la tabla `favoritos`. Al entrar se juntan los del móvil con los de la cuenta.

## Dónde está cada cosa

| Archivo | Qué hace |
|---|---|
| `src/lib/auth.ts` | Enviar y comprobar el código, guardar la fecha, cerrar sesión y borrar la cuenta. Traduce los errores de Supabase a mensajes que se entienden |
| `src/lib/sesion.ts` | Quién está usando la app. Las pantallas lo leen con `useSesion()` |
| `src/lib/guardados.ts` | El corazón: guardados en el móvil y, con cuenta, también en `favoritos` |
| `src/app/entrar/` | Pantallas de entrar, email y código, y fecha de nacimiento |
| `src/app/(tabs)/perfil.tsx` | Entrar, o la cuenta si ya se ha entrado |
| `supabase/migrations/…_v1_borrar_mi_cuenta.sql` | La función que borra la cuenta |

## Lo que tienes que hacer tú en Supabase

En el panel del proyecto, en **Authentication**:

1. **Plantilla del correo** (Emails → Magic Link). Hoy manda un enlace y la app necesita un código. Cambia el asunto y el texto por algo así:

   - Asunto: `Tu código para entrar en Rotllo`
   - Texto:
     ```html
     <h2>Tu código para entrar en Rotllo</h2>
     <p style="font-size:28px;letter-spacing:4px"><strong>{{ .Token }}</strong></p>
     <p>Escríbelo en la app. Caduca en unos minutos y solo vale una vez.</p>
     <p>Si no lo has pedido tú, no hagas nada.</p>
     ```
   Lo importante es `{{ .Token }}`: ahí va el código. Conviene quitar el enlace para que nadie lo pulse por error.
2. **Lo mismo en la plantilla «Confirm signup»**, que es la que llega la primera vez que alguien entra con un email nuevo.
3. **Caducidad del código** (Sign In / Providers → Email → *Email OTP Expiration*): ponlo en 600 segundos (10 minutos). Cuanto menos dure, menos margen para adivinarlo.
4. **Correo propio (SMTP)**, pendiente desde la revisión de CTO. Con el correo de prueba de Supabase solo se puede escribir a tu propio email y pocas veces por hora: sirve para probar, no para lanzar.
5. **URL del sitio** (URL Configuration → Site URL): ahora es `http://localhost:8081`. Cuando exista `rotllo.app`, hay que ponerla ahí.

## Cómo probarlo tú

Después de cambiar la plantilla:

1. Abre la app y ve a **Perfil → Entrar → Seguir con email**.
2. Escribe tu email y toca **Enviar código**.
3. Mira el correo, copia el código y escríbelo. Debe llevarte a **¿Cuándo naciste?**.
4. Pon tu fecha de nacimiento de verdad (solo se puede una vez). Debe volver a **Perfil**, con tu email y sin «Te falta un paso».
5. Ve a **Planes**, toca el corazón de un plan y mira que sale en **Guardados**.
6. Cierra la app del todo y ábrela: tienes que seguir dentro.
7. **Perfil → Cerrar sesión.** Debe volver a salir «Entra en Rotllo» y Guardados debe quedar vacío.
8. Vuelve a entrar con el mismo email: el plan guardado tiene que volver.

## Qué se ha probado y qué no

- **Probado con tests automáticos:** los errores explicados según el paso, qué pantalla toca según la sesión, la mezcla de guardados y qué pasa con ellos al entrar y salir (90 tests de la app). En la base de datos: nadie guarda ni lee guardados ajenos, sin sesión no se borra nada, la única propietaria de un local no puede borrarse y al borrar la cuenta se va todo lo suyo (108 tests).
- **Probado contra el Supabase real, en el navegador:** enviar el correo, el aviso de email mal escrito, el rechazo de un código falso, la sesión abierta, «Te falta un paso», el aviso de menor de edad, que la sesión sigue tras recargar, la confirmación de borrar cuenta (sin llegar a borrarla) y cerrar sesión.
- **No probado todavía:** escribir un código de verdad (la plantilla aún manda un enlace; la sesión de la prueba se abrió con ese enlace), guardar una fecha de nacimiento real (es la tuya y solo se puede poner una vez), la subida de guardados a la cuenta (necesita el perfil completo) y todo ello en un iPhone o un Android.

## Revisión de seguridad

Hecha antes de subir el código. No apareció nada crítico: las reglas de la base de datos impiden por sí solas tocar datos de otra persona. Se corrigieron siete puntos; el más serio era que, al cerrar sesión con el perfil a medias, los guardados se quedaban en el móvil y podían acabar en la cuenta de la siguiente persona.

## Pendiente

- **Apple y Google** como formas de entrar.
- **Sentry**, para enterarnos de los errores que le pasen a la gente.
- **Guardar la sesión cifrada** en el móvil (`expo-secure-store`). Ahora se guarda como recomienda Supabase por defecto; cifrarla es un extra que pide rehacer la app de pruebas.
- **Un contacto de soporte** que enseñar en la app (hoy los mensajes dicen «escríbenos» sin decir dónde).
- **Borrar las fotos de perfil** al borrar la cuenta, cuando existan los avatares.
- **Quitar un guardado sin conexión:** si falla, al volver a entrar puede reaparecer.
