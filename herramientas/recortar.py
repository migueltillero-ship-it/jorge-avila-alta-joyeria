"""
recortar.py  ·  Quita el fondo de la foto de una joya y deja un PNG con transparencia.
Uso: python recortar.py <foto.jpg> <salida.png> [--aros]
  --aros  además vacía los huecos interiores de los marcos (el papel que se ve dentro del aro).
"""
import sys
import numpy as np, scipy.ndimage as nd
from PIL import Image
from rembg import remove, new_session

src, dst = sys.argv[1], sys.argv[2]
aros = "--aros" in sys.argv
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(int)
# capturas de pantalla del teléfono: recorta las franjas negras de arriba y abajo
rows = np.where(a.mean(axis=(1, 2)) > 110)[0]
if len(rows):
    runs = np.split(rows, np.where(np.diff(rows) > 3)[0] + 1); r = max(runs, key=len)
    im = im.crop((0, r[0] + 4, im.width, r[-1] - 4))
if im.width < 900 and not aros:
    im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
out = np.asarray(remove(im, session=new_session("isnet-general-use"))).copy()
m = out[..., 3] > 40
lab, k = nd.label(m); sizes = nd.sum(m, lab, range(1, k + 1))
keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 0.04 * sizes.max()])
if aros:
    g = np.asarray(im.convert("L")).astype(float)
    std = np.sqrt(np.maximum(nd.uniform_filter(g * g, 7) - nd.uniform_filter(g, 7) ** 2, 0))
    hsv = np.asarray(im.convert("HSV")).astype(int)
    ys = np.where(keep.any(1))[0]; y0 = ys[0] + int(0.38 * (ys[-1] - ys[0]))
    cand = keep & (hsv[..., 1] < 70) & (std < 9); cand[:y0] = False
    cand = nd.binary_opening(cand, iterations=2)
    lab, k = nd.label(cand); kill = np.zeros_like(cand)
    for i, sl in enumerate(nd.find_objects(lab), 1):
        if (sl[0].stop - sl[0].start) >= 25 and (sl[1].stop - sl[1].start) >= 25: kill |= lab == i
    kill = nd.binary_closing(kill, iterations=3) & keep & (hsv[..., 1] < 70)
    kill = nd.binary_fill_holes(kill) & (hsv[..., 1] < 70)
    keep &= ~kill
out[..., 3] = np.where(keep, out[..., 3], 0)
yy, xx = np.where(out[..., 3] > 40); pad = 20
Image.fromarray(out).crop((max(xx.min() - pad, 0), max(yy.min() - pad, 0), xx.max() + pad, yy.max() + pad)).save(dst)
print("RECORTE_OK", dst)
