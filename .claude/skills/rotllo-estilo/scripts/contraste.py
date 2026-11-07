#!/usr/bin/env python3
"""Calcula el contraste WCAG 2.x entre pares de colores.

Uso:
  python3 contraste.py "#FFFFFF" "#C2410C"            # un par: texto fondo
  python3 contraste.py "#FFF/#C2410C" "#57534E/#FFF7ED"  # varios pares texto/fondo

Umbrales (WCAG AA):
  - Texto normal: >= 4.5
  - Texto grande (>= 24px, o >= 18.66px en negrita) e iconos/bordes de UI: >= 3.0
Sale con código 1 si algún par no llega a 3.0, para poder usarlo en scripts.
"""
import sys


def _hex_a_rgb(h: str):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError(f"Color no válido: #{h}")
    return [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]


def _luminancia(h: str) -> float:
    def canal(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (canal(c) for c in _hex_a_rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contraste(a: str, b: str) -> float:
    la, lb = sorted((_luminancia(a), _luminancia(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main(args):
    if len(args) == 2 and "/" not in args[0]:
        pares = [(args[0], args[1])]
    else:
        pares = [tuple(p.split("/")) for p in args]
    if not pares:
        print(__doc__)
        return 2
    peor = 99.0
    for texto, fondo in pares:
        r = contraste(texto, fondo)
        peor = min(peor, r)
        if r >= 4.5:
            veredicto = "OK para todo"
        elif r >= 3.0:
            veredicto = "solo texto grande / iconos"
        else:
            veredicto = "NO PASA"
        print(f"{texto:>9} sobre {fondo:<9} {r:5.2f}:1  {veredicto}")
    return 0 if peor >= 3.0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
