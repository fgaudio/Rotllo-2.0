# Checklist legal antes de lanzar (España / UE)

> Fecha: 2026-11-08. Es una lista de trabajo, **no asesoramiento legal**. La columna "Abogado" marca lo que debe revisar un profesional antes de publicar la app. Las fichas de las tiendas y la política de privacidad tienen que estar listas para la beta cerrada.

**Lo primero:** decidir **quién es el titular** de Rotllo (autónomo o sociedad). Aparece en el aviso legal, la política de privacidad, los términos, Stripe y las facturas, y casi todo lo demás depende de eso.

## Datos personales (RGPD y LOPDGDD)

| Qué hace falta | Estado en Rotllo | Abogado |
|---|---|---|
| **Política de privacidad** (art. 13 RGPD): quién trata los datos, para qué, con qué base legal, cuánto tiempo, a quién se ceden y cómo ejercer los derechos. Enlazada desde el registro y desde Perfil | Por redactar | ✅ Redacción final |
| **Registro de actividades de tratamiento**: lista interna de qué datos se tratan y por qué | Por hacer. Base: las tablas de `docs/system-design.md` | ✅ Confirmar si es obligatorio en tu caso |
| **Encargados del tratamiento** y sus contratos (DPA): Supabase (datos en Fráncfort), Expo (push), Google y Apple (login, mapas), y más adelante Stripe, Sentry y PostHog | Por firmar: casi todos ofrecen su DPA estándar en su web | ✅ Revisar las transferencias fuera de la UE (empresas de EE. UU.: Data Privacy Framework o cláusulas tipo) |
| **Minimización**: guardar solo lo necesario | ✅ La ubicación del usuario **no se guarda**: solo se usa en el móvil. La fecha de nacimiento va en una tabla privada | — |
| **Plazos de conservación**: cuánto se guarda cada dato y qué pasa al borrar la cuenta | Por definir. Las facturas (v2) se guardan por obligación fiscal y mercantil (4-6 años) | ✅ |
| **Derechos** (acceso, rectificación, supresión, portabilidad): un email de contacto y un plazo de respuesta de 1 mes | Por definir el email | — |
| **Brechas de seguridad**: avisar a la AEPD en 72 h si hay una fuga de datos | Por escribir el procedimiento en el runbook (prompt 3.3) | — |

## Cuenta, edad y ubicación

| Qué hace falta | Estado en Rotllo | Abogado |
|---|---|---|
| **Edad mínima de 18**, declarada al registrarse | ✅ La base de datos rechaza a los menores y la fecha solo se pone una vez | ✅ Confirmar que basta con la declaración más el DNI en la puerta, sobre todo en planes con alcohol |
| **Borrar la cuenta desde la app**: lo exigen Apple (App Review Guideline 5.1.1) y Google Play (también con un enlace web), además del derecho de supresión del RGPD | Hecho en la app (Perfil → Borrar cuenta), ver `docs/login.md`. Falta el enlace web que pide Google Play y borrar las fotos de perfil cuando existan | — |
| **Permiso de ubicación**: pedirlo solo al usar "Cerca de mí" y explicar para qué | Por hacer en el módulo 4. Texto con el tono Rotllo, por ejemplo "Para enseñarte lo que tienes cerca. No guardamos dónde estás." | — |
| **Notificaciones push**: permiso del sistema y preferencias por tipo | v1.1 (ADR-006) | — |

## Web, app y comunicaciones (LSSI-CE)

| Qué hace falta | Estado en Rotllo | Abogado |
|---|---|---|
| **Aviso legal** con los datos del titular (nombre, NIF, domicilio, email) en la web y en la app | Por hacer: depende del titular | — |
| **Cookies y analítica**: en la web, banner de consentimiento si hay analítica. En la app, consentimiento antes de medir (prompt 4.1) | Ahora no hay cookies ni analítica | ✅ Revisar el texto del banner y si PostHog necesita consentimiento previo |
| **Comunicaciones comerciales** (newsletter, push de promoción): solo con consentimiento previo y fácil de retirar | No hay ninguna todavía | — |

## Contenido de usuarios y locales (Reglamento de Servicios Digitales, DSA)

| Qué hace falta | Estado en Rotllo | Abogado |
|---|---|---|
| **Botón para denunciar contenido** (planes, locales, mensajes) y respuesta motivada cuando se retira algo | ✅ La tabla `reportes` ya existe. Falta la pantalla y la revisión desde el panel de admin | ✅ Qué obligaciones del DSA aplican a una empresa pequeña |
| **Punto de contacto** para usuarios y autoridades (un email) | Por definir | — |
| **Términos claros** sobre qué contenido está prohibido y cómo se modera la jam (v1.1) | Por redactar | ✅ |
| **Fotos de los locales**: el local garantiza que tiene derecho a usarlas, también la imagen de las personas que salen (LO 1/1982) | Va en los términos para locales | ✅ |

## Términos y condiciones

| Qué hace falta | Estado en Rotllo | Abogado |
|---|---|---|
| **Términos para usuarios**: qué es Rotllo; que en la v1 las entradas se compran en la web del local, con Rotllo solo como enlace; conducta; suspensión de cuentas; edad | Por redactar | ✅ |
| **Términos para locales** (empresa a empresa): veracidad de los planes, responsabilidad del evento, verificación, suspensión y derechos sobre fotos y textos. En la v2, también la comisión, los reembolsos y Stripe Connect | Por redactar | ✅ |
| **v2 · venta de entradas**: precio final con gastos visible desde el principio, excepción al derecho de desistimiento para ocio con fecha concreta, IVA y factura simplificada de los gastos (ADR-003) | Pendiente de la v2 | ✅ |

## Accesibilidad y tiendas

| Qué hace falta | Estado en Rotllo | Abogado |
|---|---|---|
| **Ley Europea de Accesibilidad** (Directiva 2019/882, en España la Ley 11/2023): se aplica a los servicios de comercio electrónico desde junio de 2025. Las microempresas (menos de 10 personas y menos de 2 M€) están exentas en servicios | ✅ Ya cumplimos lo básico: contraste AA y zonas táctiles de 44 px | ✅ Confirmar la exención |
| **Fichas de las tiendas**: etiquetas de privacidad (App Store) y "Seguridad de los datos" (Google Play), que tienen que coincidir con la política de privacidad | Por hacer en el prompt 3.4 | — |
| **Clasificación por edad en las tiendas**: 18+ por la promoción de ocio nocturno y alcohol | Por hacer en el prompt 3.4 | — |

## Recomendable (no obligatorio)

- **Registrar la marca "Rotllo"** en la OEPM (España) o la EUIPO (UE) antes de invertir en la marca.
- **Seguro de responsabilidad civil** cuando haya venta de entradas (v2).

## Fuentes

- [RGPD (Reglamento UE 2016/679)](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [LOPDGDD (Ley Orgánica 3/2018)](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673)
- [LSSI-CE (Ley 34/2002)](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)
- [Reglamento de Servicios Digitales (UE 2022/2065)](https://eur-lex.europa.eu/eli/reg/2022/2065/oj)
- [Directiva de Accesibilidad (UE 2019/882)](https://eur-lex.europa.eu/eli/dir/2019/882/oj)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
