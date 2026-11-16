# Revisión de seguridad (Fase 3, prompt 3.2)

> Fecha: 16 de noviembre de 2026. Revisión de todo el proyecto: base de datos, almacenamiento de fotos, app, configuración y repositorio.
> **Estado:** los arreglos de la base de datos están **preparados y probados en la rama `seguridad-fase-3`, sin aplicar**. El arreglo del login (S3) está **propuesto**, sin hacer. Ver «Qué falta decidir».

## Conclusión

**No hay nada crítico.** La base de datos aguanta los ataques importantes:
- Nadie puede hacerse admin.
- Nadie puede tocar los planes, fotos o locales de otro.
- Nadie puede ver la fecha de nacimiento ni los datos privados de otra persona.
- Nadie puede saltarse la edad mínima.
- No hay claves secretas en el código ni en el historial de git.

Sí hay **diez agujeros medianos y pequeños**, sobre todo de dos tipos:
- **Suplantación:** hacerse pasar por otro local o por otra persona.
- **Abuso:** inflar números o llenar de basura.

El más serio es de privacidad: **un local podía ver el nombre de quien pulsaba «Pillar entrada»** en sus planes.

## Cómo se ha revisado

1. **Leer todas las reglas.** Todas las reglas RLS, triggers y funciones de las 8 migraciones aplicadas, y el código de la app que habla con Supabase.
2. **Atacar la base de datos.** En la base de datos local de pruebas (la que imita a Supabase), con cuentas falsas: «Mala» (con su propio local), «Víctima», una cuenta sin fecha de nacimiento y alguien sin cuenta. Se ha intentado lo que haría alguien con mala intención: hacerse admin, editar planes ajenos, subir fotos a carpetas ajenas, verificar su propio local, leer datos privados, firmar a nombre de otro, inflar contadores…
3. **Buscar claves secretas** en los archivos y en todo el historial de git.
4. **Revisar las dependencias** con `npm audit`.
5. **Medir la velocidad** del feed y de «Cerca de mí» con 43.000 planes inventados (unos dos años de uso).

## Hallazgos, de más a menos grave

| # | Gravedad | Qué se podía hacer | Por qué importa | Arreglo | Estado |
|---|---|---|---|---|---|
| **S10** | 🟠 Media | **Un local veía quién pulsaba «Pillar entrada».** Pidiendo los clics directamente a la base de datos (no desde la app), salía el identificador de cada persona y, cruzándolo con los perfiles, su nombre | Datos personales sin permiso: el RGPD no lo permite. El local solo necesita el número | El local solo puede leer el plan y la hora de cada clic: lo justo para contarlos | Preparado |
| **S1** | 🟠 Media | **Meter a otra persona en tu local sin que lo sepa**, incluso como propietaria, y después salirte | La persona aparece como dueña de un local que no conoce y **no puede borrar su cuenta** (la app no deja borrarla a quien es la única propietaria de un local). Choca con el derecho a borrar tus datos | En la v1 no hay invitaciones: solo el equipo de Rotllo añade personas a un local. Cuando haya invitaciones, habrá que aceptarlas | Preparado |
| **S2** | 🟠 Media | **Cambiar el nombre de un local después de que Rotllo lo verifique**, por ejemplo a «Café Mercedes Jazz (oficial)» | La verificación pierde su valor: alguien se hace pasar por un local conocido con la marca de verificado | El nombre, la dirección web y la dirección de un local verificado solo los cambia el equipo. Lo demás (Instagram, descripción…) sí lo cambia el local | Preparado |
| **S3** | 🟠 Media | **Hacer entrar a alguien en tu cuenta sin que se dé cuenta.** Un enlace preparado con las llaves de la cuenta de la atacante (`rotllo.app/entrar/enlace#access_token=…`) abre Rotllo con esa sesión | La víctima cree que está en su cuenta: lo que guarde o el local que dé de alta acaban en la cuenta de la atacante, que lo ve todo. Se llama «login CSRF» | Cambiar el login al método **PKCE**: el enlace solo funciona en el móvil o navegador donde se pidió | **Propuesto** |
| **S4** | 🟡 Baja | **Reportes trucados:** al reportar se podía dejar la revisión ya rellenada («resuelto por el equipo»), y sin límite (500 en un segundo) | Ensuciar la cola de moderación cuando la haya. La app todavía no tiene botón de reportar | La revisión siempre empieza vacía y como mucho se mandan 20 reportes al día | Preparado |
| **S5** | 🟡 Baja | **Inflar los clics de «Pillar entrada»** sin cuenta, llamando a la función sin el identificador del móvil (300 llamadas, 300 clics) | El número que ve el local deja de valer | Sin cuenta ni identificador del móvil, el clic no cuenta (la app siempre lo manda). **Sigue abierto:** quien se invente identificadores puede inflarlo. Arreglarlo del todo pide contar por IP en el servidor (una Edge Function). El número es orientativo y así hay que decírselo al local | Preparado (en parte) |
| **S6** | 🟡 Baja | **Dar de alta 200 locales de golpe** | Llenar la lista de revisión del equipo | Como mucho 3 locales esperando revisión por persona. La app lo explica | Preparado |
| **S7** | 🟡 Baja | **Firmar un plan a nombre de otra persona** | Engañar en los registros internos de quién creó qué | El autor es siempre quien crea el plan y no se puede cambiar | Preparado |
| **S8** | 🟢 Muy baja | **Guardar una foto con una ruta rara** (`../avatares/…` o la dirección de otra web) | Que el cartel enseñe una imagen que no es del plan | Cada foto tiene que estar en la carpeta de su plan | Preparado |
| **S9** | 🟢 Muy baja | **Guardar un enlace de entradas que no es https** (`javascript:…`) si el plan está en «sin entradas» | La app no lo usaba, pero es una trampa para el futuro | El enlace, si lo hay, siempre es https | Preparado |

### Lo que se intentó y no se pudo (y está bien)

- Hacerse admin, aprobar tu propio local, activar tu perfil a mano, conectar Stripe o vender entradas «de Rotllo» sin permiso.
- Editar, borrar o mover planes de otro local. Meter fotos en planes ajenos o subir archivos a carpetas ajenas (también avatares de otras personas).
- Ver los datos privados de otros locales (razón social, NIF, email de contacto), sus miembros o sus clics.
- Ver la fecha de nacimiento de otra persona, ponerse una de menor de 18 o cambiarla después.
- Sin cuenta: ver perfiles, guardar favoritos, reportar, dar de alta un local, borrar cuentas.
- Una cuenta sin fecha de nacimiento: guardar favoritos, reportar o dar de alta un local.
- Pedir 100.000 planes de golpe: la base de datos da como mucho 100.

### Otras cosas revisadas

| Tema | Resultado |
|---|---|
| **Claves secretas** | ✅ Ninguna en el código ni en el historial de git. El `.env` está en el `.gitignore` y nunca se ha subido. Solo hay claves publicables (la de Supabase está hecha para ir en la app) |
| **Dependencias** (`npm audit`) | ✅ 5 avisos «moderados», todos en herramientas de desarrollo (la CLI de Expo, al buscar archivos). No van dentro de la app que se instala en el móvil. Se irán al actualizar Expo cuando saque una versión que los corrija (el arreglo que propone `npm audit` es volver a una versión vieja de Expo: no conviene) |
| **Velocidad con 43.000 planes** | ✅ Feed: unos 30 ms. «Cerca de mí»: unos 50 ms. Ficha de un plan: unos 9 ms. Crece despacio con los planes pasados; dentro de un par de años convendrá marcar como «terminados» los planes viejos con un trabajo nocturno (pg_cron) |
| **Webhooks de Stripe** | ➖ No aplica todavía: no hay pagos en la v1. Hay que revisarlo con la v2 (firma del webhook, importes calculados en el servidor y no en el móvil) |
| **Precios y cantidades** que llegan del móvil | ✅ La base de datos comprueba lo importante: precio ≥ 0, «gratis» sin precio, edad ≥ 18, fin después del inicio, cartel con valores de la lista cerrada, 6 fotos como mucho. Lo de vender por encima del aforo llegará con la v2 |
| **Perfiles públicos** | ℹ️ Cualquiera con cuenta puede llamarse «Equipo Rotllo». Hoy la app no enseña perfiles a nadie. Cuando los enseñe (jam, «Me apunto»), habrá que reservar nombres |

## Datos personales: qué se guarda, quién lo ve y qué pasa al borrar la cuenta

| Dato | Dónde | Quién lo ve | Al borrar la cuenta |
|---|---|---|---|
| Email | Supabase Auth | La persona y el equipo | Se borra |
| Fecha de nacimiento, idioma, estado | `perfiles_privados` | La persona y el equipo | Se borra |
| Nombre visible, usuario, foto (hoy vacíos) | `perfiles` | Cualquiera con cuenta | Se borra |
| Planes guardados | `favoritos` | Solo la persona | Se borran |
| Reportes que ha hecho | `reportes` | La persona y el equipo | Se borran |
| Clics en «Pillar entrada» | `clics_ticketera` | El local cuenta cuántos; **con S10 ya no ve de quién**. El equipo, todo | Se quedan, pero sin autor (anónimos) |
| Pertenencia a un local | `miembros_local` | Los miembros del local y el equipo | Se borra. No se puede borrar la cuenta si eres la única propietaria |
| Ubicación («Cerca de mí») | En ningún sitio | Nadie: se usa para ordenar y se olvida | — |

## Qué falta decidir

1. **Aplicar los arreglos de la base de datos** (S1, S2 y S4 a S10). Están en la rama `seguridad-fase-3`, con 32 tests nuevos y los 211 de la base de datos pasando. Al aplicarlos:
   - se sube la migración a Supabase y se junta la rama con `main`;
   - se comprueba contra el Supabase real que el panel del local sigue contando los clics.
2. **S3, el login con PKCE.** Cambia una cosa que se nota: **el enlace del correo solo funciona en el móvil o el navegador donde se pidió.** Ya lo decimos en la pantalla («Ábrelo en este mismo dispositivo»), pero hoy, si lo abres en otro, entra igual. Con PKCE saldría «Este enlace es de otro dispositivo». Recomiendo hacerlo antes de lanzar.
3. **S5 del todo.** Contar los clics por IP en una Edge Function. No corre prisa: mientras el número sea orientativo, basta con decirlo así en el panel.

## Cómo repetir la revisión

```bash
pg_ctlcluster 16 main start
su postgres -c "cd /tmp && bash scripts/db/probar.sh"   # 211 tests, entre ellos los de esta revisión (09_seguridad_fase_3)
npm audit --omit=dev
```
