# Plan de tests (Fase 3, prompt 3.1)

> Fecha: 16 de noviembre de 2026. Cubre la v1 tal como está y deja escritos los tests que habrá que hacer con la v2.

## Conclusión

La v1 está **bien cubierta donde más daño haría un fallo**: quién puede ver y cambiar qué (las reglas de la base de datos), la edad mínima y los filtros del feed. Cada regla de seguridad tiene un test que intenta saltársela.

Los tres huecos eran:

1. **Nada se probaba solo.** Los tests había que lanzarlos a mano. **Añadido:** GitHub ejecuta todos los tests en cada cambio que se sube (`.github/workflows/pruebas.yml`).
2. **Las pruebas de punta a punta solo existían en mi carpeta de trabajo.** **Añadido:** una prueba de humo en el repositorio (`scripts/e2e/humo.cjs`) que abre la app en un navegador y recorre lo principal.
3. **Nada probado en un móvil de verdad.** Depende de tener la app de pruebas (cuenta de Expo). Abajo está la lista para hacerlo a mano.

Lo que la guía pone primero (pagos, aforo, QR, votos, chat) **es de la v2 y todavía no existe**. Los tests de eso están descritos en la última sección, para escribirlos a la vez que el código.

## Qué tipos de test hay

| Tipo | Qué prueba | Herramienta | Cuántos hay | Cuánto tarda |
|---|---|---|---|---|
| **Lógica de la app** | Cuentas y reglas que no necesitan pantalla: filtros, fechas, distancias, validaciones, textos de error | Jest (`npm test`) | 169, en 18 archivos | ~2 s |
| **Base de datos** | Las reglas RLS, los triggers y las funciones, entrando como distintas personas (sin cuenta, usuaria, dueña de un local, equipo de Rotllo) | pgTAP en un Postgres local que imita a Supabase (`scripts/db/probar.sh`) | 211, en 9 archivos | ~1 s |
| **De punta a punta (humo)** | Que la app abre y lo principal funciona en un navegador, con los datos de ejemplo | Playwright (`scripts/e2e/humo.cjs`) | 1 recorrido con 15 comprobaciones | ~30 s |
| **De punta a punta (real)** | Login con el correo de verdad, panel del local, fotos, contra el Supabase real | Playwright, a mano | Se hicieron en cada módulo; no se repiten solos porque mandan correos y crean datos reales | — |
| **En el móvil** | Permisos, mapa, compartir, enlaces | A mano, con la lista de abajo | 0: falta la app de pruebas | — |

Se sigue la pirámide de siempre: muchos tests pequeños y rápidos abajo, pocos recorridos completos arriba. Aquí la base de datos pesa más de lo normal porque **la seguridad de Rotllo vive en ella**: la app no se puede proteger sola, porque cualquiera puede hablar con Supabase sin pasar por la app.

## Lo que se prueba, por orden de cuánto daño haría si falla

| # | Área | Qué haría daño | Cómo se prueba | Estado |
|---|---|---|---|---|
| 1 | **Permisos (RLS)** | Un local edita planes de otro; alguien ve datos privados; alguien se hace admin | Base de datos: cada regla con un test que intenta saltársela (`01`, `05`, `06`, `07`, `09`) | ✅ |
| 2 | **Edad mínima** | Un menor de 18 tiene cuenta; un plan +21 sale como +18 | Base de datos (`01`): fecha de menor rechazada, fecha que no se cambia, edad del plan ≥ 18. App: `edad.test.ts` | ✅ |
| 3 | **Datos personales** | Un local sabe quién pulsó su enlace; borrar la cuenta deja datos | Base de datos (`04`, `09`): qué se borra y qué queda anónimo; el local solo cuenta clics | ✅ |
| 4 | **Login y cuenta** | Nadie puede entrar; una sesión ajena; no se puede borrar la cuenta | App: `auth.test.ts` (lectura del enlace, errores), `sesion.test.ts`. Real: a mano con el correo | 🟡 sin repetición automática del correo real |
| 5 | **Feed y filtros** | «Hoy» esconde la fiesta de esta noche; el finde se corta | Los mismos casos en la app (`filtros.test.ts`) y en la base de datos (`02`, `08`): día de 06:00 a 06:00, hora de Valencia, cambio de hora | ✅ |
| 6 | **Panel del local** | Un plan se publica sin revisar; un plan cancelado vuelve; se pierden fotos | Base de datos (`05`, `06`, `07`). App: `planesLocal.test.ts`, `fotos.test.ts`, `cartel.test.ts` | ✅ |
| 7 | **«Pillar entrada»** | El enlace no abre; los clics se inflan | Base de datos (`02`, `09`): 1 clic por persona y hora; sin identificador no cuenta. App: `planes.test.ts` (marca de origen en el enlace) | ✅ |
| 8 | **«Cerca de mí»** | Orden mal; la ubicación se guarda | Mismos casos en la app y la base de datos (`08`). App: `ubicacion.test.ts`, `distancia.test.ts` | ✅ |
| 9 | **Cómo llegar** | Lleva a otro sitio | App: `mapas.test.ts` con los enlaces exactos de Google y Apple | ✅ (falta en el móvil) |
| 10 | **Accesibilidad** | Textos que no se leen | App: `tokens.test.ts` comprueba el contraste de todos los colores | ✅ |
| 11 | **Compartir en stories** | Imagen cortada | App: `historia.test.ts` (tamaños). La imagen se revisó a ojo | 🟡 |

## Objetivo de cobertura

No se persigue un porcentaje. Las reglas son:

- **Cada regla de seguridad tiene un test que intenta romperla.** Si se añade una tabla o una función, se añade su test de ataque.
- **Cada error que se arregla deja un test** que fallaría si el error volviera.
- **Lo que hace la base de datos y la app a la vez** (los filtros, «Cerca de mí») **tiene los mismos casos en los dos sitios**, para que no se separen.
- No se prueban cosas que ya prueba otro: React Native, Expo o Supabase por dentro.

## Cómo se ejecutan

En tu ordenador:

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run lint
```

La base de datos (necesita Postgres 16, PostGIS y pgTAP; en GitHub se instalan solos):

```bash
sudo -u postgres bash scripts/db/probar.sh
```

La prueba de humo (necesita la app abierta con los datos de ejemplo en otra terminal):

```bash
EXPO_NO_DOTENV=1 npx expo start --web --port 8081
```

```bash
npm run e2e
```

**En GitHub:** cada vez que se sube un cambio, se ejecutan solos la lógica de la app, los tipos, el estilo y la base de datos. Si algo falla, sale una cruz roja en el commit y te llega un email.

## Lista para probar en el móvil (cuando haya app de pruebas)

En un iPhone y en un Android:

- [ ] La app abre en los planes, sin pedir nada.
- [ ] «Cerca de mí»: sale el aviso del sistema con el texto de Rotllo. Al aceptar, se ordena y salen las distancias. Al rechazar, sale el aviso con «Abrir ajustes», y ese botón abre los ajustes de Rotllo.
- [ ] Mapa: salen los planes; el botón de abajo enseña el punto azul y acerca el mapa.
- [ ] «Cómo llegar» → Google Maps abre la app de Google Maps; Apple Maps abre Mapas en el iPhone.
- [ ] «Pillar entrada» abre la web de la ticketera.
- [ ] Entrar: el enlace del correo, tocado en el mismo móvil, abre Rotllo y entra.
- [ ] Panel del local: elegir una foto de la galería (pide permiso de fotos), se sube y sale en el cartel.
- [ ] «Imagen para stories» → «Compartir imagen» abre el menú del móvil y se puede subir a Instagram.
- [ ] Modo oscuro y claro del móvil.
- [ ] Letra grande del móvil (accesibilidad): nada se corta ni se monta.
- [ ] Sin conexión: los errores dicen qué pasa y dejan reintentar.

## Tests de la v2 (escribirlos con el código)

Son los de la guía. Cuando se construya cada cosa, sus tests van en el mismo cambio.

**Entradas y pagos (Stripe Connect)**
- Pagar dos veces la misma compra (doble toque, reintento de red, webhook repetido) cobra una sola vez: la compra tiene un identificador único y el webhook es idempotente.
- Con aforo 100 y 100 vendidas, la 101 no se vende, aunque lleguen dos compras en el mismo segundo (bloqueo en la base de datos, no en el móvil).
- El precio y los gastos de gestión (tarifa A: 4 % + 1,60 €) se calculan en el servidor; lo que mande el móvil se ignora.
- Un webhook sin firma válida de Stripe se rechaza.
- El QR vale una vez: el segundo escaneo dice «ya usada», con la hora del primero.
- Un portero solo escanea entradas de su local.
- Al cancelar un plan con entradas vendidas se devuelve el dinero de todas y se avisa.
- Nadie ve las entradas de otra persona.

**«Me apunto»**
- Una persona se apunta una vez por plan; el contador no baja de 0; el local ve la lista, nadie más.

**Votos de la jam**
- Un voto por persona y votación; cambiar el voto no suma dos; no se vota cuando la votación está cerrada.

**Chat de la jam**
- Reportar un mensaje lo marca para el equipo; bloquear a alguien hace que no veas sus mensajes.
- Límite anti-spam: como mucho N mensajes por minuto.
- Solo escribe quien está en la jam.

**De punta a punta**
- Registrarse → encontrar un plan → comprar → recibir la entrada → entrar con el QR en la puerta.
