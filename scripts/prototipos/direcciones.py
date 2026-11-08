"""Genera los prototipos de las 3 direcciones visuales de Rotllo (prompt 2.1).

Escribe prototipos/direcciones/<direccion>.html: el mismo feed en claro y en oscuro, con la
ficha de cada dirección. Las fuentes van dentro del HTML (base64) para que se vea igual
sin conexión. Uso:

    python3 scripts/prototipos/direcciones.py <carpeta-con-node_modules/@fontsource>
"""
import base64
import pathlib
import sys

RAIZ = pathlib.Path(__file__).resolve().parents[2]
SALIDA = RAIZ / "prototipos" / "direcciones"
FUENTES = pathlib.Path(sys.argv[1]) / "node_modules" / "@fontsource"

# Textos (en un sitio, para pasarlos luego a i18n)
TEXTOS = {
    "titulo": "¿Qué hacemos?",
    "subtitulo": "Planes en Valencia",
    "filtros": ["Hoy", "Este finde", "Gratis"],
    "destacado": "El plan de esta noche",
    "pestanas": ["Planes", "Mapa", "Guardados", "Perfil"],
    "claro": "Modo claro",
    "oscuro": "Modo oscuro",
}

PLANES = [
    {"titulo": "Noche de salsa", "meta": "Hoy · 23:00 · Russafa", "precio": "Desde 8 €", "gratis": False, "edad": None, "dibujo": "musica"},
    {"titulo": "Techno en la Marina", "meta": "Vie · 23:00 · la Marina", "precio": "Desde 15 €", "gratis": False, "edad": "+21", "dibujo": "fiesta"},
    {"titulo": "Vermut y vinilos", "meta": "Sáb · 13:00 · el Carmen", "precio": "Gratis", "gratis": True, "edad": None, "dibujo": "tardeo"},
    {"titulo": "Vóley en la playa", "meta": "Dom · 11:00 · la Malva-rosa", "precio": "Gratis", "gratis": True, "edad": None, "dibujo": "deporte"},
]


def fuente(nombre, archivo, peso):
    datos = base64.b64encode((FUENTES / nombre / "files" / archivo).read_bytes()).decode()
    familia = {"lilita-one": "Lilita One", "archivo-black": "Archivo Black", "fredoka": "Fredoka", "inter": "Inter"}[nombre]
    return f"@font-face{{font-family:'{familia}';font-weight:{peso};font-display:block;src:url(data:font/woff2;base64,{datos}) format('woff2')}}"


def fuentes_css(extra):
    base = [fuente("inter", f"inter-latin-{p}-normal.woff2", p) for p in (400, 600, 700)]
    return "\n".join(base + extra)


# ── Dibujos sencillos (SVG) por tipo de plan ──────────────────────────────────
def dibujo(tipo, c1, c2, tinta):
    """c1 = fondo, c2 = figura, tinta = contorno."""
    figuras = {
        "musica": f"""<g stroke="{tinta}" stroke-width="6" stroke-linejoin="round">
            <ellipse cx="128" cy="122" rx="26" ry="20" fill="{c2}"/><ellipse cx="200" cy="108" rx="26" ry="20" fill="{c2}"/>
            <path d="M152 120 V48 L224 34 V106" fill="none" stroke-width="10"/><path d="M152 62 L224 48" stroke-width="10"/></g>""",
        "fiesta": f"""<g stroke="{tinta}" stroke-width="6"><line x1="160" y1="0" x2="160" y2="34"/>
            <circle cx="160" cy="92" r="58" fill="{c2}"/>
            <path d="M102 92 H218 M112 62 H208 M112 122 H208 M160 34 V150 M128 40 Q112 92 128 144 M192 40 Q208 92 192 144" fill="none" stroke-width="4"/></g>""",
        "tardeo": f"""<g stroke="{tinta}" stroke-width="6" stroke-linejoin="round">
            <path d="M110 40 H210 L160 104 Z" fill="{c2}"/><path d="M160 104 V150 M130 152 H190" fill="none" stroke-width="8" stroke-linecap="round"/>
            <circle cx="196" cy="48" r="12" fill="{c1}"/><path d="M150 40 L190 16" stroke-width="5"/></g>""",
        "deporte": f"""<g stroke="{tinta}" stroke-width="6"><circle cx="160" cy="92" r="58" fill="{c2}"/>
            <path d="M110 64 Q160 92 212 70 M104 106 Q156 112 206 132 M160 34 Q132 92 168 150" fill="none" stroke-width="5"/></g>""",
    }
    return figuras[tipo]


def destellos(color, x=262, y=34, s=1.0):
    return f"""<path transform="translate({x},{y}) scale({s})" fill="{color}" d="M0 -22 C3 -6 6 -3 22 0 C6 3 3 6 0 22 C-3 6 -6 3 -22 0 C-6 -3 -3 -6 0 -22Z"/>"""


def lunares(id_, color, r=3.2, paso=14):
    return f"""<pattern id="{id_}" width="{paso}" height="{paso}" patternUnits="userSpaceOnUse"><circle cx="{paso/2}" cy="{paso/2}" r="{r}" fill="{color}"/></pattern>"""


def svg_plan(plan, c1, c2, tinta, puntos, brillo, idx, alto=180):
    pid = f"p{idx}{abs(hash(c1 + c2)) % 9999}"
    return f"""<svg viewBox="0 0 320 {alto}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="{plan['titulo']}">
      <defs>{lunares(pid, puntos)}</defs><rect width="320" height="{alto}" fill="{c1}"/><rect width="320" height="{alto}" fill="url(#{pid})"/>
      {dibujo(plan['dibujo'], c1, c2, tinta)}{destellos(brillo)}{destellos(brillo, 48, alto - 30, 0.6)}</svg>"""


# ── HTML común ───────────────────────────────────────────────────────────────
ICONOS = {
    "Planes": "M12 2 L14.4 9.6 L22 12 L14.4 14.4 L12 22 L9.6 14.4 L2 12 L9.6 9.6Z",
    "Mapa": "M3 6 L9 3 L15 6 L21 3 V18 L15 21 L9 18 L3 21Z M9 3 V18 M15 6 V21",
    "Guardados": "M12 21 C5 15 2 11.5 2 8 A5 5 0 0 1 12 6 A5 5 0 0 1 22 8 C22 11.5 19 15 12 21Z",
    "Perfil": "M12 12 A4.5 4.5 0 1 0 12 3 A4.5 4.5 0 1 0 12 12Z M3.5 21 C4.5 16.5 8 14.5 12 14.5 C16 14.5 19.5 16.5 20.5 21Z",
}


def barra(activa=0):
    tabs = []
    for i, nombre in enumerate(TEXTOS["pestanas"]):
        estado = "activa" if i == activa else ""
        tabs.append(f"""<button class="tab {estado}" aria-label="{nombre}"><span class="tab-icono"><svg viewBox="0 0 24 24"><path d="{ICONOS[nombre]}"/></svg></span><span>{nombre}</span></button>""")
    return f"""<nav class="barra">{''.join(tabs)}</nav>"""


def chips(activo=0):
    return "".join(
        f"""<button class="chip {'activo' if i == activo else ''}" aria-pressed="{'true' if i == activo else 'false'}">{t}</button>"""
        for i, t in enumerate(TEXTOS["filtros"])
    )


def pagina(direccion):
    telefonos = []
    for modo in ("claro", "oscuro"):
        telefonos.append(f"""<figure class="telefono-wrap"><figcaption>{TEXTOS[modo]}</figcaption>
          <div class="telefono {modo}">{direccion['feed'](modo)}</div></figure>""")
    paleta = "".join(
        f"""<li><span class="muestra" style="background:{c}"></span><b>{n}</b><code>{c}</code></li>""" for n, c in direccion["paleta"]
    )
    ficha = "".join(f"<dt>{k}</dt><dd>{v}</dd>" for k, v in direccion["ficha"])
    return f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rotllo · Dirección {direccion['num']}: {direccion['nombre']} (propuesta)</title>
<style>{fuentes_css(direccion['fuentes'])}
*{{box-sizing:border-box;margin:0;padding:0}} button{{font:inherit;color:inherit;background:none;border:0;cursor:pointer}}
body{{font-family:Inter,system-ui,sans-serif;background:#ECEAE6;color:#1C1917;padding:32px}}
.cab{{max-width:900px;margin:0 auto 24px}} .cab h1{{font-size:28px;margin-bottom:6px}} .cab p{{color:#57534E;font-size:16px;line-height:1.5}}
.fila{{display:flex;gap:40px;justify-content:center;flex-wrap:wrap}}
.telefono-wrap figcaption{{text-align:center;font-weight:600;margin-bottom:10px;color:#57534E}}
.telefono{{width:390px;height:844px;border-radius:44px;overflow:hidden;position:relative;box-shadow:0 0 0 10px #1C1917,0 20px 60px rgba(0,0,0,.25);display:flex;flex-direction:column}}
.scroll{{flex:1;overflow:hidden}}
.ficha{{max-width:900px;margin:36px auto 0;display:grid;grid-template-columns:260px 1fr;gap:28px;background:#fff;border-radius:20px;padding:28px}}
.ficha h2{{font-size:18px;margin-bottom:12px}} .paleta{{list-style:none;display:grid;gap:8px}} .paleta li{{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:10px;font-size:14px}}
.muestra{{width:28px;height:28px;border-radius:8px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}} code{{font-size:13px;color:#57534E}}
dl{{display:grid;grid-template-columns:150px 1fr;gap:10px 16px;font-size:14px;line-height:1.5}} dt{{font-weight:700}}
.barra{{display:flex;justify-content:space-around;padding:6px 8px 22px}}
.tab{{min-width:64px;min-height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:12px;font-weight:600}}
.tab-icono{{display:flex;align-items:center;justify-content:center;width:52px;height:30px;border-radius:999px}}
.tab svg{{width:22px;height:22px}}
.chips{{display:flex;gap:8px;padding:4px 20px 14px;overflow:hidden}}
.chip{{min-height:44px;padding:0 18px;border-radius:999px;font-weight:600;font-size:15px;white-space:nowrap}}
.tarjeta svg{{display:block;width:100%;height:auto}}
{direccion['css']}
</style></head><body>
<header class="cab"><h1>Dirección {direccion['num']} · {direccion['nombre']}</h1><p>{direccion['idea']}</p></header>
<div class="fila">{''.join(telefonos)}</div>
<section class="ficha"><div><h2>Paleta</h2><ul class="paleta">{paleta}</ul></div><div><h2>Cómo es</h2><dl>{ficha}</dl></div></section>
</body></html>"""


# ── Dirección 1: Rotllo Pop (el flyer) ───────────────────────────────────────
def feed_pop(modo):
    oscuro = modo == "oscuro"
    tinta = "#1A0B2E"
    tarjetas = ""
    for i, p in enumerate(PLANES[:3]):
        fondo = ["#FF2D87", "#FFE135", "#FF2D87"][i]
        figura = ["#FFE135", "#FF2D87", "#FFFFFF"][i]
        puntos = ["#E8197A", "#F2CC1F", "#E8197A"][i]
        precio = f"""<span class="precio {'gratis' if p['gratis'] else ''}">{p['precio']}</span>"""
        edad = f"""<span class="edad">{p['edad']}</span>""" if p["edad"] else ""
        tarjetas += f"""<article class="tarjeta" tabindex="0">{svg_plan(p, fondo, figura, tinta, puntos, '#FFFFFF', i, 150)}
          <div class="cuerpo"><div class="etiquetas">{precio}{edad}</div><h3>{p['titulo']}</h3><p>{p['meta']}</p></div></article>"""
    return f"""<div class="scroll"><header class="banda"><svg class="banda-lunares" width="100%" height="100%"><defs>{lunares('bl'+modo, '#E8197A' if not oscuro else '#2B1748', 3.4, 16)}</defs><rect width="100%" height="100%" fill="url(#bl{modo})"/></svg>
      <div class="logo">Rotllo</div><svg class="brillo" viewBox="-24 -24 48 48">{destellos('#FFFFFF', 0, 0)}</svg>
      <p class="saludo">{TEXTOS['titulo']}</p></header>
      <div class="chips">{chips(0)}</div><div class="lista">{tarjetas}</div></div>{barra(0)}"""


POP = {
    "num": 1,
    "nombre": "Rotllo Pop",
    "idea": "Tu flyer convertido en app: rosa chicle, lunares de semitono, logo gordo amarillo con contorno y sombra dura, y destellos. Tarjetas con borde grueso y sombra desplazada, como pegatinas. Mucho carácter en la cabecera y las fotos; el resto, limpio y fácil de leer.",
    "fuentes": [fuente("lilita-one", "lilita-one-latin-400-normal.woff2", 400)],
    "paleta": [
        ("Rosa chicle", "#FF2D87"), ("Amarillo pop", "#FFE135"), ("Tinta violeta", "#1A0B2E"), ("Rosa claro (fondo)", "#FFF4F8"),
        ("Violeta suave (texto 2)", "#5B3F73"), ("Noche (fondo oscuro)", "#1A0B2E"), ("Superficie oscura", "#2A1448"), ("Rosa neón (oscuro)", "#FF4F9A"),
    ],
    "ficha": [
        ("Tipografía", "<b>Lilita One</b> solo para el logo y los títulos grandes (gorda y redonda, como el flyer). <b>Inter</b> para todo lo demás: se lee perfecta a cualquier tamaño."),
        ("Tarjeta de plan", "Fondo blanco (oscuro: violeta), borde de 3 px en tinta y sombra dura de 5 px desplazada. Foto arriba con lunares. Precio en píldora amarilla."),
        ("Iconos", "Trazo grueso y redondeado, relleno plano. La pestaña activa va dentro de una píldora rosa."),
        ("Animaciones", "Al pulsar una tarjeta o un botón, se \"hunde\": la sombra desaparece y baja 3 px, como apretar una pegatina. Los destellos parpadean una vez al cargar el feed."),
        ("Modo oscuro", "Fondo noche violeta con lunares apagados; los bordes pasan a amarillo y la sombra a rosa neón. El rosa nunca lleva texto blanco (3,5:1): siempre tinta (5,3:1)."),
        ("Contraste", "Tinta sobre rosa 5,28:1 · tinta sobre amarillo 14,21:1 · texto claro sobre noche 17,28:1 · amarillo sobre noche 14,21:1."),
    ],
    "feed": feed_pop,
    "css": """
.telefono.claro{--fondo:#FFF4F8;--sup:#FFFFFF;--txt:#1A0B2E;--txt2:#5B3F73;--borde:#1A0B2E;--sombra:#1A0B2E;--banda:#FF2D87;--chip:#FFFFFF;--chipact:#FFE135;--barra:#FFFFFF;--tabact:#FF2D87}
.telefono.oscuro{--fondo:#1A0B2E;--sup:#2A1448;--txt:#FFF4F8;--txt2:#D6C4EA;--borde:#FFE135;--sombra:#FF4F9A;--banda:#1A0B2E;--chip:#2A1448;--chipact:#FFE135;--barra:#2A1448;--tabact:#FF4F9A}
.telefono{background:var(--fondo);color:var(--txt)}
.banda{position:relative;background:var(--banda);height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-bottom:3px solid var(--borde);overflow:hidden}
.banda-lunares{position:absolute;inset:0}
.logo{position:relative;font-family:'Lilita One';font-size:64px;color:#FFE135;transform:rotate(-5deg);-webkit-text-stroke:3px #1A0B2E;paint-order:stroke fill;text-shadow:5px 5px 0 #1A0B2E}
.brillo{position:absolute;width:34px;height:34px;right:70px;top:34px}
.saludo{position:relative;margin-top:14px;font-family:'Lilita One';font-size:24px;color:#1A0B2E;background:#FFF4F8;border:3px solid #1A0B2E;border-radius:999px;padding:4px 18px}
.oscuro .saludo{background:#FFE135}
.chips{padding-top:18px}
.chip{background:var(--chip);border:2.5px solid var(--borde);color:var(--txt)}
.chip.activo{background:var(--chipact);color:#1A0B2E;box-shadow:3px 3px 0 var(--sombra)}
.lista{display:flex;flex-direction:column;gap:18px;padding:0 20px 20px}
.tarjeta{background:var(--sup);border:3px solid var(--borde);border-radius:20px;overflow:hidden;box-shadow:5px 5px 0 var(--sombra);transition:transform .08s,box-shadow .08s}
.tarjeta:active{transform:translate(3px,3px);box-shadow:2px 2px 0 var(--sombra)}
.tarjeta svg{border-bottom:3px solid var(--borde)}
.cuerpo{padding:12px 16px 14px}
.etiquetas{display:flex;gap:8px;margin-bottom:6px}
.precio{background:#FFE135;color:#1A0B2E;border:2px solid #1A0B2E;border-radius:999px;padding:2px 10px;font-weight:700;font-size:13px}
.precio.gratis{background:#FF2D87}
.edad{background:#1A0B2E;color:#FFF4F8;border-radius:999px;padding:2px 10px;font-weight:700;font-size:13px}
.oscuro .edad{background:#FFF4F8;color:#1A0B2E}
.tarjeta h3{font-family:'Lilita One';font-weight:400;font-size:24px;line-height:1.1}
.tarjeta p{color:var(--txt2);font-size:15px;margin-top:4px}
.barra{background:var(--barra);border-top:3px solid var(--borde);color:var(--txt2)}
.tab svg{fill:currentColor}
.tab.activa{color:var(--txt)} .tab.activa .tab-icono{background:var(--tabact);color:#1A0B2E;border:2px solid #1A0B2E}
""",
}

# ── Dirección 2: Serie Warhol ────────────────────────────────────────────────
PARES = [("#FF3EA5", "#1D2B8F"), ("#FFD400", "#C81E1E"), ("#00B3A6", "#6B1E87"), ("#1D2B8F", "#FFD400")]


def feed_warhol(modo):
    tinta = "#111111"
    p0 = PLANES[0]
    serie = "".join(
        f"""<div class="panel">{svg_plan(p0, a, b, tinta, 'rgba(0,0,0,.12)', '#FFFFFF', 10 + i, 180)}</div>""" for i, (a, b) in enumerate(PARES)
    )
    tarjetas = ""
    for i, p in enumerate(PLANES[1:4]):
        a, b = PARES[(i + 1) % 4]
        precio = f"""<span class="precio {'gratis' if p['gratis'] else ''}">{p['precio']}</span>"""
        edad = f"""<span class="edad">{p['edad']}</span>""" if p["edad"] else ""
        tarjetas += f"""<article class="tarjeta" tabindex="0"><div class="foto">{svg_plan(p, a, b, tinta, 'rgba(0,0,0,.12)', '#FFFFFF', 20 + i, 180)}</div>
          <div class="cuerpo"><h3>{p['titulo']}</h3><p>{p['meta']}</p><div class="etiquetas">{precio}{edad}</div></div></article>"""
    return f"""<div class="scroll"><header class="cabecera"><div class="logo">ROTLLO</div><p>{TEXTOS['titulo']}</p></header>
      <div class="chips">{chips(0)}</div>
      <section class="destacado" aria-label="{TEXTOS['destacado']}"><div class="serie">{serie}</div>
        <div class="pie"><span class="rotulo">{TEXTOS['destacado']}</span><h3>{p0['titulo']}</h3><p>{p0['meta']} · {p0['precio']}</p></div></section>
      <div class="lista">{tarjetas}</div></div>{barra(0)}"""


WARHOL = {
    "num": 2,
    "nombre": "Serie Warhol",
    "idea": "La galería pop: cada plan se ve como una serigrafía, y el plan destacado se repite cuatro veces cambiando los colores, como los retratos de Warhol. Fondo papel, marcos finos y letra de cartel. Es la más editorial y la que mejor luce las fotos de los locales (en duotono).",
    "fuentes": [fuente("archivo-black", "archivo-black-latin-400-normal.woff2", 400)],
    "paleta": [
        ("Papel (fondo)", "#F4F1EA"), ("Tinta", "#111111"), ("Gris tinta (texto 2)", "#4A4640"), ("Rosa serigrafía", "#FF3EA5"),
        ("Azul Klein", "#1D2B8F"), ("Amarillo", "#FFD400"), ("Rojo", "#C81E1E"), ("Turquesa", "#00B3A6"), ("Violeta", "#6B1E87"), ("Negro (fondo oscuro)", "#0D0D0F"),
    ],
    "ficha": [
        ("Tipografía", "<b>Archivo Black</b> para el logo y los títulos (de cartel, muy clara). <b>Inter</b> para el resto."),
        ("Tarjeta de plan", "Sin redondeos grandes (4 px), marco fino de 2 px. Foto en duotono con la pareja de colores de su categoría y texto debajo, como la cartela de un cuadro."),
        ("Destacado", "El plan de la noche en serie 2×2, con 4 parejas de color. Es la firma de esta dirección."),
        ("Iconos", "Trazo recto y plano, sin redondeos. La pestaña activa lleva un subrayado grueso."),
        ("Animaciones", "Al pasar de una tarjeta a otra, la foto cambia de pareja de colores durante un instante (efecto serigrafía). Pulsar invierte los colores del marco."),
        ("Modo oscuro", "Negro galería, con los paneles saturados tal cual: es donde más brilla. El texto va en color papel."),
        ("Contraste", "Tinta sobre papel 16,74:1 · tinta sobre rosa 5,83:1 · blanco sobre azul Klein 11,70:1 · papel sobre negro 17,21:1."),
    ],
    "feed": feed_warhol,
    "css": """
.telefono.claro{--fondo:#F4F1EA;--sup:#FFFFFF;--txt:#111111;--txt2:#4A4640;--marco:#111111;--chipact:#111111;--chipacttxt:#F4F1EA}
.telefono.oscuro{--fondo:#0D0D0F;--sup:#1A1A1F;--txt:#F4F1EA;--txt2:#B9B4AA;--marco:#F4F1EA;--chipact:#FFD400;--chipacttxt:#111111}
.telefono{background:var(--fondo);color:var(--txt)}
.cabecera{padding:58px 20px 10px;display:flex;align-items:baseline;justify-content:space-between}
.logo{font-family:'Archivo Black';font-size:34px;letter-spacing:-1px;background:linear-gradient(90deg,#FF3EA5 0 25%,#FFD400 25% 50%,#00B3A6 50% 75%,#1D2B8F 75%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:1.5px var(--marco)}
.cabecera p{font-weight:700;font-size:17px}
.chip{border:2px solid var(--marco);border-radius:4px;color:var(--txt)}
.chip.activo{background:var(--chipact);color:var(--chipacttxt)}
.destacado{margin:0 20px 18px;border:2px solid var(--marco);background:var(--sup)}
.serie{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--marco)}
.panel svg{display:block;width:100%;height:auto}
.pie{padding:12px 14px}
.rotulo{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--txt2)}
.destacado h3,.tarjeta h3{font-family:'Archivo Black';font-weight:400;font-size:22px;line-height:1.15;margin-top:2px}
.pie p,.tarjeta p{color:var(--txt2);font-size:15px;margin-top:4px}
.lista{display:flex;flex-direction:column;gap:14px;padding:0 20px 20px}
.tarjeta{display:grid;grid-template-columns:120px 1fr;border:2px solid var(--marco);background:var(--sup);border-radius:4px;overflow:hidden}
.tarjeta:active{outline:4px solid #FF3EA5}
.foto{border-right:2px solid var(--marco)} .foto svg{height:100%;object-fit:cover}
.cuerpo{padding:10px 12px}
.etiquetas{display:flex;gap:6px;margin-top:8px}
.precio{background:var(--txt);color:var(--fondo);padding:2px 8px;font-weight:700;font-size:13px;border-radius:2px}
.precio.gratis{background:#00B3A6;color:#111111}
.edad{border:2px solid var(--txt);padding:0 6px;font-weight:700;font-size:13px;border-radius:2px}
.barra{background:var(--fondo);border-top:2px solid var(--marco);color:var(--txt2)}
.tab svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linejoin:miter}
.tab.activa{color:var(--txt)} .tab.activa .tab-icono{border-bottom:4px solid #FF3EA5;border-radius:0}
""",
}

# ── Dirección 3: Noche Mediterránea Pop ──────────────────────────────────────
def poster_noche(plan, idx, oscuro):
    fondo = "#1D2358" if oscuro else "#2EC4B6"
    sol = ["#FF6B6B", "#FFD93D", "#FF9F1C"][idx % 3]
    mar = "#2EC4B6" if oscuro else "#12163F"
    pid = f"n{idx}{'o' if oscuro else 'c'}"
    return f"""<svg viewBox="0 0 320 150" role="img" aria-label="{plan['titulo']}"><defs>{lunares(pid, 'rgba(255,248,231,.18)', 2.6, 11)}</defs>
      <rect width="320" height="150" fill="{fondo}"/><rect width="320" height="150" fill="url(#{pid})"/>
      <circle cx="232" cy="86" r="46" fill="{sol}"/>
      <path d="M0 104 Q40 96 80 104 T160 104 T240 104 T320 104 V150 H0Z" fill="{mar}"/>
      <path d="M0 122 Q40 114 80 122 T160 122 T240 122 T320 122" fill="none" stroke="#FFF8E7" stroke-width="3" opacity=".6"/>
      <g transform="translate(-40,-14) scale(.8)">{dibujo(plan['dibujo'], fondo, '#2EC4B6' if oscuro else '#FFF8E7', '#FFF8E7' if oscuro else '#12163F')}</g>{destellos('#FFD93D', 290, 26, .7)}</svg>"""


def feed_noche(modo):
    oscuro = modo == "oscuro"
    tarjetas = ""
    for i, p in enumerate(PLANES[:3]):
        precio = f"""<span class="precio {'gratis' if p['gratis'] else ''}">{p['precio']}</span>"""
        edad = f"""<span class="edad">{p['edad']}</span>""" if p["edad"] else ""
        tarjetas += f"""<article class="tarjeta" tabindex="0">{poster_noche(p, i, oscuro)}
          <div class="cuerpo"><div class="etiquetas">{precio}{edad}</div><h3>{p['titulo']}</h3><p>{p['meta']}</p></div></article>"""
    return f"""<div class="scroll"><header class="cabecera"><div class="logo">Rotllo</div>
      <p class="saludo">{TEXTOS['titulo']}</p><p class="sub">{TEXTOS['subtitulo']}</p></header>
      <div class="chips">{chips(0)}</div><div class="lista">{tarjetas}</div></div>{barra(0)}"""


NOCHE = {
    "num": 3,
    "nombre": "Noche Mediterránea Pop",
    "idea": "Pop, pero pensada para la noche: azul noche de fondo, sol coral sobre el mar de la Malva-rosa, lunares suaves y colores de verano valenciano. Más tranquila para los ojos a las 2 de la mañana, con el carácter pop en los carteles de cada plan.",
    "fuentes": [fuente("fredoka", "fredoka-latin-600-normal.woff2", 600), fuente("fredoka", "fredoka-latin-700-normal.woff2", 700)],
    "paleta": [
        ("Azul noche (fondo)", "#12163F"), ("Superficie noche", "#1D2358"), ("Arena (texto / fondo claro)", "#FFF8E7"), ("Lavanda (texto 2)", "#C9CDF2"),
        ("Coral", "#FF6B6B"), ("Mandarina", "#FF9F1C"), ("Turquesa Malva-rosa", "#2EC4B6"), ("Amarillo luz", "#FFD93D"),
    ],
    "ficha": [
        ("Tipografía", "<b>Fredoka</b> 600-700 para el logo y los títulos (redonda y amable). <b>Inter</b> para el resto."),
        ("Tarjeta de plan", "Esquinas muy redondas (24 px), sin borde. Cartel ilustrado arriba: sol, mar y lunares, con el color de la categoría. Precio en píldora amarilla."),
        ("Iconos", "Redondeados y rellenos. La pestaña activa se enciende en amarillo, como una farola."),
        ("Animaciones", "Las tarjetas suben suavemente al aparecer. El sol del cartel se mueve un poco al hacer scroll (parallax suave)."),
        ("Modo oscuro", "Es el modo principal. El claro usa fondo arena y el azul noche como texto."),
        ("Contraste", "Arena sobre noche 16,36:1 · lavanda sobre noche 11,13:1 · noche sobre amarillo 12,58:1 · noche sobre turquesa 7,99:1."),
    ],
    "feed": feed_noche,
    "css": """
.telefono.claro{--fondo:#FFF8E7;--sup:#FFFFFF;--txt:#12163F;--txt2:#4B4F7A;--chip:#FFFFFF;--chipborde:#4B4F7A;--chipact:#2EC4B6;--barra:#FFFFFF;--tabact:#12163F;--tabactfondo:#FFD93D}
.telefono.oscuro{--fondo:#12163F;--sup:#1D2358;--txt:#FFF8E7;--txt2:#C9CDF2;--chip:#1D2358;--chipborde:#C9CDF2;--chipact:#2EC4B6;--barra:#1D2358;--tabact:#12163F;--tabactfondo:#FFD93D}
.telefono{background:var(--fondo);color:var(--txt)}
.oscuro{background:radial-gradient(circle at 80% 0%,#2A3175 0,#12163F 55%)}
.cabecera{padding:56px 20px 8px}
.logo{font-family:Fredoka;font-weight:700;font-size:40px;color:#FFD93D;text-shadow:3px 3px 0 #FF6B6B}
.claro .logo{color:#12163F;text-shadow:3px 3px 0 #FF9F1C}
.saludo{font-family:Fredoka;font-weight:600;font-size:28px;margin-top:6px}
.sub{color:var(--txt2);font-size:16px;margin-top:2px}
.chip{background:var(--chip);border:1.5px solid var(--chipborde);color:var(--txt)}
.chip.activo{background:var(--chipact);border-color:var(--chipact);color:#12163F}
.lista{display:flex;flex-direction:column;gap:16px;padding:0 20px 20px}
.tarjeta{background:var(--sup);border-radius:24px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.18);transition:transform .15s}
.tarjeta:active{transform:scale(.98)}
.cuerpo{padding:12px 16px 16px}
.etiquetas{display:flex;gap:8px;margin-bottom:6px}
.precio{background:#FFD93D;color:#12163F;border-radius:999px;padding:3px 10px;font-weight:700;font-size:13px}
.precio.gratis{background:#2EC4B6}
.edad{background:#FF6B6B;color:#12163F;border-radius:999px;padding:3px 10px;font-weight:700;font-size:13px}
.tarjeta h3{font-family:Fredoka;font-weight:600;font-size:23px;line-height:1.15}
.tarjeta p{color:var(--txt2);font-size:15px;margin-top:4px}
.barra{background:var(--barra);color:var(--txt2);border-radius:24px 24px 0 0}
.tab svg{fill:currentColor}
.tab.activa{color:var(--txt)} .tab.activa .tab-icono{background:var(--tabactfondo);color:var(--tabact)}
""",
}

if __name__ == "__main__":
    SALIDA.mkdir(parents=True, exist_ok=True)
    for d, archivo in ((POP, "1-rotllo-pop.html"), (WARHOL, "2-serie-warhol.html"), (NOCHE, "3-noche-mediterranea-pop.html")):
        (SALIDA / archivo).write_text(pagina(d), encoding="utf-8")
        print("escrito", SALIDA / archivo)
