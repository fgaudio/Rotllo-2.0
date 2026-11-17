<!--
BORRADOR interno (no se publica). Registro de actividades de tratamiento, art. 30 RGPD.
⚖️ Para el abogado: confirmar si es obligatorio. El art. 30.5 exime a empresas de menos de 250 personas,
salvo que el tratamiento no sea ocasional, y aquí es continuo, así que probablemente sí lo es.
Refleja Rotllo v1 a 17 de noviembre de 2026. Actualizarlo con cada dato o uso nuevo.
-->

# Registro de actividades de tratamiento

**Responsable:** [[TITULAR]] · NIF [[NIF]] · [[DOMICILIO]] · [[EMAIL DE PRIVACIDAD]]
**Última revisión:** [[FECHA]]

| # | Actividad | Finalidad | Personas afectadas | Datos | Base legal | Destinatarios / encargados | Transferencias fuera del EEE | Plazo | Dónde está en el sistema |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **Cuentas de usuario** | Crear la cuenta, entrar sin contraseña, comprobar la edad mínima | Usuarios con cuenta | Email, fecha de nacimiento, idioma, estado del perfil, fechas de acceso, IP de acceso | Art. 6.1.b (contrato) y 6.1.f (proteger a menores) | Supabase (base de datos y Auth); [[proveedor de correo]] | Supabase Inc. (EE. UU.) puede acceder para dar soporte: [[DPF o cláusulas tipo]] | Hasta que se borra la cuenta; registros de acceso, [[7 días]] | `auth.users`, `perfiles`, `perfiles_privados` |
| 2 | **Planes guardados** | Guardar planes en la cuenta | Usuarios con cuenta | Qué planes ha guardado y cuándo | Art. 6.1.b | Supabase | Como el 1 | Hasta que se quita o se borra la cuenta | `favoritos` |
| 3 | **Clics en «Pillar entrada»** | Dar a los locales una cifra (solo el número) de interés por sus planes, sin contar dos veces | Usuarios con y sin cuenta | Plan, fecha y hora, cuenta o identificador aleatorio del móvil | Art. 6.1.f (interés legítimo); [[revisar art. 22.2 LSSI para el identificador]] | Supabase. Los locales solo ven el número | Como el 1 | [[PROPUESTA: 24 meses]]. Al borrar la cuenta, el clic deja de estar unido a ella, pero conserva el identificador aleatorio del móvil | `clics_ticketera` |
| 4 | **«Cerca de mí»** | Ordenar los planes por cercanía | Usuarios que activan el filtro | Posición redondeada a ~100 m | Art. 6.1.a (consentimiento: filtro + permiso del sistema) | Supabase (solo para calcular el orden) | Como el 1 | No se guarda | Función `buscar_planes_cerca` |
| 5 | **Locales y sus gestores** | Verificar el local, publicar sus planes, contactar | Personas que gestionan locales; autónomos titulares | Nombre, dirección, ubicación e Instagram del local (públicos); razón social, NIF, email de contacto (privados); rol en el local | Art. 6.1.b (contrato con el local) | Supabase; OpenStreetMap Foundation (búsqueda de la dirección al darse de alta) | Supabase, como el 1. OSMF en Reino Unido: decisión de adecuación | Mientras el local tenga cuenta | `locales`, `locales_privado`, `miembros_local` |
| 6 | **Planes y fotos** | Publicar los planes | Locales; personas que salen en las fotos | Texto del plan, fotos y flyers (pueden salir personas) | Art. 6.1.b. La imagen de terceros es responsabilidad del local (términos para locales) | Supabase (Storage) | Como el 1 | Mientras el plan exista | `planes`, `fotos_plan`, bucket `planes` |
| 7 | **Reportes y moderación** | Revisar contenido reportado y cumplir el Reglamento de Servicios Digitales | Quien reporta; locales reportados | Quién reporta, qué, motivo, detalle y resolución | Art. 6.1.b y 6.1.c | Supabase | Como el 1 | Hasta que se borra la cuenta de quien reporta. [[⚖️ ¿Conservar los resueltos de forma anónima?]] | `reportes` |
| 8 | **Seguridad y registros técnicos** | Que el servicio funcione y detectar abusos | Todo el que usa la app o la web | IP, navegador o móvil, peticiones | Art. 6.1.f | Supabase; [[proveedor web]]; [[Sentry, cuando exista]] | Como el 1 | [[Según el plan: 7 días en Supabase Pro]] | Registros de Supabase |
| 9 | **Atención y derechos** | Contestar emails y solicitudes de derechos | Quien escribe | Email, lo que cuente | Art. 6.1.c (atender derechos) y 6.1.f | [[proveedor de email del equipo]] | [[Según proveedor]] | [[PROPUESTA: 2 años desde la última respuesta]] | Buzón de soporte |

## Medidas de seguridad (art. 32)

- **Reglas de seguridad en la base de datos (RLS)** que impiden ver o cambiar datos ajenos, con 211 pruebas automáticas que intentan saltárselas (`supabase/tests/database/`).
- **Entrar sin contraseñas,** con enlaces de un solo uso y PKCE (`docs/login.md`).
- **Conexión cifrada** (HTTPS) y datos alojados en la UE (Fráncfort).
- **La clave secreta de Supabase** no está en la app ni en el código.
- **Revisiones de seguridad:** la última, el 16 de noviembre de 2026 (`docs/revision-seguridad.md`).
- **Procedimiento ante fugas de datos:** `docs/runbook.md`, apartado 8.
- **Copias de seguridad diarias** con el plan Pro de Supabase [[pendiente de contratar]].
