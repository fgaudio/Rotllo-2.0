# Rotllo

App de planes y actividades en Valencia. Contexto, stack y reglas de trabajo en [`CLAUDE.md`](CLAUDE.md); diseño y decisiones en [`docs/`](docs/).

## Arrancar en local

```bash
npm install
cp .env.example .env   # y rellena las claves
npm start              # servidor de desarrollo
npm run web            # versión web en el navegador
```

La app usa módulos nativos (mapas y, más adelante, pagos), así que en el móvil se prueba con una **development build**, no con Expo Go:

```bash
npx eas-cli@latest build --profile development --platform android   # o ios
```

## Comprobaciones

```bash
npm run typecheck   # tipos de TypeScript
npm run lint        # estilo del código
```
