# Runbook: qué hacer cuando algo va mal

> Para el equipo de Rotllo. Cada caso: cómo se nota, qué mirar y qué hacer, paso a paso.
> Fecha: 16 de noviembre de 2026 (v1: sin pagos ni chat; esos casos están al final, para cuando existan).

## Antes de nada

- **El panel de Supabase** ([supabase.com/dashboard](https://supabase.com/dashboard), proyecto Rotllo) es donde se arregla casi todo.
- **El editor SQL del panel** (menú **SQL Editor**) entra con todos los permisos: **se salta las reglas de seguridad**. Úsalo con cuidado y **copia las consultas de este documento**, cambiando solo lo que va entre `<…>`.
- **Antes de borrar o cambiar algo a mano**, haz primero un `select` con la misma condición y mira que salen las filas que esperas.
- **Apunta lo que haces** (fecha, qué, por qué) en un documento compartido. Si hay que dar explicaciones a un local o a una persona, lo vas a necesitar.

### Dónde mirar

| Qué | Dónde |
|---|---|
| ¿Supabase funciona? | [status.supabase.com](https://status.supabase.com) |
| Errores de la base de datos, del login o de las fotos | Panel → **Logs** (Postgres, Auth, Storage) |
| Uso y límites del plan | Panel → **Reports** y **Usage** |
| Errores de la app en los móviles | Sentry, **cuando esté conectado** (pendiente) |

## 1. La app no enseña planes

**Cómo se nota:** el feed sale vacío o con «No hemos podido cargar los planes», a todo el mundo.

1. Mira [status.supabase.com](https://status.supabase.com). Si Supabase tiene problemas, no hay nada que hacer más que esperar. Avisa en Instagram si dura.
2. Mira si el proyecto está **pausado**. En el plan gratis, Supabase pausa el proyecto si pasa una semana sin uso. En el panel sale un botón **Restore**. (Con el plan Pro no pasa.)
3. Mira **Usage**: si se ha pasado algún límite del plan, Supabase puede cortar.
4. Si hay planes en la base de datos pero no salen, comprueba que están publicados, que no han terminado y que su local está verificado:

   ```sql
   select p.titulo, p.estado, p.empieza_en, l.nombre, l.estado_verificacion
   from planes p join locales l on l.id = p.local_id
   order by p.empieza_en desc limit 20;
   ```

5. Si sale vacío **solo con un filtro** («Hoy», «Este finde»), recuerda que el día va de 06:00 a 06:00, en hora de Valencia (`docs/revision-cto.md`).

## 2. No llega el correo para entrar

**Cómo se nota:** alguien escribe su email, sale «Mira tu correo» y no le llega nada.

1. Que mire en **correo no deseado**.
2. **Mientras no haya correo propio (SMTP), solo llegan correos al email del dueño de Supabase y muy pocos por hora.** Es lo esperado: para que le llegue a cualquiera hace falta el correo propio (`docs/lo-que-tienes-que-hacer.md`).
3. Panel → **Logs → Auth**: si sale `rate limit`, se han mandado demasiados. Hay que esperar o subir el límite (Authentication → Rate Limits).
4. Si dice «Ese enlace ya no vale»: los enlaces caducan y valen una vez. Algunos correos de empresa «abren» los enlaces para revisarlos y los gastan. Que pida otro.
5. Si el enlace abre una página que no es Rotllo: falta la dirección en **Authentication → URL Configuration → Redirect URLs** (`docs/login.md`).

## 3. Un local reclama

### «Mi plan no sale»

Busca el local y sus planes:

```sql
select l.nombre, l.estado_verificacion, l.motivo_rechazo, p.titulo, p.estado, p.empieza_en, p.termina_en
from locales l left join planes p on p.local_id = l.id
where l.nombre ilike '%<parte del nombre>%'
order by p.empieza_en desc;
```

| Si ves… | Es que… | Qué hacer |
|---|---|---|
| `estado_verificacion = pendiente` | El equipo no ha revisado el local | Revisarlo en la app: Perfil → «Locales por revisar» |
| `rechazado` | Se rechazó (el motivo está en `motivo_rechazo`) | Explicárselo. Si lo corrige, se puede aprobar |
| `suspendido` | El equipo lo suspendió | Ver el apartado 5 |
| `estado = borrador` | No le dio a «Publicar» | Que entre en Mi local y publique |
| `cancelado` | Lo canceló alguien del local | No se puede volver a publicar: que cree uno nuevo |
| La fecha ya pasó | Los planes terminados no salen (sin hora de fin, a las 6 h de empezar) | Nada |

### «Los clics de "Pillar entrada" no cuadran con mis ventas»

- El número es **orientativo**: cuenta como mucho un clic por persona (o por móvil, sin cuenta) por plan y por hora. Quien pulsa no tiene por qué comprar.
- No se le puede decir quién pulsó: **el local no tiene derecho a ver ese dato** (`docs/revision-seguridad.md`, S10).
- Para su propio control, el enlace de su ticketera lleva `utm_source=rotllo`: en las estadísticas de su ticketera ve las ventas que llegan desde Rotllo.

### «Quiero cambiar el nombre o la dirección de mi local»

Un local verificado no puede cambiarlos solo (para que nadie se haga pasar por otro). **Comprueba que quien lo pide es de verdad del local** (que escriba desde el email de contacto o el Instagram del local) y cámbialo tú:

```sql
update locales
set nombre = '<nombre nuevo>', direccion = '<dirección nueva>'
where id = '<id del local>';
```

Si cambia la dirección, cambia también el punto del mapa (la latitud y la longitud se pueden sacar de Google Maps, con clic derecho):

```sql
update locales
set ubicacion = extensions.st_setsrid(extensions.st_makepoint(<longitud>, <latitud>), 4326)::extensions.geography
where id = '<id del local>';
```

Ojo: va **primero la longitud** (en Valencia, unos -0,37) y **después la latitud** (unos 39,47).

### «Quiero que otra persona gestione mi local»

En la v1 lo hace el equipo. La otra persona tiene que tener cuenta en Rotllo con su fecha de nacimiento puesta. **Confirma con las dos personas** antes de hacerlo:

```sql
-- 1. El id de la otra persona, por su email
select id from auth.users where email = '<email de la otra persona>';

-- 2. Añadirla. rol: 'propietario' (todo), 'editor' (planes) o 'portero' (escanear entradas, v2)
insert into miembros_local (local_id, user_id, rol)
values ('<id del local>', '<id de la persona>', 'editor');
```

## 4. Alguien pide borrar su cuenta o sus datos

**Lo normal:** que lo haga desde la app (Perfil → Borrar cuenta). Se borra todo al momento.

**Si lo pide por email** (derecho de supresión del RGPD: hay **un mes** para responder):

1. Comprueba que escribe desde el mismo email de la cuenta.
2. Mira si es la única propietaria de algún local:

   ```sql
   select l.nombre
   from miembros_local m join locales l on l.id = m.local_id
   where m.user_id = (select id from auth.users where email = '<email>')
     and m.rol = 'propietario'
     and not exists (
       select 1 from miembros_local o
       where o.local_id = m.local_id and o.rol = 'propietario' and o.user_id <> m.user_id
     );
   ```

   Si sale algún local, pregúntale qué hacer con él: pasarlo a otra persona (apartado 3) o cerrarlo (apartado 5).
3. Panel → **Authentication → Users**, busca el email → **Delete user**. Se borra con él todo lo suyo: perfiles, guardados, reportes y su pertenencia a locales. Los planes que creó y sus clics se quedan, sin su nombre.
4. Si había subido fotos, se quedan en el plan del local, que es de quien son.
5. Contesta confirmando que está hecho.

**Si pide una copia de sus datos** (derecho de acceso):

```sql
select u.email, u.created_at, pp.fecha_nacimiento, pp.idioma, pp.estado,
       (select count(*) from favoritos f where f.user_id = u.id) as guardados,
       (select count(*) from reportes r where r.reportado_por = u.id) as reportes
from auth.users u join perfiles_privados pp on pp.id = u.id
where u.email = '<email>';
```

## 5. Moderar: un plan, un local o una persona

### Un plan inapropiado, engañoso o falso

Cancelarlo (sigue saliendo como «cancelado» para avisar a quien lo había guardado):

```sql
update planes set estado = 'cancelado', motivo_cancelacion = '<motivo>' where id = '<id del plan>';
```

Si hay que **quitarlo del todo** (contenido ilegal, por ejemplo):

```sql
delete from planes where id = '<id del plan>';
```

El id del plan sale en su enlace: `rotllo.app/p/<id>`.

### Un local que no cumple

Suspenderlo esconde **todos** sus planes al momento:

```sql
update locales set estado_verificacion = 'suspendido', motivo_rechazo = '<motivo>' where id = '<id del local>';
```

Para levantarlo, `estado_verificacion = 'verificado'`.

### Una persona que molesta, o un menor de edad

Suspender su perfil: puede seguir mirando planes, pero no guarda, no reporta ni da de alta locales.

```sql
update perfiles_privados set estado = 'suspendido'
where id = (select id from auth.users where email = '<email>');
```

**Si es menor de 18,** además hay que borrar su cuenta (apartado 4): no puede tener cuenta en Rotllo.

### Reportes

Todavía no hay botón de reportar en la app ni pantalla para revisarlos. Cuando lleguen, se miran así:

```sql
select creado_en, tipo_objetivo, objetivo_id, motivo, detalle from reportes
where estado = 'pendiente' order by creado_en;
```

## 6. Se ha filtrado una clave

| Clave | Qué pasa si se filtra | Qué hacer |
|---|---|---|
| **Secreta de Supabase** (`service_role` o `sb_secret_…`) | **Grave:** con ella se salta toda la seguridad | Al momento: Panel → **Project Settings → API Keys** → crea una nueva y **revoca la vieja**. Revisa en **Logs** qué se hizo con ella |
| Publicable de Supabase (la del `.env`) | Nada grave: está hecha para ir dentro de la app | No hace falta hacer nada |
| Google Maps de Android | Alguien gasta tu cuota de Google | Google Cloud → Credenciales → regenerarla. Debe estar restringida a la app `app.rotllo` |
| Token de Expo | Alguien puede compilar o publicar a tu nombre | expo.dev → Access tokens → revocarlo |

Si una clave llegó a subirse a git, **cambiarla es lo único que vale**. Borrarla del repositorio no basta: queda en el historial.

## 7. Un cambio de la base de datos ha salido mal

- **No se edita una migración ya aplicada.** Se escribe una migración nueva que lo deshace, se prueba con `scripts/db/probar.sh` y se aplica.
- **Copias de seguridad:**
  - Con el **plan Pro**, Supabase guarda copias diarias de los últimos 7 días (Panel → Database → Backups). Restaurar deja el proyecto **sin servicio un rato** y vuelve atrás **todo lo de después** de la copia.
  - En el **plan gratis no hay copias automáticas**: hay que hacerlas a mano (`supabase db dump`).
  - **Las fotos no van en las copias.**

## 8. Fuga de datos personales

**Cómo se nota:** alguien ve datos de otra persona (email, fecha de nacimiento, datos privados de un local), se filtra la clave secreta, o un aviso de Supabase o de un investigador.

1. **Cortar la fuga primero:** cambiar la clave filtrada (apartado 6), suspender lo que enseña los datos o, si hace falta, pausar el proyecto (Panel → Project Settings → General → Pause).
2. **Apuntar todo desde el primer minuto:** qué datos, de cuántas personas, desde cuándo, quién lo descubrió y qué se ha hecho. El RGPD obliga a guardar este registro aunque al final no haya que avisar a nadie.
3. **Avisar a la AEPD en 72 horas** desde que se sabe, si la fuga puede perjudicar a las personas (casi siempre que salgan emails o fechas de nacimiento). Se hace en la sede electrónica de la AEPD («Notificación de brechas de datos personales»). Si en 72 h no se sabe todo, se avisa con lo que se sepa y se completa después.
4. **Avisar a las personas afectadas**, en lenguaje claro, si el riesgo es alto: qué ha pasado, qué datos y qué pueden hacer.
5. **Arreglarlo con un test** que pruebe que ya no se puede (`supabase/tests/database/`), y contarlo en `docs/revision-seguridad.md`.

Lo que se le cuenta a la AEPD conviene revisarlo con el abogado.

## Cuando exista la v2

### Se caen los pagos (Stripe)

1. Mira [status.stripe.com](https://status.stripe.com).
2. Panel de Stripe → **Developers → Webhooks**: si los avisos a Rotllo fallan, se pueden reenviar desde ahí. Rotllo tiene que aceptarlos repetidos sin cobrar dos veces (`docs/test-plan.md`).
3. Mientras tanto, se puede pasar un plan a «enlace a la ticketera» para que no se pierdan ventas.

### Un local o una persona reclama un cobro

1. Busca el pago en el panel de Stripe por email o importe.
2. **Devolución:** desde Stripe (Payments → el pago → Refund). La entrada tiene que quedar anulada en Rotllo.
3. **Disputa** (la persona reclama a su banco): Stripe avisa por email. Hay pocos días para responder, con las pruebas: entrada, QR escaneado y hora de entrada.

### Moderar el chat de la jam

Con la jam llegarán reportar y bloquear mensajes, y el límite anti-spam. Este apartado se completa entonces.
