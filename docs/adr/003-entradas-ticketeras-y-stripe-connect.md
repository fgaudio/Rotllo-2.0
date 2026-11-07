# ADR-003: Entradas — v1 con enlace a la ticketera, v2 con Stripe Connect

**Estado:** Propuesto
**Fecha:** 2026-11-07
**Decide:** responsable de Rotllo (y conviene consultar con un asesor fiscal antes de la v2)

## Contexto

- Muchos locales de Valencia ya venden con una ticketera: Xceed, Fourvenues, Entradium, Eventbrite…
- Decisiones de producto ya tomadas (`docs/system-design.md`):
  - El dinero de la entrada es para el local.
  - Rotllo cobra unos **gastos de gestión del 5 % + 0,30 € por entrada**, que paga el comprador.
  - Los planes gratis no pagan gastos.
  - No hay devoluciones salvo que el local las active.
- Estamos en **España**: IVA, facturas, Verifactu, y Bizum es muy popular (Stripe dice que el 38 % de la gente en España prefiere pagar con Bizum).

## Decisión (propuesta)

1. **v1: enlace a la ticketera del local**, con seguimiento de clics. Además, preguntaremos a Xceed y Fourvenues por su programa de afiliados.
2. **v2: venta propia con Stripe Connect** (cuentas Express, cobro con destino al local y `on_behalf_of`; se explica más abajo). Tarjeta, Apple Pay y Google Pay, y **Bizum si Stripe lo permite en nuestro caso**.
3. Las facturas de los gastos de gestión, con una herramienta de facturación conectada a Stripe y preparada para Verifactu.

## Opciones consideradas

### Opción A: Enlace a la ticketera del local (v1)

El local pega en su plan el enlace de su ticketera. En la ficha, "Pillar entrada" abre esa web.

| Dimensión | Valoración |
|---|---|
| Complejidad | Muy baja |
| Coste/mes con 1.000 usuarios | **0 €** |
| Coste/mes con 20.000 usuarios | **0 €** |
| Ingresos para Rotllo | 0 €, salvo que haya acuerdo de afiliado (Xceed tiene una red de afiliados: partners@xceed.me) |
| Dificultad para aprender | **Muy baja**: un campo de texto y un botón |

**Pros**
- Se lanza ya. El local no cambia nada de cómo trabaja.
- Rotllo no toca dinero: ni IVA de entradas, ni devoluciones, ni fraude.
- Las ticketeras ya resuelven el aforo, el QR y la puerta.

**Contras**
- El usuario sale de la app. La experiencia es peor y no sabemos si llegó a comprar.
- Sin ingresos directos.
- Cada ticketera es distinta: algunas ni funcionan bien en el móvil.

**Mejoras baratas dentro de la v1**
- Añadir `?utm_source=rotllo` a los enlaces y contar los clics en una tabla `clics_ticketera`. Así le enseñamos al local "te hemos mandado 230 personas", que es el mejor argumento para la v2.
- Preguntar a Xceed y Fourvenues por afiliación o API: Xceed tiene una Open Event API y Fourvenues una Events API. Más adelante podríamos mostrar en la ficha si quedan entradas.

### Opción B: Venta propia con Stripe Connect (v2, recomendada)

Cada local da de alta una cuenta "Express" de Stripe desde nuestra app (con su DNI o CIF y su IBAN; Stripe hace las comprobaciones de identidad). Cuando alguien compra, Stripe cobra, envía al local su parte y deja a Rotllo los gastos de gestión.

| Dimensión | Valoración |
|---|---|
| Complejidad | Media-alta |
| Coste fijo | 0 € al mes |
| Coste por venta | Comisión de Stripe por pago (≈ 1,5 % + 0,25 € con tarjetas europeas estándar) + Connect (≈ 2 $ por local que recibe dinero ese mes + 0,25 % + 0,25 € por cada transferencia al local). Son tarifas generales: hay que confirmar las de España |
| Dificultad para aprender | **Media-alta**: avisos de Stripe al servidor (webhooks), modo de pruebas, devoluciones… Stripe tiene muy buena documentación y modo test |

**Pros**
- La compra se hace sin salir de la app: tarjeta, Apple Pay y Google Pay (y Bizum, si se confirma).
- Rotllo ingresa sus gastos de gestión.
- Con Connect, **Rotllo no custodia el dinero de los locales**. Esto es importante: cobrar dinero en nombre de otros para pagárselo después es un servicio de pago regulado (PSD2), y Stripe lo cubre con su licencia.
- Stripe se encarga de verificar a los locales (KYC) y del fraude con tarjetas (Radar).

**Contras**
- Hay que programar el QR, el escaneo y las devoluciones (ya está diseñado).
- Rotllo responde ante los compradores si algo sale mal, por ejemplo si un local cierra sin devolver.
- La comisión de Stripe se come una parte importante de los gastos de gestión (ver números abajo).

### Opción C: TPV virtual del banco (Redsys) con Bizum (descartada)

| Dimensión | Valoración |
|---|---|
| Complejidad | Alta |
| Coste por venta | Depende de lo que negocies con el banco; puede ser más barato que Stripe |
| Dificultad para aprender | **Alta**: integración antigua, basada en redirigir a una web |

**Por qué se descarta:** Redsys no reparte el dinero entre el local y Rotllo. Todo llegaría a la cuenta de Rotllo y habría que pagar a mano a cada local, lo que nos convierte en intermediario de pagos (con el problema legal de PSD2). Además, la experiencia de pago dentro de la app es peor.

## Cómo se cobra con Stripe Connect

Proponemos un **cobro con destino al local y `on_behalf_of`**:

- El comprador ve en el extracto de su banco el nombre del local.
- **Legalmente, el local vende la entrada** y **Rotllo vende el servicio de gestión**. Esto ordena el tema de las facturas (ver abajo).
- El local recibe sus 8 € enteros, como se decidió.
- La comisión de Stripe la paga Rotllo, de sus gastos de gestión.

La alternativa es que la comisión de Stripe la pague el local (Stripe cobra directamente a su cuenta). Pero entonces el local recibiría menos de 8 €, y eso va contra lo decidido.

## España: IVA, facturas, Verifactu y Bizum

**IVA**
- **La entrada**: el IVA lo pone el local, porque es quien vende. En general es el 21 % en discotecas y salas de fiesta y el 10 % en conciertos y espectáculos en directo; hay que confirmarlo con un asesor. Rotllo guarda el tipo de IVA en cada tipo de entrada (`tipos_entrada.iva_porcentaje`, un campo nuevo para el diseño) para que salga bien en el justificante.
- **Los gastos de gestión**: son un servicio de Rotllo a un consumidor, con **21 % de IVA**. Como el precio mostrado al consumidor tiene que incluir el IVA, de los 0,70 € de gastos de una entrada de 8 €, **unos 0,12 € son IVA** y Rotllo ingresa en realidad 0,58 €.

**Facturas**
- **Rotllo** emite una **factura simplificada** por los gastos de gestión de cada compra. Va adjunta al email de confirmación, y se genera de forma automática con el aviso de "pago correcto" de Stripe.
- **El local** factura la entrada como ya hace con sus ventas. Rotllo le da en su panel un informe mensual de ventas (CSV) para su gestoría.
- **Verifactu** es el sistema de Hacienda que obliga a que el programa de facturación envíe o registre cada factura. Con la norma vigente (Real Decreto-ley 15/2025) es obligatorio desde el **1 de enero de 2027 para sociedades** y desde el **1 de julio de 2027 para autónomos**. Hay noticias de otro posible aplazamiento: confirmarlo antes de la v2. Conclusión: **no programar las facturas a mano**, sino usar un programa de facturación ya preparado para Verifactu y conectado a Stripe (por ejemplo, Holded o Quaderno; hay que comparar).

**Bizum**
- Stripe **añadió Bizum el 27 de mayo de 2026**, para clientes en España y pagos en euros, con devoluciones incluidas. Tiene limitaciones conocidas: no funciona en el "Express Checkout Element" ni en suscripciones.
- **Falta confirmar** si funciona con Connect (`on_behalf_of`) y en el formulario de pago nativo de la app (Payment Sheet). No he podido abrir la documentación de Stripe desde esta sesión porque su web está bloqueada en la red del entorno.
- **Plan B**: si no va en el formulario nativo, ofrecer "Pagar con Bizum" abriendo la página de pago de Stripe (Checkout) en el navegador de la app.

## Números de la v2 (orientativos)

Supuestos: entrada de 8 € y 1,5 entradas por compra de media. Por cada entrada, los gastos de gestión son 0,40 € + 0,30 € = 0,70 €.

| | 1.000 usuarios | 20.000 usuarios |
|---|---|---|
| Entradas vendidas al mes | 300 | 6.000 |
| Compras | 200 | 4.000 |
| Gastos de gestión cobrados (IVA incluido) | 210 € | 4.200 € |
| – IVA de esos gastos (21 %) | –36 € | –729 € |
| – Comisión de Stripe por pago (≈ 1,5 % + 0,25 €) | –89 € | –1.784 € |
| – Connect (locales activos + transferencias) | –~35 € | –~420 € |
| **Lo que le queda a Rotllo** | **~50 €/mes** | **~1.270 €/mes** |

**Lo importante:** con las tarifas actuales, a Rotllo le queda en torno a un **25-30 % de lo que paga el comprador en gastos**. Hay formas de mejorarlo sin cambiar el modelo:

- Hacer las transferencias a los locales **semanales o mensuales** en vez de diarias, porque cada transferencia cuesta 0,25 €.
- Revisar si los gastos se muestran **"+ IVA"** en lugar de "IVA incluido". Esto hay que verlo con el asesor: al consumidor siempre hay que enseñarle el total final.
- Poner un **mínimo de gastos por compra** para las entradas baratas.

## Consecuencias

- **Más fácil:** lanzar la v1 ya, sin tocar dinero. Con Connect, la v2 no nos convierte en entidad de pago.
- **Más difícil:** la v2 exige webhooks, factura simplificada, Verifactu, informes para los locales y atención al cliente.
- **A revisar:** las comisiones reales de Stripe en España, Bizum con Connect y la app, el IVA exacto de cada tipo de plan y si el margen compensa.

## Acciones

1. [ ] **v1:** campo `url_ticketera` + `utm_source=rotllo` + contador de clics.
2. [ ] **v1:** escribir a partners@xceed.me y a Fourvenues para preguntar por afiliación y API.
3. [ ] **Antes de la v2:** reunión con una gestoría sobre el IVA de las entradas y de los gastos de gestión, la factura simplificada, Verifactu y la forma jurídica de Rotllo.
4. [ ] **v2:** crear la cuenta de plataforma de Stripe Connect, probarlo todo en modo test y comprobar Bizum.
5. [ ] **v2:** añadir `iva_porcentaje` a `tipos_entrada` en `docs/system-design.md`.
