# Revisión crítica del sistema (prompt 1.2)

> Fecha: 2026-11-08. Revisión de `docs/system-design.md` **y de lo ya construido** (migraciones, app). Estado: **puntos 2, 3, 4, 5 y 7 aplicados** (migración `20261108215008_v1_feed_y_clics`). Pendientes: SMTP propio y plan Pro (los haces tú en el panel) y Sentry (con el módulo de login).

**Conclusión:** el diseño aguanta 5.000 usuarios un sábado por la noche sin cambiar de arquitectura. Lo que se rompería antes no es la base de datos, sino cuatro cosas más pequeñas:
- Los **emails de registro**.
- El **filtro "Hoy" de madrugada**.
- Un **feed sin límite de resultados**.
- **No enterarnos** cuando algo falla.

Sobrediseño hay poco, y casi todo está en los documentos, no en el código.

## Escenario: sábado, 23:30, 5.000 usuarios

Supuestos:
- 5.000 personas abren la app entre las 22:00 y las 02:00, con un pico de ~1.000 a la vez.
- Cada una carga el feed 3-4 veces y abre 5 fichas.
- Eso son ~25.000 consultas en 4 horas, unas 2 por segundo de media y ~20 por segundo en el pico. Para Postgres en Supabase Pro es poco.

## Qué se rompe, de más a menos grave

| # | Qué falla | Por qué | Cuándo se nota | Propuesta |
|---|---|---|---|---|
| 1 | **El registro con email deja de funcionar** | El servidor de correo que trae Supabase de serie solo envía unos pocos emails por hora y es para pruebas. Con 200 registros en una noche, la mayoría no recibe el email de confirmación | El primer día de lanzamiento | Conectar un SMTP propio (por ejemplo, Resend o Brevo, con plan gratis) **antes de abrir el registro**. Lo configuras en el panel; yo preparo la plantilla del email |
| 2 | **"Hoy" esconde la fiesta de esta noche** | El filtro corta a las 00:00. A las 23:30 del viernes, una fiesta que abre a las 00:30 ya es "sábado" y no sale en "Hoy". En una app de noche, es justo lo que se busca | Cada noche | "Hoy" = de 06:00 a 06:00 del día siguiente, en hora de Valencia. Lo mismo con "Este finde": del viernes 06:00 al lunes 06:00 |
| 3 | **El filtro depende del reloj del móvil** | Las fechas se comparan en la zona horaria del teléfono. Un turista con el móvil en hora de Londres ve "Hoy" desplazado 1 hora | Turistas y Erasmus con el móvil sin cambiar | Calcular los filtros siempre en `Europe/Madrid` |
| 4 | **El feed trae todos los planes** | La consulta no tiene límite. Con 2.000 planes al mes, son cientos de filas y de fotos de golpe en cada apertura, mucho dato en el móvil y mucha transferencia en Supabase | A partir de ~500 planes publicados | Pedir 30 planes y cargar más al bajar. Filtrar "hoy/finde/gratis" en la base de datos, no en el móvil |
| 5 | **Las reglas se calculan plan a plan** | La regla de quién ve un plan llama a 3 funciones por cada fila, también para alguien sin cuenta, que nunca es miembro de ningún local | Con miles de planes y picos de tráfico | Una regla solo para `anon` (sin las comprobaciones de miembro) y las funciones de admin envueltas para que se calculen una vez por consulta. Probado con los tests |
| 6 | **No nos enteramos de los errores** | No hay monitorización: si la app falla en el móvil de alguien, nadie lo sabe | Desde el primer usuario | Sentry (tiene plan gratis), ya previsto en el prompt 3.4. Adelantarlo al primer módulo con usuarios reales |
| 7 | **Se pueden inflar los clics** | `registrar_clic` no tiene límite: un bot podría sumar miles de clics falsos y el informe a los locales dejaría de valer | Cuando enseñemos datos a los locales | Contar como máximo 1 clic por persona (o por móvil, sin cuenta) por plan y por hora |
| 8 | **El plan gratis de Supabase se pausa** | Los proyectos gratis se pausan tras 7 días sin actividad y no tienen copias de seguridad | Si la app pasa una semana sin uso antes del lanzamiento | Pasar a **Pro** (25 $/mes) antes de la beta cerrada. Comprueba en Settings > Billing en qué plan está |
| 9 | **Muchas fotos grandes a la vez** | Si un local sube fotos sin comprimir, el feed las sirve tal cual | Con los primeros locales reales | Ya previsto en el ADR-005 (comprimir en el móvil). Que el feed use siempre la miniatura de 600 px |

Lo que **no** se rompe:
- **Conexiones a la base de datos:** la API de Supabase las reparte.
- **Ficha de un plan muy compartido en Instagram:** es una consulta por id, muy barata.
- **Login:** Supabase Auth aguanta este volumen.

## Qué está sobrediseñado para el MVP

| Qué | Veredicto | Por qué |
|---|---|---|
| Campos de la v2 en la base de datos (`stripe_*`, devoluciones, modo `rotllo`) | **Dejar** | No cuestan nada y evitan otra migración. La app no los enseña |
| Rol `portero` | **Dejar, sin pantalla** | Solo sirve para escanear QR (v2) |
| Público al que apunta (`publico_edad_desde/hasta`) | **Quitar de la v1 de la app** | Es orientativo y nadie filtra por eso todavía. Se queda en la base de datos |
| Tres idiomas desde el día 1 | **Dejar** | Añadir textos ahora es barato; traducir una app hecha, no. Las traducciones de `en` e `it` las revisará un nativo antes del lanzamiento |
| Diseño de jam y entradas en `system-design.md` | **Dejar, pero no construir** | Está bien tenerlo pensado; el riesgo es ponerse con ello antes de que haya locales publicando |
| Web de respaldo con vista previa de enlaces (SSR) | **Aplazar** | Primero la app; el enlace de Instagram puede abrir la ficha web sencilla |
| Verificación manual de locales | **Correcto** | Con 20-30 locales al principio, la haces tú en minutos |

El mayor riesgo de sobrediseño no está en el código, sino en la **hoja de ruta**: construir entradas propias y jam antes de tener los 20-30 locales publicando cada semana (ver "Antes de programar" en la guía de prompts).

## Propuesta de cambios (se aplican cuando des el OK)

1. **Filtros en hora de Valencia y día "de noche"** (06:00-06:00), calculados en la base de datos, con paginación de 30 en 30 (puntos 2, 3 y 4). Es una migración pequeña más cambios en `src/lib/planes.ts` y `filtros.ts`, con tests.
2. **Reglas de `planes` más ligeras para `anon`** (punto 5), con los tests de RLS actualizados.
3. **Límite de 1 clic por persona/móvil, plan y hora** (punto 7).
4. **Sentry** al empezar el módulo de login (punto 6).
5. **Lo que haces tú en el panel:** SMTP propio (punto 1) y plan Pro antes de la beta (punto 8).
