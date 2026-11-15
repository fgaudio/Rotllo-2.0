# Login y cuentas (módulo 1)

**Estado:** construido el 12 de noviembre de 2026. Desde el 15 de noviembre se entra con el **enlace del correo**, sin código. En el navegador ya funciona; para la app instalada en el móvil falta un ajuste en el panel de Supabase (ver «Lo que tienes que hacer tú»).

## Cómo funciona

| Paso | Qué ve la persona | Qué pasa por detrás |
|---|---|---|
| 1. Email | Escribe su email y toca «Enviar enlace» | Supabase Auth manda un correo con un enlace. Si el email es nuevo, crea la cuenta |
| 2. Correo | La app dice «Mira tu correo». Abre el correo y toca el enlace | Supabase comprueba el enlace y devuelve a la persona a Rotllo, a `/entrar/enlace`, con las llaves de la sesión |
| 3. Entrando | Un momento de «Entrando…» | La app guarda la sesión en el móvil |
| 4. Fecha de nacimiento | Solo la primera vez: día, mes y año | Se guarda en `perfiles_privados`. La base de datos comprueba los 18 años y pasa el perfil a `activo` |
| 5. Listo | Vuelve a Perfil, ya con su cuenta | Los planes guardados en el móvil se suben a su cuenta |

Capturas: `prototipos/login/enlace.png`.

### Por qué un enlace y no un código

La primera versión pedía un código de 6 cifras. Para que el correo traiga un código hay que cambiar la plantilla del correo, y Supabase no deja cambiarla sin un servicio de correo propio (SMTP). El correo que Supabase manda por defecto trae un enlace, así que la app usa ese enlace.

- **A favor:** funciona hoy, sin tocar plantillas, y no hay que copiar nada: un toque y dentro.
- **En contra:** el enlace hay que abrirlo en el mismo dispositivo donde está Rotllo. Y algunos correos de empresa «visitan» los enlaces para revisarlos, lo que gasta el enlace antes de que la persona lo toque. Si pasa, la app lo explica y ofrece pedir otro.
- **El correo llega en inglés** («Confirm your email address» la primera vez; las siguientes, uno parecido para iniciar sesión) y a nombre de «Supabase Auth». Cambiarlo también pide el correo propio.

### Cómo vuelve el enlace a la app

Al pedir el enlace, la app le dice a Supabase a dónde tiene que devolver a la persona:

| Dónde se usa Rotllo | Dirección de vuelta |
|---|---|
| Navegador | `https://<la web>/entrar/enlace` (en pruebas, `http://localhost:8081/entrar/enlace`) |
| App instalada | `rotllo://entrar/enlace` |

Supabase solo acepta direcciones que estén en su lista de **Redirect URLs**. Si la dirección no está en la lista, manda a la persona a la «URL del sitio», que no es Rotllo. Por eso hay que añadirlas (ver más abajo).

Cuando exista el dominio, la app instalada usará también `https://rotllo.app/entrar/enlace`: así el enlace abre la app si está instalada y la web si no.

- **Sin contraseñas ni códigos.** No hay nada que recordar ni que nos puedan robar.
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
| `src/lib/auth.ts` | Pedir el enlace, leer las llaves con las que vuelve y abrir la sesión; guardar la fecha, cerrar sesión y borrar la cuenta. Traduce los errores de Supabase a mensajes que se entienden |
| `src/lib/sesion.ts` | Quién está usando la app. Las pantallas lo leen con `useSesion()` |
| `src/lib/guardados.ts` | El corazón: guardados en el móvil y, con cuenta, también en `favoritos` |
| `src/app/entrar/` | Pantallas de entrar, email (`email.tsx`), llegada del enlace (`enlace.tsx`) y fecha de nacimiento (`edad.tsx`) |
| `src/app/(tabs)/perfil.tsx` | Entrar, o la cuenta si ya se ha entrado |
| `supabase/migrations/…_v1_borrar_mi_cuenta.sql` | La función que borra la cuenta |

## Lo que tienes que hacer tú en Supabase

En el panel del proyecto, en **Authentication → URL Configuration**:

1. **Redirect URLs** → «Add URL». Añade estas dos, una a una:
   - `rotllo://**` (para la app instalada en el móvil)
   - `http://localhost:8081/**` (para las pruebas en el navegador)
2. **Site URL:** déjala como está por ahora. Cuando exista `rotllo.app`, se cambia a `https://rotllo.app` y se añade `https://rotllo.app/**` a la lista de arriba.

Y más adelante, antes de lanzar:

3. **Correo propio (SMTP).** Con el correo de prueba de Supabase solo se puede escribir a tu propio email y pocas veces por hora: sirve para probar, no para lanzar. Con correo propio también se podrá poner el correo en español y con el nombre de Rotllo.

## Cómo probarlo tú

En el navegador (con `npm run web`):

1. Ve a **Perfil → Entrar → Seguir con email**.
2. Escribe tu email y toca **Enviar enlace**. Debe salir **Mira tu correo**.
3. Abre el correo de «Supabase Auth» en ese mismo ordenador y toca el enlace. Se abre Rotllo, dice «Entrando…» y te lleva a **¿Cuándo naciste?**.
4. Pon tu fecha de nacimiento de verdad (solo se puede una vez). Debe volver a **Perfil**, con tu email y sin «Te falta un paso».
5. Ve a **Planes**, toca el corazón de un plan y mira que sale en **Guardados**.
6. Cierra la pestaña y vuelve a abrir Rotllo: tienes que seguir dentro.
7. **Perfil → Cerrar sesión.** Debe volver a salir «Entra en Rotllo» y Guardados debe quedar vacío.
8. Toca otra vez el enlace del correo: debe decir **Ese enlace ya no vale**.
9. Vuelve a entrar con el mismo email: el plan guardado tiene que volver.

Supabase deja pedir muy pocos correos por hora con el correo de prueba. Si sale «Demasiados intentos», espera una hora.

## Qué se ha probado y qué no

- **Probado con tests automáticos:** los errores explicados según el paso, qué pantalla toca según la sesión, la mezcla de guardados y qué pasa con ellos al entrar y salir (90 tests de la app). En la base de datos: nadie guarda ni lee guardados ajenos, sin sesión no se borra nada, la única propietaria de un local no puede borrarse y al borrar la cuenta se va todo lo suyo (108 tests).
- **Probado contra el Supabase real, en el navegador:** enviar el correo, el aviso de email mal escrito, la sesión abierta, «Te falta un paso», el aviso de menor de edad, que la sesión sigue tras recargar, la confirmación de borrar cuenta (sin llegar a borrarla) y cerrar sesión.
- **Probado después, con una cuenta de prueba** (un alias del correo de Fran, ya borrada): guardar la fecha de nacimiento y que el perfil quede completo; que el corazón guarde el plan en la cuenta (tabla `favoritos`); que la app no deje borrar la cuenta a quien es el único dueño de un local, y lo explique; y borrar la cuenta desde Perfil, tras lo cual no queda nada suyo en la base de datos.
- **El enlace del correo, de principio a fin** (15 de noviembre, con la cuenta de prueba): se pide el enlace desde la app, llega el correo, se abre el enlace y Rotllo inicia la sesión y pasa a la fecha de nacimiento. La pestaña que se había quedado en «Mira tu correo» también entra sola. Las llaves no se quedan en la dirección del navegador. El mismo enlace, usado por segunda vez, enseña «Ese enlace ya no vale» y «Pedir otro enlace» lleva a pedirlo. La cuenta de prueba se borró al terminar.
- **No probado todavía:** el enlace en la app instalada en un iPhone o un Android (`rotllo://…`). Depende de añadir la dirección en Supabase y de tener la app de pruebas en el móvil. Tampoco el enlace que recibe una cuenta que ya existía: usa el mismo camino, pero no se ha gastado otro correo en comprobarlo.

## Revisión de seguridad

Hecha antes de subir el código. No apareció nada crítico: las reglas de la base de datos impiden por sí solas tocar datos de otra persona. Se corrigieron siete puntos; el más serio era que, al cerrar sesión con el perfil a medias, los guardados se quedaban en el móvil y podían acabar en la cuenta de la siguiente persona.

## Pendiente

- **Apple y Google** como formas de entrar.
- **Sentry**, para enterarnos de los errores que le pasen a la gente.
- **Guardar la sesión cifrada** en el móvil (`expo-secure-store`). Ahora se guarda como recomienda Supabase por defecto; cifrarla es un extra que pide rehacer la app de pruebas.
- **Un contacto de soporte** que enseñar en la app (hoy los mensajes dicen «escríbenos» sin decir dónde).
- **Borrar las fotos de perfil** al borrar la cuenta, cuando existan los avatares.
- **Quitar un guardado sin conexión:** si falla, al volver a entrar puede reaparecer.
