// Prueba de humo: abre Rotllo en un navegador y recorre lo principal con los datos de ejemplo.
// No usa Supabase ni manda correos, así que se puede repetir siempre que se quiera.
//
// 1. En una terminal, la app con los datos de ejemplo:
//      EXPO_NO_DOTENV=1 npx expo start --web --port 8081
// 2. En otra:
//      npm run e2e
//
// Necesita Playwright con Chromium (npx playwright install chromium, una vez).
// Otra dirección: ROTLLO_URL=http://localhost:19006 npm run e2e
const { chromium } = require('playwright');

const BASE = process.env.ROTLLO_URL ?? 'http://localhost:8081';
const AYUNTAMIENTO = { latitude: 39.4699, longitude: -0.3763 };

let fallos = 0;
function comprobar(nombre, ok, detalle = '') {
  console.log(`${ok ? '✓' : '✗'} ${nombre}${!ok && detalle ? ` (${detalle})` : ''}`);
  if (!ok) fallos++;
}

(async () => {
  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    colorScheme: 'dark',
    geolocation: AYUNTAMIENTO,
    permissions: ['geolocation'],
  });
  const p = await contexto.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));

  const boton = (nombre) => p.getByRole('button', { name: nombre, exact: true }).first();
  const pestana = (nombre) => p.getByRole('tab', { name: new RegExp(nombre) }).first();
  const planes = () => p.locator('a[href^="/p/"]');
  const ruta = () => new URL(p.url()).pathname;
  const hay = async (texto) => (await p.getByText(texto, { exact: false }).count()) > 0;
  const esperar = (ms = 800) => p.waitForTimeout(ms);

  try {
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await esperar(1500);

    // Feed
    comprobar('El feed abre con su titular', await hay('¿Qué hacemos'));
    comprobar('Hay planes en el feed', (await planes().count()) >= 3, `${await planes().count()} planes`);
    await boton('Hoy').click();
    await esperar();
    comprobar('El filtro «Hoy» se marca, también para el lector de pantalla', (await boton('Hoy').getAttribute('aria-pressed')) === 'true');
    await boton('Todo').click();
    await esperar();

    // «Cerca de mí»
    await boton('Cerca de mí').click();
    await esperar(2000);
    const conDistancia = await p.locator('a[href^="/p/"][aria-label*=". a "]').count();
    comprobar('«Cerca de mí» enseña la distancia de cada plan', conDistancia >= 3, `${conDistancia} con distancia`);
    await boton('Cerca de mí').click();
    await esperar();

    // Ficha del plan y «Cómo llegar»
    await planes().first().click();
    await esperar(1500);
    comprobar('Tocar un plan abre su ficha', ruta().startsWith('/p/'), ruta());
    await p.getByRole('button', { name: /^Cómo llegar/ }).first().click();
    await esperar();
    const app = (nombre) => p.getByRole('link', { name: nombre, exact: true });
    comprobar('«Cómo llegar» ofrece Google Maps y Apple Maps', (await app('Google Maps').count()) > 0 && (await app('Apple Maps').count()) > 0);
    await boton('Cancelar').click();
    await esperar();

    // Guardar
    await boton('Guardar plan').click();
    await esperar();
    comprobar('El corazón guarda el plan', (await boton('Quitar de guardados').count()) > 0);
    await p.goto(BASE + '/guardados', { waitUntil: 'networkidle' });
    await esperar(1200);
    comprobar('El plan sale en Guardados', (await planes().count()) === 1, `${await planes().count()} guardados`);

    // Búsqueda
    await p.goto(BASE + '/buscar', { waitUntil: 'networkidle' });
    await esperar(1000);
    await p.getByRole('textbox').first().fill('salsa');
    await esperar(1000);
    comprobar('La búsqueda encuentra «Noche de salsa»', await hay('Noche de salsa'));

    // Mapa (en el navegador es una lista)
    await p.goto(BASE + '/mapa', { waitUntil: 'networkidle' });
    await esperar(1200);
    comprobar('La pestaña Mapa enseña los planes', (await planes().count()) >= 3);

    // Entrar
    await p.goto(BASE + '/perfil', { waitUntil: 'networkidle' });
    await esperar(1000);
    comprobar('Perfil ofrece entrar', (await boton('Entrar').count()) > 0);
    await p.goto(BASE + '/entrar/enlace#error=access_denied&error_code=otp_expired', { waitUntil: 'networkidle' });
    await esperar(1500);
    // Con los datos de ejemplo no hay cuentas, y la pantalla del enlace lo dice (con Supabase diría «Ese enlace ya no vale»).
    comprobar('La pantalla del enlace del correo explica lo que pasa', (await hay('modo de ejemplo no hay cuentas')) || (await hay('Ese enlace ya no vale')));

    // Una dirección que no existe
    await p.goto(BASE + '/esto-no-existe', { waitUntil: 'networkidle' });
    await esperar(1000);
    comprobar('Una dirección que no existe no rompe la app', (await p.locator('body').innerText()).trim().length > 0);

    // Las pestañas
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    await esperar(1000);
    comprobar('Están las cuatro pestañas', (await pestana('Planes').count()) + (await pestana('Mapa').count()) + (await pestana('Guardados').count()) + (await pestana('Perfil').count()) === 4);

    comprobar('Sin errores en la consola', errores.length === 0, [...new Set(errores)].slice(0, 3).join(' | '));
  } catch (error) {
    comprobar('El recorrido llega hasta el final', false, error.message.split('\n')[0]);
  } finally {
    await navegador.close();
  }

  console.log(fallos === 0 ? '\nTodo bien.' : `\n${fallos} comprobación(es) han fallado.`);
  process.exit(fallos === 0 ? 0 : 1);
})();
