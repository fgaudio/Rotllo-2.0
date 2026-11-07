# Rotllo

App de planes y actividades en Valencia para gente joven, estudiantes y gente sociable con ganas de salir.

## Público y tono

- **Público:** solo mayores de 18 (edad mínima para tener cuenta), sin límite superior; el núcleo es de 18-35 años. Cada local fija la edad mínima (+18, +21...) y el público al que apunta en sus planes. Móvil primero.
- **Idiomas:** español primero; preparado para inglés e italiano (nada de textos fijos en el código, todo traducible).
- **Tono de marca:** cercano, vivaz, social, valenciano e internacional, friendly, sin vueltas.

## Tipos de usuario

1. **Usuarios:** descubren planes, ven la ubicación y cómo llegar, filtran por tipo de plan, compran entradas (discotecas/boliches), chatean y votan en la "jam".
2. **Locales** (bares, discotecas, lugares de actividades): crean su perfil y publican planes con fecha, hora, tipo, precio y ubicación.

## Funcionalidades

### v1 (primero)
- **Feed y mapa** de planes en Valencia, con filtros: hoy, este finde, tipo de plan, gratis/pago, cerca de mí.
- **Ficha del plan:** fotos, descripción, ubicación y botón "Cómo llegar" (abre Google Maps / Apple Maps).
- **Entradas:** enlace a la ticketera del local.
- **Panel para locales:** crear y editar planes.
- **Promoción en Instagram:** cada plan genera una imagen/enlace para compartir en stories.

### Después (v2 y siguientes)
- **Entradas propias:** compra dentro de la app con QR para mostrar en la puerta; el panel de locales muestra las entradas vendidas.
- **Jam:** chat en tiempo real por plan o por zona, con votaciones (ej. "¿A dónde vamos el viernes?").
- **Notificaciones.**

## Stack

_Pendiente: se completa en la Fase 1._

## Reglas de trabajo para Claude

- **Antes de un cambio grande**, muestra el plan y espera mi OK.
- **Explica las decisiones técnicas en lenguaje simple:** estoy aprendiendo.
- **Cambios pequeños y probados;** un commit por cada cosa que funcione.
- **Nunca guardes claves secretas en el código:** usa variables de entorno (`.env`) y asegúrate de que `.env` está en el `.gitignore`.
- **Documenta** las decisiones de producto y técnicas en `/docs`.
