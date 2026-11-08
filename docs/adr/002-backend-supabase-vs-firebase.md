# ADR-002: Backend, base de datos, login y tiempo real

**Estado:** Aceptado (2026-11-08)
**Fecha:** 2026-11-07
**Decide:** responsable de Rotllo

## Contexto

Rotllo necesita:

- **Base de datos** para usuarios, locales, planes, entradas, jams… Muchas de esas cosas están relacionadas entre sí: un plan pertenece a un local, una entrada a una compra… (ver `docs/system-design.md`).
- **Búsquedas por ubicación**: "planes a menos de 2 km".
- **Login** con email, Google y Apple. Apple lo exige en iOS si ofreces el login de Google.
- **Tiempo real** para el chat y las votaciones de la jam.
- **Reglas de seguridad fuertes**, porque hay dinero y entradas de por medio.
- **Datos en la UE**, por el RGPD.

El diseño ya está pensado con tablas relacionadas y reglas RLS (Row Level Security: reglas que deciden qué filas puede ver o cambiar cada persona).

## Decisión

**Supabase** (plan Pro), en una región de la UE (Fráncfort o París): Postgres + PostGIS, Auth, Storage, Realtime, Edge Functions y pg_cron.

## Opciones consideradas

### Opción A: Supabase (recomendada)

| Dimensión | Valoración |
|---|---|
| Complejidad | Media |
| Coste/mes con 1.000 usuarios | **25 $** (Pro). Incluye 100.000 usuarios activos al mes, 8 GB de base de datos, 250 GB de transferencia y 500 conexiones de tiempo real a la vez |
| Coste/mes con 20.000 usuarios | **~40-60 $**: Pro + un servidor de base de datos algo mayor. Las ~400 conexiones de tiempo real siguen dentro de las 500 incluidas (más allá: 10 $ por cada 1.000) |
| Escalabilidad | Buena para nuestro tamaño: se sube el servidor con un clic |
| Dificultad para aprender | **Media**: hay que aprender algo de SQL, pero tiene un panel visual (Studio) y la mayoría de ejemplos y la IA lo conocen bien |

**Pros**
- **Postgres** es una base de datos **relacional**, perfecta para "local → planes → tipos de entrada → compras → entradas".
- **Operaciones atómicas**: "vende la entrada solo si queda stock", "marca el QR como usado solo si aún era válido". Es justo lo que pide el diseño.
- **PostGIS** resuelve "planes cerca de mí" con una consulta.
- **RLS**: las reglas de seguridad viven en la base de datos, como ya está diseñado.
- Login con Google, Apple y email incluido.
- **Realtime** para el chat y los votos, respetando RLS.
- Precio fijo y predecible: el plan Pro tiene un tope de gasto activado por defecto.
- **Código abierto**: si un día hace falta, se puede llevar a otro Postgres sin reescribir la app.

**Contras**
- El plan gratis **se pausa tras 7 días sin actividad** y no tiene copias de seguridad, así que en producción hay que pagar Pro desde el primer día.
- Hay que aprender SQL y RLS. Una regla mal escrita puede exponer datos, así que conviene probarlas.
- El chat sin conexión ("escribo en el metro y se envía luego") no viene hecho.

### Opción B: Firebase (Firestore + Firebase Auth + Cloud Functions + FCM)

| Dimensión | Valoración |
|---|---|
| Complejidad | Baja al empezar, alta al crecer |
| Coste/mes con 1.000 usuarios | **~0-5 $**: cuota gratis diaria de 50.000 lecturas. Desde febrero de 2026, Storage exige el plan Blaze (de pago por uso) |
| Coste/mes con 20.000 usuarios | **~50-150 $, difícil de prever**: se paga por cada lectura (unos 0,03-0,06 $ por cada 100.000). El feed, el mapa y el chat leen mucho. Blaze no tiene tope de gasto por defecto |
| Escalabilidad | Excelente (Google) |
| Dificultad para aprender | **Baja al principio, alta después**: la base de datos NoSQL obliga a duplicar datos y a pensar de otra manera |

**Pros**
- Muy rápido para empezar; buen funcionamiento sin conexión y sincronización en tiempo real.
- Las notificaciones push (FCM) y las estadísticas están integradas.
- Login gratis hasta 50.000 usuarios activos al mes (email y redes sociales).

**Contras**
- **Firestore no tiene relaciones ni consultas cruzadas** (no hay "joins"). "Compras de los planes de mis locales con sus entradas" se convierte en varias consultas o en datos duplicados.
- **No tiene búsqueda geográfica nativa**: hay que usar trucos (geohash) y librerías aparte.
- Las reglas de seguridad son otro lenguaje, y la lógica del stock y del QR acaba en Cloud Functions.
- **El coste depende de cuántas veces se lee**: un error de programación (por ejemplo, una lista que se recarga sin parar) puede disparar la factura.
- Habría que rehacer el diseño de `docs/system-design.md`.

### (Mencionada) Opción C: Backend propio (Node + Postgres en un servidor)

Descartada para el MVP: hay que programar login, tiempo real, seguridad y copias de seguridad a mano. Es demasiado trabajo para alguien que está aprendiendo.

## Análisis

Lo que decide: **Rotllo maneja dinero y entradas**, donde las relaciones entre datos y las operaciones atómicas importan mucho, y **busca por ubicación**. Postgres lo hace de serie y Firestore obliga a rodeos. Firebase ganaría si la app fuera sobre todo chat sin conexión, pero el chat es solo una parte (y llega en v2).

## Consecuencias

- **Más fácil:** implementar el diseño tal cual; costes previsibles; el panel Studio para ver y editar datos.
- **Más difícil:** escribir y **probar** las reglas RLS (habrá tests de RLS en el proyecto).
- **A revisar:** con más de 500 personas conectadas a la vez al chat, o si la base de datos se queda pequeña, subir de servidor.

## Acciones

1. [ ] Crear el proyecto Supabase (Pro, región UE) y otro gratis para desarrollo.
2. [ ] Instalar la CLI de Supabase y gestionar las tablas con **migraciones**: archivos SQL versionados en git, así cada cambio de la base de datos queda guardado.
3. [ ] Guardar las claves en `.env` (nunca en el código). La clave `service_role` solo se usa en las Edge Functions, jamás en la app.
4. [ ] Activar copias de seguridad y el tope de gasto.
