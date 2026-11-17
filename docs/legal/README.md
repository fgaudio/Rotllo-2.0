# Textos legales de Rotllo (borradores)

> **Son borradores para que los revise un abogado. No son asesoramiento legal.** Están escritos a partir de lo que hace Rotllo de verdad (el código y la base de datos del 17 de noviembre de 2026), en lenguaje claro. El abogado decide la redacción final.

## Los documentos

| Documento | Para quién | Dónde irá |
|---|---|---|
| [`politica-privacidad.md`](politica-privacidad.md) | Todo el mundo | Web (`rotllo.app/privacidad`), app (Perfil y al crear la cuenta) y fichas de las tiendas |
| [`terminos-usuarios.md`](terminos-usuarios.md) | Quien usa la app | Web y app; se aceptan al crear la cuenta |
| [`terminos-locales.md`](terminos-locales.md) | Locales (contrato entre empresas) | Web y app; se aceptan al dar de alta el local |
| [`aviso-legal.md`](aviso-legal.md) | Todo el mundo (lo exige la LSSI) | Web y app (Perfil) |
| [`registro-tratamientos.md`](registro-tratamientos.md) | Uso interno (art. 30 RGPD) | No se publica |
| [`fichas-tiendas.md`](fichas-tiendas.md) | Uso interno | Lo que hay que marcar en App Store y Google Play |

En los textos:
- **`[[ … ]]`** es algo que hay que rellenar o decidir.
- **«⚖️ Para el abogado»** es una pregunta concreta para el abogado (hay 21).

Las dos marcas se borran antes de publicar.

## 1. Lo que tienes que rellenar tú

| Dato | Ejemplo | Dónde sale |
|---|---|---|
| **Titular** (persona o empresa) | «Fran …» como autónomo, o «Rotllo S.L.» | Todos |
| **NIF** | | Todos |
| **Domicilio** | | Todos |
| **Email de soporte** | `hola@rotllo.app` | Todos. Sirve también de punto de contacto del Reglamento de Servicios Digitales |
| **Email de privacidad** | `privacidad@rotllo.app` (puede ser el mismo) | Política de privacidad |
| **Registro Mercantil** | Solo si es una sociedad | Aviso legal |
| **Proveedor de correo y de la web** | Resend; Vercel o Netlify… | Política de privacidad y registro |
| **Fecha de publicación** | | Todos |

**Lo primero es decidir el titular** (autónomo o sociedad): casi todo lo demás depende de eso. Los emails necesitan el dominio.

## 2. Lo que tienes que decidir tú (con el abogado)

1. **El identificador anónimo del móvil** que cuenta los clics. Puede necesitar consentimiento (art. 22.2 LSSI) porque no lo pide la persona, sirve a la estadística del local. Opciones:
   - **(a)** pedir consentimiento;
   - **(b)** dejar de guardarlo: sin cuenta, los clics se contarían peor;
   - **(c)** mantenerlo si el abogado lo ve justificado.

   La opción (b) es la más sencilla.
2. **Cuánto tiempo se guardan los clics.** Propuesta: 24 meses. Hoy se guardan sin límite: habría que programar un borrado automático.
3. **Qué pasa con los reportes resueltos** cuando quien reporta borra su cuenta: borrarlos (como ahora) o guardarlos sin su nombre.
4. **Plazos de aviso** a los locales si cambian sus términos (propuesta: 15 días) o si Rotllo termina el acuerdo (propuesta: 30 días).
5. **Límite de responsabilidad** frente a los locales.

## 3. Lo que conviene preguntar al abogado

Además de las notas «⚖️» de cada texto, lo más importante:
- **Bases legales:** sobre todo la de la fecha de nacimiento y la de la ubicación.
- **Transferencias a EE. UU.** (Supabase, Google, Apple) y la firma de sus contratos de encargo del tratamiento (DPA).
- **Reglamento de Servicios Digitales:** qué obligaciones tiene Rotllo como plataforma pequeña (aviso y acción, motivar las decisiones, reclamación interna).
- **Alcohol:** publicidad de planes con alcohol (estatal y valenciana).
- **Consumidores:** que las limitaciones de responsabilidad de los términos de uso no sean abusivas.
- **DPD:** si hace falta un Delegado de Protección de Datos (en principio, no).
- **Edad mínima:** si basta con la fecha de nacimiento declarada más el DNI en la puerta.

## 4. Lo que hay que hacer en la app para que los textos sean verdad

Cuando estén aprobados, Claude puede hacerlo:

- [ ] **Publicar** los textos en la web (`/privacidad`, `/terminos`, `/terminos-locales`, `/aviso-legal`) y enlazarlos desde Perfil.
- [ ] **Aceptar los términos al crear la cuenta:** una línea con los enlaces antes de «Enviar enlace». Lo mismo al dar de alta un local.
- [ ] **Botón «Reportar»** en la ficha del plan (la tabla de reportes ya existe).
- [ ] **Enlace web para borrar la cuenta** (lo pide Google Play).
- [ ] **Borrado automático de los clics** viejos, si se decide un plazo.
- [ ] **El identificador del móvil**, según la decisión del punto 2.1.
- [ ] Rellenar las **fichas de las tiendas** con `fichas-tiendas.md`.

Si cambia lo que hace la app (analítica, Sentry, jam, venta de entradas), **hay que cambiar estos textos a la vez**.
