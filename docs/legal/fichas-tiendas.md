<!--
BORRADOR. Lo que hay que declarar en las fichas de App Store y Google Play.
Tiene que coincidir con la política de privacidad. Si cambia la app, se cambian las dos cosas.
Refleja Rotllo v1 a 17 de noviembre de 2026 (sin Sentry ni analítica todavía).
-->

# Privacidad en las fichas de las tiendas

## En las dos tiendas

- **Rastreo (*tracking*): no.** Rotllo no cruza datos con otras apps o webs para publicidad.
- **Datos vendidos o compartidos con terceros: no.** Los proveedores que trabajan para Rotllo (Supabase) no cuentan como «compartir».
- **Conexión cifrada:** sí (HTTPS).
- **Se puede borrar la cuenta:** sí, en la app (Perfil → Borrar cuenta) y [[en la web: ENLACE]], que Google Play exige.
- **Edad:** 18+.
- **Enlace a la política de privacidad:** [[https://rotllo.app/privacidad]].

## App Store: etiquetas de privacidad («App Privacy»)

| Tipo de dato (categoría de Apple) | ¿Se recoge? | Uso | ¿Ligado a la persona? |
|---|---|---|---|
| **Información de contacto → Correo electrónico** | Sí, solo con cuenta | Funcionalidad de la app (cuenta) | Sí |
| **Otros datos → Fecha de nacimiento** | Sí, solo con cuenta | Funcionalidad de la app (edad mínima) | Sí |
| **Contenido del usuario → Fotos** | Sí, solo los locales que suben fotos de sus planes | Funcionalidad de la app | Sí |
| **Uso → Interacción con el producto** (clics en «Pillar entrada», planes guardados) | Sí | Funcionalidad de la app; estadísticas para los locales | Sí si hay cuenta; si no, con un identificador aleatorio |
| **Identificadores → ID de dispositivo** | [[⚖️ Revisar: es un identificador aleatorio que crea la app, no el del sistema. Apple pide declararlo si sale del móvil, y sale (con los clics)]] | Funcionalidad (no contar dos veces un clic) | No |
| **Ubicación → Ubicación aproximada** | **No se declara como «recogida»:** se manda redondeada solo para ordenar los planes en ese momento y no se guarda. Apple no considera «recogido» lo que se procesa en tiempo real y no se conserva. [[⚖️ Confirmar]] | — | — |
| **Diagnóstico → Datos de fallos** | [[Sí, cuando se conecte Sentry]] | Funcionalidad de la app | No |

## Google Play: «Seguridad de los datos»

| Categoría de Google | ¿Se recoge? | ¿Se comparte? | ¿Opcional? | Para qué |
|---|---|---|---|---|
| **Información personal → Dirección de correo** | Sí | No | Sí (solo para tener cuenta) | Funcionalidad, gestión de la cuenta |
| **Información personal → Otra información** (fecha de nacimiento) | Sí | No | Sí (solo con cuenta) | Funcionalidad (edad mínima) |
| **Ubicación → Aproximada** | Sí, **procesada de forma efímera** (Google tiene esa casilla) | No | Sí | Funcionalidad («Cerca de mí») |
| **Fotos y vídeos → Fotos** | Sí (solo locales) | No | Sí | Funcionalidad |
| **Actividad en la app → Otras acciones** (clics, guardados) | Sí | No | No | Funcionalidad, estadísticas para los locales |
| **Dispositivo u otros identificadores** | Sí (el aleatorio de la app) | No | No | Funcionalidad, prevención de fraude |
| **Fallos y diagnóstico** | [[Sí, con Sentry]] | No | No | Funcionalidad |

## Textos de los permisos (ya en la app)

| Permiso | Texto (`app.config.ts`) |
|---|---|
| Ubicación (iPhone) | «Rotllo usa tu ubicación para enseñarte los planes que tienes cerca. No se guarda.» |
| Fotos (iPhone) | «Rotllo usa tus fotos para que elijas el cartel de tu plan.» |
