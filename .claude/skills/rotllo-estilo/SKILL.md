---
name: rotllo-estilo
description: Guía de estilo de Rotllo (app de planes en Valencia). Úsala SIEMPRE que crees, modifiques, rediseñes o revises una pantalla, vista, componente, botón, tarjeta, formulario, estado vacío, mensaje de error, prototipo o cualquier texto visible de la app Rotllo, aunque el usuario no hable de "estilo" ni de "diseño". Aplica la guía visual de docs/diseno.md, el tono de marca (cercano, joven, tuteo / English), las convenciones de carpetas y código del proyecto y la accesibilidad mínima (contraste y botones de 44px).
---

# Rotllo · estilo

Rotllo es una app móvil de planes en Valencia para gente de 18-35 años. Cada pantalla tiene que parecer de la misma app y sonar a la misma marca. Esta skill es la lista de cosas que hay que respetar cada vez que tocas algo que el usuario ve.

La persona que lleva el proyecto está aprendiendo: al final, explica lo que hiciste en lenguaje simple (ver "Al terminar").

## 1. Lee las fuentes de verdad (antes de escribir código)

La guía y las convenciones cambian con el proyecto, así que léelas cada vez en lugar de suponerlas:

1. **`CLAUDE.md`** de la raíz: producto, versiones (qué es v1 y qué llega después) y reglas de trabajo.
2. **`docs/diseno.md`**: paleta, tipografía, espaciados, radios y componentes. Es la única fuente de colores y medidas.
   - Si no existe o le falta algo que necesitas, **no inventes una paleta en silencio**. Dilo, propón los valores que faltan y usa lo mínimo, marcado como provisional (por ejemplo, un comentario `/* PROVISIONAL: falta en docs/diseno.md */`). Inventar valores sin avisar crea una segunda guía que nadie aprobó.
3. **Convenciones del código existente.** Mira, como mínimo:
   - El árbol de carpetas (`ls`, `find` sin `node_modules`) y dónde viven pantallas, componentes, estilos y textos.
   - 2-3 componentes o pantallas parecidos a lo que vas a hacer: copia su forma de nombrar archivos, de estilar (variables CSS, tema, Tailwind, StyleSheet...), de importar y de organizar los textos.
   - `package.json`, configuración de lint/formato y cualquier `docs/convenciones.md` si existe.
   - Si el proyecto ya resuelve algo (un `Boton`, un tema, un archivo de traducciones), reutilízalo en vez de crear otro.
4. **Si todavía no hay stack** (la sección "Stack" de `CLAUDE.md` está vacía y no hay código de app): haz un prototipo HTML autocontenido en `prototipos/<nombre-en-kebab-case>.html`, con los tokens de `docs/diseno.md` como variables CSS en `:root`, ancho de móvil (375-430px) y los textos agrupados en un objeto al principio del script (así luego se pasan fácil a i18n). Avisa de que es un prototipo hasta que se decida el stack.

## 2. Aplica la guía visual

- **Solo tokens.** Colores, tamaños de letra, espacios y radios salen de `docs/diseno.md` (como variables/tema). Nada de `#ff6600` sueltos ni `margin: 13px`. Si necesitas un valor que no está, ver punto 1.2.
- **Componentes de la guía primero.** Si la guía define botón, chip, tarjeta de plan, badge de precio, etc., úsalos con su forma, estados y variantes. No crees variantes nuevas sin decirlo.
- **Móvil primero.** Diseña para ~375px de ancho; una columna; acción principal al alcance del pulgar (abajo).
- **Respeta las versiones.** Lo de v2+ (compra dentro de la app con QR, jam, notificaciones) no se muestra como si ya existiera. En v1 las entradas son un enlace a la ticketera del local.

## 3. Escribe los textos con el tono Rotllo

Cercano, joven, vivaz, internacional y con un toque valenciano. Frases cortas. Sin vueltas.

- **Español con tuteo** ("pilla", "mira", "apúntate"), nunca "usted" ni "su".
- **Inglés**: el mismo rollo, casual y directo ("Grab your ticket", "Nothing on tonight").
- **Frases cortas**: una idea por frase. Botones de 1-3 palabras, empezando por verbo.
- **Toque valenciano con mesura**: alguna palabra que se entiende fuera de Valencia ("vinga", "xe", "festa", "esmorzaret") o referencias locales (Russafa, el Carmen, la Malva-rosa). Máximo una por pantalla, nunca en errores ni en textos legales.
- **Errores y estados vacíos**: dicen qué pasa y qué hacer ahora, sin culpar al usuario y sin tecnicismos.
- **Nada de**: "haga clic aquí", "estimado usuario", mayúsculas gritonas, muchos signos de exclamación, emojis en cada línea (uno de vez en cuando vale).
- **Textos traducibles**: ponlos donde el proyecto guarde los textos (archivo de i18n, objeto de textos), no repartidos por el código. Español primero; deja la estructura lista para inglés (`en`) e italiano (`it`).

Lee `references/tono.md` para ver ejemplos de antes/después y más vocabulario cuando escribas más de un par de textos.

## 4. Accesibilidad mínima (no negociable)

- **Contraste (WCAG AA)**: texto normal ≥ 4.5:1; texto grande (≥ 24px, o ≥ 18.66px en negrita) e iconos/bordes de controles ≥ 3:1. Compruébalo con el script, no a ojo:
  ```bash
  python3 .claude/skills/rotllo-estilo/scripts/contraste.py "#FFFFFF/#C2410C" "#57534E/#FFF7ED"
  ```
  (formato `texto/fondo`; sale con error si algún par no llega a 3:1). Comprueba todas las combinaciones nuevas de texto y fondo, incluidos estados (deshabilitado, pulsado) y texto sobre fotos (usa un degradado/capa oscura detrás).
- **Zonas táctiles ≥ 44×44px** para todo lo pulsable: botones, chips, iconos, enlaces sueltos. Si el icono es más pequeño, agranda la zona táctil (padding o `min-width/min-height: 44px`), no el dibujo.
- **Básicos**: `alt` (o equivalente) en imágenes con contenido; etiqueta accesible en botones de solo icono; foco visible; no transmitir información solo con color (por ejemplo, "Gratis" lleva texto, no solo un color verde).

## 5. Al terminar

Revisa esta lista antes de dar el trabajo por hecho:

- [ ] Leí `CLAUDE.md`, `docs/diseno.md` y componentes parecidos; seguí sus convenciones.
- [ ] Todos los colores/medidas son tokens de la guía (o están marcados como provisionales y lo he dicho).
- [ ] Textos con tuteo, cortos, en el sitio de textos traducibles.
- [ ] Contraste comprobado con `scripts/contraste.py`; zonas táctiles ≥ 44px.
- [ ] Nada de v2+ mostrado como si existiera.

Luego cuéntale al usuario, en pocas líneas y sin jerga:
- Qué archivos creaste o cambiaste.
- Qué partes de la guía usaste y qué faltaba en ella (si faltó algo).
- El resultado del contraste (los pares y sus valores).
- Cualquier decisión que deba confirmar.

Si una decisión de diseño es nueva y merece quedar escrita (un componente nuevo, un token nuevo), propón añadirla a `docs/diseno.md`; las decisiones se documentan en `/docs`.
