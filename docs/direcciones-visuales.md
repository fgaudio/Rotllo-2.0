# Direcciones visuales (prompt 2.1)

> Fecha: 2026-11-08. Estado: **propuestas; falta que elijas una**. Inspiración: el flyer de Rotllo (rosa chicle, lunares de semitono, logo amarillo con contorno y destellos) y la serigrafía de Andy Warhol, con letra de lectura clara y la app igual de sencilla. Cuando elijas, la elegida sustituye la paleta actual de `docs/diseno.md` (prompt 2.2).

Los prototipos están en `prototipos/direcciones/`, uno por dirección: el mismo feed en modo claro y oscuro, con su ficha. Se abren en cualquier navegador, sin conexión. Para regenerarlos: `python3 scripts/prototipos/direcciones.py <carpeta con @fontsource>`.

| | 1 · Rotllo Pop | 2 · Serie Warhol | 3 · Noche Mediterránea Pop |
|---|---|---|---|
| **Idea** | Tu flyer hecho app: tarjetas como pegatinas | Galería pop: cada plan, una serigrafía; el destacado se repite 4 veces con otros colores | Pop nocturno: sol coral sobre el mar de la Malva-rosa |
| **Colores principales** | Rosa chicle #FF2D87, amarillo #FFE135, tinta violeta #1A0B2E | Papel #F4F1EA, tinta #111111 y parejas de color por categoría (rosa/azul Klein, amarillo/rojo, turquesa/violeta) | Azul noche #12163F, coral #FF6B6B, mandarina #FF9F1C, turquesa #2EC4B6, amarillo #FFD93D |
| **Títulos / texto** | Lilita One / Inter | Archivo Black / Inter | Fredoka / Inter |
| **Tarjeta** | Borde grueso de 3 px y sombra dura desplazada | Marco fino, esquinas rectas, foto en duotono | Muy redonda (24 px), sin borde, cartel ilustrado |
| **Al pulsar** | Se "hunde" como una pegatina | La foto cambia de colores (serigrafía) | Sube y baja suave |
| **Modo oscuro** | Noche violeta, bordes amarillos, sombra rosa neón | Negro galería: donde más brilla | Es su modo principal |
| **Fuerte** | La marca: es lo mismo que verán en Instagram | Luce las fotos reales de los locales (duotono) | La más descansada para leer a las 2 de la mañana |
| **Ojo con** | Puede cansar si todo lleva borde: hay que reservarlo para tarjetas y botones | Más seria; el pop está en las fotos, menos en la interfaz | La que menos se parece al flyer |

**Accesibilidad**:
- **Contraste:** las tres pasan AA en todas sus combinaciones de texto, comprobadas con `contraste.py`. La única prohibida es el texto blanco sobre el rosa chicle (3,51:1): en la dirección 1, el texto sobre rosa siempre va en tinta (5,28:1).
- **Zonas táctiles:** todos los botones miden 44 px o más.

**Recomendación:** la **1 · Rotllo Pop** como base, porque es tu marca y conecta la app con lo que la gente verá en stories. Le añadiría el **destacado en serie 2×2 de la 2**, como firma de "El plan de esta noche". En el resto de la interfaz, el borde grueso se reserva para tarjetas y botones, para que la app siga siendo sencilla.
