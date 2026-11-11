# Propuesta de rediseño: «Cartelera»

**Estado:** propuesta, pendiente de aprobar. No se ha tocado la app.
**Fecha:** 11 de noviembre de 2026.
**Previsualización:** `prototipos/rediseno/` (abre `index.html` o mira las tres láminas PNG).

## Por qué el diseño actual parece amateur

Revisión de la «Serie Warhol» tal como quedó en la app (`prototipos/pantallas-r1/`):

| Problema | Qué se ve | Por qué resta |
|---|---|---|
| **Ilustraciones de clip-art** | Una nota musical, una bola de discoteca, un sol | Son iconos genéricos. No dicen nada del plan y recuerdan a una app infantil |
| **La «serie» repite un icono** | El destacado son cuatro estrellas iguales | Warhol repetía una cara o un producto reconocible. Repetir un icono parece un hueco sin rellenar |
| **Todo va en cajas con borde** | Tarjetas, chips, campos y botones con marco de 2 px | Es el aspecto de un boceto (wireframe). No hay nada que destaque |
| **Todo pesa lo mismo** | Una lista de tarjetas idénticas | El ojo no sabe dónde ir. Las apps buenas mezclan un plan grande, un carrusel y una agenda |
| **Seis colores a la vez** | Logo arcoíris, chips, etiquetas y tarjetas compitiendo | Sin un color principal, el resultado es ruido |
| **Fechas de base de datos** | «lun, 9 nov · 23:00» | Una persona dice «hoy a las 23:00» o «empieza en 2 h» |
| **Nada invita** | Ni urgencia, ni gente, ni un motivo para compartir | Es un listado, no una invitación |
| **Mucho espacio muerto** | Media pantalla vacía en la bienvenida y en entrar | Da sensación de app sin terminar |

Lo que sí funcionaba y se queda: los colores pop, la trama de puntos, el botón amarillo en oscuro, los textos y toda la lógica (filtros, búsqueda, edad, Supabase).

## La propuesta

**Idea:** cada plan es un cartel. La app es la cartelera de la ciudad.

- **Oscuro primero.** La app se usa de noche. El fondo es casi negro y el color lo ponen los carteles. El modo claro sigue existiendo.
- **Un solo color de interfaz:** el amarillo, para la acción principal. Los demás colores pop solo viven dentro de los carteles.
- **Tipografía de cartel:** Anton (condensada, en mayúsculas) para títulos. Cabe mucho más texto y más grande en un móvil. Inter para todo lo demás.
- **Carteles generados** para los planes sin foto, hechos con el propio título: en cinta (el título repetido), con la inicial gigante o en serie de 2×2. Cada plan tiene el suyo y ninguno es un icono genérico.
- **Las fotos y flyers del local** se enseñan tal cual, sin texto encima, en el mismo hueco.
- **El círculo como motivo de marca:** «rotllo» es un corro de gente. Aparece en el logo, en los sellos de hora y en los botones.
- **Sin bordes:** las cosas se separan con espacio y con superficies un poco más claras.

### Pantallas

| Pantalla | Qué cambia |
|---|---|
| **Bienvenida y entrar** | Una pantalla en vez de cuatro: un muro de carteles, «Valencia tiene plan.» y los botones para entrar |
| **Feed** | Titular «¿Qué hacemos esta noche?», el plan de hoy en grande con todo a la vista sin bajar, un carrusel «Hoy también» y una agenda «Este finde» agrupada por días |
| **Ficha** | Cartel a pantalla completa, título enorme, tres datos en lenguaje normal (cuándo, dónde, cuánto), el bloque «Mejor con tu gente» para compartir y la barra fija con el precio y «Pillar entrada» |

### Qué invita a apuntarse

1. **Urgencia real:** «Empieza en 2 h», calculado con la hora del plan.
2. **El plan de hoy, arriba y completo:** nombre, sitio y precio sin bajar.
3. **Compartir como protagonista:** un bloque propio en la ficha, no un icono escondido.
4. **La entrada siempre a mano:** barra fija con el precio y el botón.

## Límites que conviene saber

- **Los carteles generados son abstractos.** Dan color y personalidad, pero no enseñan el sitio. Lo que de verdad vende un plan es una buena foto, y el diseño le da el hueco más grande. En la previsualización, la única «foto» (Techno en la Marina) es una simulación con luces, porque este entorno no puede descargar fotos.
- **El logo es provisional** (ROTLL + círculo). Un logo definitivo es un trabajo aparte.
- **Los chips de categoría** («Fiesta», «Directos») salen en la previsualización, pero la base de datos todavía filtra solo por hoy, finde y gratis. En la app saldrán cuando funcionen (módulo de planes).
- **El desenfoque** de las barras necesita un paquete nuevo (`expo-blur`). Si da problemas, van en color liso.

## Plan si se aprueba

Se rehace la capa visual. La lógica, los textos, los tests y Supabase no se tocan.

1. Tema nuevo (colores, Anton, medidas), `docs/diseno.md` reescrito y tests de contraste.
2. Componentes: cartel generado, sello, botones, chips, pastillas y las tres tarjetas de plan.
3. Feed con sus tres secciones.
4. Ficha del plan.
5. Bienvenida y entrar en una pantalla; email y fecha de nacimiento con el estilo nuevo.
6. Mapa, guardados y perfil.

Un commit por paso, cada uno probado en claro y oscuro.

## Decisiones pendientes

1. ¿Se aprueba la dirección «Cartelera»?
2. ¿Bienvenida en una sola pantalla, en vez de los 3 pasos de la guía?
3. ¿La búsqueda pasa a ser un icono arriba, en vez de una barra siempre visible?
