"""
joya3d.py  ·  Reconstrucción 3D fiel de una joya a partir de su recorte (PNG con transparencia).

Principio: la forma NUNCA se inventa.
  · Cada piedra se extruye desde su contorno exacto en la foto y conserva su textura real.
  · La plata se reconstruye con su eje medio: cada punto del metal se vuelve una esfera
    del ancho que tiene en la foto, así el contorno 3D coincide con el de la foto.
  · Solo el grosor en profundidad (que una foto frontal no muestra) es una aproximación.

Uso:  python joya3d.py -- <recorte.png> <salida_dir> <alto_mm> <modo> [frames]
      modo: glb | video | terciopelo | still | todo
"""
import sys, os, math, json
import numpy as np
from PIL import Image
import scipy.ndimage as nd
import cv2
from skimage.morphology import skeletonize
import bpy, bmesh
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
SRC, OUT, ALTO_MM, MODO = argv[0], argv[1], float(argv[2]), argv[3]
FRAMES = int(argv[4]) if len(argv) > 4 else 48
SAMPLES = int(os.environ.get("JP_SAMPLES", "16"))
RES = os.environ.get("JP_RES", "1280x720")
os.makedirs(OUT, exist_ok=True)
TEXH = 1024
log = {"src": SRC}

# ------------------------------------------------------------------ 1. máscaras
im = Image.open(SRC).convert("RGBA")
im = im.resize((max(1, round(im.width * TEXH / im.height)), TEXH), Image.LANCZOS)
rgba = np.asarray(im).astype(np.float32) / 255.0
H, W = rgba.shape[:2]
# balance de blancos: el metal es plata, así que sus píxeles menos saturados deben quedar neutros
_hs = np.asarray(im.convert("RGB").convert("HSV")).astype(np.float32) / 255.0
_A = rgba[..., 3] > 0.5
_sat = _hs[..., 1][_A]
if _sat.size:
    _low = _A & (_hs[..., 1] <= np.percentile(_sat, 30)) & (_hs[..., 2] > 0.35)
    if _low.sum() > 50:
        ref = np.median(rgba[..., :3][_low], axis=0)
        gain = ref.mean() / np.maximum(ref, 1e-3)
        rgba[..., :3] = np.clip(rgba[..., :3] * gain, 0, 1)
        im = Image.fromarray((rgba * 255).astype(np.uint8), "RGBA")
px = ALTO_MM / H                                # milímetros por píxel (1 unidad de Blender = 1 mm)
A = nd.gaussian_filter(rgba[..., 3], 1.2) > 0.5
lab, k = nd.label(A)
if k > 1:
    s = nd.sum(A, lab, range(1, k + 1))
    A = np.isin(lab, [i + 1 for i, v in enumerate(s) if v > 0.002 * s.max()])
hsv = np.asarray(im.convert("RGB").convert("HSV")).astype(np.float32) / 255.0
from skimage.segmentation import watershed
_hue = hsv[..., 0] * 360
stone = A & (hsv[..., 1] > float(os.environ.get("JP_SAT", "0.17"))) & (hsv[..., 2] > 0.12) & ((_hue < 55) | (_hue > 320))
stone = nd.binary_opening(stone, iterations=2)
stone = nd.binary_closing(stone, iterations=3)
stone = nd.binary_fill_holes(stone) & A
# separar piedras unidas por la bisagra: semillas erosionadas + cuenca hidrográfica
dist_s = nd.distance_transform_edt(stone)
seeds, ns = nd.label(nd.binary_erosion(stone, iterations=7))
if ns:
    ss = nd.sum(np.ones_like(seeds), seeds, range(1, ns + 1))
    seeds = np.where(np.isin(seeds, [i + 1 for i, v in enumerate(ss) if v > 60]), seeds, 0)
ws = watershed(-dist_s, seeds, mask=stone) if seeds.any() else nd.label(stone)[0]
stones = []
ids = [i for i in np.unique(ws) if i]
if ids:
    sizes = {i: (ws == i).sum() for i in ids}; big = max(sizes.values())
    for i in ids:
        if sizes[i] > 0.03 * big and sizes[i] > 300:
            m = nd.binary_opening(ws == i, iterations=2)
            m = nd.binary_fill_holes(m)
            if m.sum() > 300: stones.append(m)
# las vetas blancas de la rodocrosita casi no tienen color: se recupera la piedra completa
# con su envolvente convexa, recortada por el contorno real de la joya (menos el engaste)
from skimage.morphology import convex_hull_image
A_in = nd.binary_erosion(A, iterations=max(1, int(0.22 / px)))
llenas = []
for i, m in enumerate(stones):
    otras = np.zeros_like(A)
    for k2, m2 in enumerate(stones):
        if k2 != i: otras |= nd.binary_dilation(m2, iterations=max(1, int(0.35 / px)))
    h = convex_hull_image(m) & A_in & ~otras
    lab_h, kh = nd.label(h)
    if kh > 1:
        sz = nd.sum(h, lab_h, range(1, kh + 1)); h = lab_h == (np.argmax(sz) + 1)
    llenas.append(nd.binary_fill_holes(h | m) & A)
stones = llenas
stone = np.zeros_like(A)
for m in stones: stone |= m
metal = A & ~stone
log["piedras"] = len(stones)

def P(x, y, d):
    """píxel (x,y) + profundidad en mm (negativo = hacia la cámara) -> mm."""
    return Vector(((x - W / 2) * px, d, (H / 2 - y) * px))

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def material(nombre, color, metal_v, rough, coat=0.0, tex=None):
    m = bpy.data.materials.new(nombre); m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metal_v
    p.inputs["Roughness"].default_value = rough
    p.inputs["Coat Weight"].default_value = coat
    p.inputs["Coat Roughness"].default_value = 0.05
    if tex:
        t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = bpy.data.images.load(tex)
        m.node_tree.links.new(t.outputs["Color"], p.inputs["Base Color"])
    return m

SILVER = (0.95, 0.95, 0.96)
rgb = (rgba[..., :3] * 255).astype(np.uint8)
Image.fromarray(rgb).save(os.path.join(OUT, "_foto.jpg"), quality=92)
M_AG = material("plata", SILVER, 1.0, 0.07)
M_BK = material("plata_satinada", SILVER, 1.0, 0.32)
M_ST = material("piedra", (1, 1, 1), 0.0, 0.22, coat=0.55, tex=os.path.join(OUT, "_foto.jpg"))

def contorno(mask, sigma=2.0, eps=0.5):
    cs, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)[:, 0, :].astype(float)
    c = np.stack([nd.gaussian_filter1d(c[:, 0], sigma, mode="wrap"), nd.gaussian_filter1d(c[:, 1], sigma, mode="wrap")], 1)
    c = cv2.approxPolyDP(c.astype(np.float32).reshape(-1, 1, 2), eps, True)[:, 0, :].astype(float)
    return c

# ------------------------------------------------------------------ 2. piedras: contorno exacto extruido
TOP, BOT = -1.35, 0.0
objs = []
for i, m in enumerate(stones):
    # cara superior: malla de píxeles de la propia piedra (sin triangulaciones dudosas)
    m2 = nd.binary_erosion(m, iterations=1)
    STEP = 2
    ys, xs = np.mgrid[0:H:STEP, 0:W:STEP]; ins = m2[ys, xs]
    idx = -np.ones(ys.shape, np.int64); idx[ins] = np.arange(ins.sum())
    vs = [P(x, y, TOP) for x, y in zip(xs[ins], ys[ins])]
    q = (idx[:-1, :-1] >= 0) & (idx[:-1, 1:] >= 0) & (idx[1:, 1:] >= 0) & (idx[1:, :-1] >= 0)
    fs = np.stack([idx[:-1, :-1][q], idx[:-1, 1:][q], idx[1:, 1:][q], idx[1:, :-1][q]], 1).tolist()
    me = bpy.data.meshes.new(f"piedra{i}"); me.from_pydata([tuple(v) for v in vs], [], fs)
    uvl = me.uv_layers.new(name="UVMap")
    li = np.empty(len(me.loops), np.int64); me.loops.foreach_get("vertex_index", li)
    uvv = np.stack([xs[ins] / (W - 1), 1 - ys[ins] / (H - 1)], 1)
    uvl.data.foreach_set("uv", uvv[li].astype(np.float32).ravel())
    me.update()
    o = bpy.data.objects.new(f"piedra{i}", me); sc.collection.objects.link(o)
    me.materials.append(M_ST); me.materials.append(M_AG)
    if me.polygons and me.polygons[0].normal.y > 0: me.flip_normals()
    sol = o.modifiers.new("cuerpo", "SOLIDIFY"); sol.thickness = abs(TOP - BOT); sol.offset = 1.0
    sol.use_rim = True; sol.material_offset = 1; sol.material_offset_rim = 1
    bpy.context.view_layer.update()
    me2 = bpy.data.meshes.new_from_object(o.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(o); o = bpy.data.objects.new(f"piedra{i}", me2); sc.collection.objects.link(o)
    objs.append(o)

# ------------------------------------------------------------------ 3. plata: eje medio -> metaesferas
def metal_desde(mask, k_rad, prof_max, centro):
    dist = nd.distance_transform_edt(mask)
    sk = skeletonize(mask)
    ys, xs = np.nonzero(sk)
    mb = bpy.data.metaballs.new("plata")
    mb.resolution = mb.render_resolution = 0.06
    mb.threshold = 0.6
    rmin = 0.30 / px                    # 0,30 mm: grosor mínimo real de un alambre
    for x, y in zip(xs, ys):
        r = max(dist[y, x], rmin)
        e = mb.elements.new(); e.type = "ELLIPSOID"
        e.co = P(x, y, centro)
        e.radius = r * px * k_rad
        zr = min(r * px, prof_max) / (r * px)
        e.size_x, e.size_y, e.size_z = 1.0, zr, 1.0
        e.stiffness = 2.0
    o = bpy.data.objects.new("plata_mb", mb); sc.collection.objects.link(o)
    return o, len(xs)

def a_malla(o):
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    mb = o.data; bpy.data.objects.remove(o); bpy.data.metaballs.remove(mb)
    n = bpy.data.objects.new("plata", me); sc.collection.objects.link(n)
    return n

def huella(o):
    """Proyección frontal de la malla, en píxeles de la foto (para verificar fidelidad)."""
    img = np.zeros((H, W), np.uint8)
    me = o.data; co = np.empty(len(me.vertices) * 3); me.vertices.foreach_get("co", co); co = co.reshape(-1, 3)
    mw = o.matrix_world
    pts = np.array([((mw @ Vector(v)).x / px + W / 2, H / 2 - (mw @ Vector(v)).z / px) for v in co])
    for p in me.polygons:
        poly = pts[list(p.vertices)].astype(np.int32)
        cv2.fillPoly(img, [poly], 1)
    return img.astype(bool)

# engaste: tubo pulido que sigue el contorno exacto de cada piedra
R_BISEL = 0.26
for i, m in enumerate(stones):
    cc = contorno(m, sigma=3.0, eps=0.35)
    # desplaza el contorno hacia afuera para que el tubo abrace la piedra
    ctr = cc.mean(0); v = cc - ctr; nv = np.linalg.norm(v, axis=1, keepdims=True) + 1e-6
    cc = cc + v / nv * (R_BISEL * 0.55 / px)
    cu = bpy.data.curves.new(f"bisel{i}", "CURVE"); cu.dimensions = "3D"
    sp = cu.splines.new("POLY"); sp.points.add(len(cc) - 1)
    for j, (x, y) in enumerate(cc):
        q = P(x, y, TOP + 0.05); sp.points[j].co = (q.x, q.y, q.z, 1)
    sp.use_cyclic_u = True
    cu.bevel_depth = R_BISEL; cu.bevel_resolution = 4; cu.resolution_u = 2
    ob_c = bpy.data.objects.new(f"bisel{i}", cu); sc.collection.objects.link(ob_c)
    bpy.context.view_layer.update()
    me = bpy.data.meshes.new_from_object(ob_c.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    bpy.data.objects.remove(ob_c); o = bpy.data.objects.new(f"bisel{i}", me); sc.collection.objects.link(o)
    me.materials.append(M_AG)
    for pl in me.polygons: pl.use_smooth = True
    objs.append(o)
banda = np.zeros_like(A)
for m in stones: banda |= nd.binary_dilation(m, iterations=int(0.5 / px) + 1)
metal_mb = metal & ~banda
lab, k = nd.label(metal_mb)
if k:
    s = nd.sum(metal_mb, lab, range(1, k + 1))
    metal_mb = np.isin(lab, [i + 1 for i, v in enumerate(s) if v > 40])
metal = metal_mb

k_rad = 1.3
for intento in range(3):
    mbo, npts = metal_desde(metal, k_rad, 0.62, -0.75)
    plata = a_malla(mbo)
    fp = huella(plata)
    area_real, area_3d = metal.sum(), (fp & ~stone).sum()
    ratio = area_3d / max(area_real, 1)
    iou = (fp & metal).sum() / max((fp | metal).sum(), 1)
    log.setdefault("verificacion_plata", []).append({"k": round(k_rad, 3), "area": round(float(ratio), 3), "iou": round(float(iou), 3)})
    if 0.97 <= ratio <= 1.06 or intento == 2: break
    k_rad *= math.sqrt(1.0 / ratio) if ratio > 0 else 1.2
    bpy.data.objects.remove(plata)
plata.name = "plata"; plata.data.materials.clear(); plata.data.materials.append(M_AG)
for p in plata.data.polygons: p.use_smooth = True
objs.append(plata)

# placa trasera de plata detrás de cada piedra (las joyas reales tienen el respaldo cerrado)
for i, m in enumerate(stones):
    md = nd.binary_dilation(m, iterations=int(0.25 / px) + 1) & A
    c = contorno(md)
    bm = bmesh.new()
    a1 = [bm.verts.new(P(x, y, -0.05)) for x, y in c]; a2 = [bm.verts.new(P(x, y, 0.55)) for x, y in c]
    bm.faces.new(list(reversed(a1))); bm.faces.new(a2); n = len(c)
    for j in range(n): bm.faces.new((a1[j], a2[j], a2[(j + 1) % n], a1[(j + 1) % n]))
    bmesh.ops.triangulate(bm, faces=bm.faces[:]); bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(f"respaldo{i}"); bm.to_mesh(me); bm.free(); me.materials.append(M_BK)
    o = bpy.data.objects.new(f"respaldo{i}", me); sc.collection.objects.link(o); objs.append(o)

# verificación global del contorno
tot = np.zeros((H, W), bool)
for o in objs: tot |= huella(o)
log["iou_contorno"] = round(float((tot & A).sum() / max((tot | A).sum(), 1)), 4)
Image.fromarray((np.stack([A, tot, tot & A], 2) * 255).astype(np.uint8)).save(os.path.join(OUT, "_verificacion.png"))

# unir todo en un objeto
for x in bpy.context.selected_objects: x.select_set(False)
for o in objs: o.select_set(True)
bpy.context.view_layer.objects.active = plata
bpy.ops.object.join()
joya = bpy.context.view_layer.objects.active; joya.name = "joya"
bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
joya.location = (0, 0, 0)
log["triangulos"] = sum(len(p.vertices) - 2 for p in joya.data.polygons)

# ------------------------------------------------------------------ 5. estudio de joyería
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.cycles.max_bounces = 8; sc.cycles.glossy_bounces = 6
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - High Contrast"
world = bpy.data.worlds.new("estudio"); sc.world = world; world.use_nodes = True
wn = world.node_tree.nodes; wl = world.node_tree.links
bg = wn["Background"]
tc = wn.new("ShaderNodeTexCoord"); sep = wn.new("ShaderNodeSeparateXYZ"); ramp = wn.new("ShaderNodeValToRGB")
mp = wn.new("ShaderNodeMapRange"); wl.new(tc.outputs["Generated"], sep.inputs[0]); wl.new(sep.outputs["Z"], mp.inputs["Value"]); mp.inputs["From Min"].default_value = -1.0; wl.new(mp.outputs[0], ramp.inputs["Fac"])
els = ramp.color_ramp.elements
els[0].position, els[0].color = 0.0, (0.03, 0.03, 0.035, 1)
els[1].position, els[1].color = 1.0, (0.55, 0.55, 0.58, 1)
e2 = els.new(0.55); e2.color = (2.2, 2.2, 2.25, 1)
e3 = els.new(0.50); e3.color = (0.06, 0.06, 0.065, 1)
e4 = els.new(0.62); e4.color = (0.12, 0.12, 0.13, 1)
lp = wn.new("ShaderNodeLightPath"); mix = wn.new("ShaderNodeMixRGB")
wl.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"]); wl.new(ramp.outputs["Color"], mix.inputs[1])
mix.inputs[2].default_value = (0, 0, 0, 1)
wl.new(mix.outputs[0], bg.inputs["Color"]); bg.inputs["Strength"].default_value = 1.0

dims = joya.dimensions; S = max(dims.z, dims.x)
def tarjeta(nombre, loc, size, fuerza, color=(1, 1, 1)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    p = bpy.context.object; p.name = nombre; p.scale = (size[0], size[1], 1)
    d = Vector((0, 0, 0)) - p.location; p.rotation_euler = d.to_track_quat("Z", "Y").to_euler()
    m = bpy.data.materials.new(nombre); m.use_nodes = True; n = m.node_tree.nodes; n.remove(n["Principled BSDF"])
    e = n.new("ShaderNodeEmission"); e.inputs["Color"].default_value = (*color, 1); e.inputs["Strength"].default_value = fuerza
    m.node_tree.links.new(e.outputs[0], n["Material Output"].inputs[0])
    p.data.materials.append(m); p.visible_camera = False
    return p
tarjeta("clave", (-1.3 * S, -1.6 * S, 1.0 * S), (1.4 * S, 2.2 * S), 6)
tarjeta("relleno", (1.5 * S, -1.5 * S, 0.0), (0.9 * S, 2.6 * S), 3.5, (1, 0.96, 0.92))
tarjeta("contra", (0.2 * S, 1.5 * S, 1.4 * S), (2.4 * S, 0.5 * S), 10)
tarjeta("filo", (-1.6 * S, 0.6 * S, -0.4 * S), (0.3 * S, 2.4 * S), 8)

cam_d = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cam_d); sc.collection.objects.link(cam); sc.camera = cam
cam_d.lens = 100; cam_d.clip_start = 1; cam_d.clip_end = 100000; cam_d.dof.use_dof = True; cam_d.dof.aperture_fstop = 11
foco = bpy.data.objects.new("foco", None); sc.collection.objects.link(foco)
cam_d.dof.focus_object = foco
trk = cam.constraints.new("TRACK_TO"); trk.target = foco; trk.track_axis = "TRACK_NEGATIVE_Z"; trk.up_axis = "UP_Y"
rx, ry = map(int, RES.split("x")); sc.render.resolution_x, sc.render.resolution_y = rx, ry

def encuadre(ang_deg, alto_frac, elev=0.0, objetivo=(0, 0, 0)):
    """Coloca la cámara y ajusta la distancia hasta que la joya ocupe alto_frac del cuadro."""
    foco.location = objetivo
    a = math.radians(ang_deg); d = S * 3
    for _ in range(12):
        cam.location = (math.sin(a) * d, -math.cos(a) * d, objetivo[2] + elev * d)
        bpy.context.view_layer.update()
        zs = [world_to_camera_view(sc, cam, joya.matrix_world @ Vector(c)) for c in joya.bound_box]
        alto = max(p.y for p in zs) - min(p.y for p in zs)
        d *= alto / alto_frac
    return d

# ------------------------------------------------------------------ 6. video de presentación (fondo negro)
if MODO in ("video", "todo", "still", "web"):
    n = FRAMES if MODO != "still" else 1
    sc.frame_start, sc.frame_end = 1, n
    plan = [(1, -34, 0.80, 0.00, (0, 0, 0)),
            (max(2, int(n * 0.55)), 12, 0.95, 0.04, (0, 0, 0)),
            (max(3, n), 30, 1.85, 0.08, (0, 0, dims.z * 0.18))]
    if MODO == "still": plan = [(1, -18, 0.86, 0.03, (0, 0, 0))]
    for f, ang, frac, elev, obj in plan:
        encuadre(ang, frac, elev, obj)
        cam.keyframe_insert("location", frame=f); foco.keyframe_insert("location", frame=f)
    for o in (cam, foco):
        if o.animation_data:
            for fc in o.animation_data.action.fcurves:
                for kp in fc.keyframe_points: kp.interpolation = "BEZIER"
    sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 93
    if MODO == "still":
        sc.render.filepath = os.path.join(OUT, "still.jpg"); bpy.ops.render.render(write_still=True)
    else:
        sc.render.filepath = os.path.join(OUT, "frames", "f_####"); bpy.ops.render.render(animation=True)

# ------------------------------------------------------------------ 7. imagen de campaña en terciopelo azul
if MODO in ("terciopelo", "todo"):
    if cam.animation_data: cam.animation_data_clear()
    if foco.animation_data: foco.animation_data_clear()
    sc.render.resolution_x, sc.render.resolution_y = 1000, 1600
    joya.rotation_euler = (math.radians(-90), 0, math.radians(3))     # recostada boca arriba
    bpy.context.view_layer.update()
    joya.location.z = -min((joya.matrix_world @ Vector(c)).z for c in joya.bound_box)
    bpy.ops.mesh.primitive_plane_add(size=S * 12, location=(0, 0, 0))
    piso = bpy.context.object
    mv = bpy.data.materials.new("terciopelo"); mv.use_nodes = True; nv = mv.node_tree; Pv = nv.nodes["Principled BSDF"]
    noise = nv.nodes.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 900; noise.inputs["Detail"].default_value = 10
    rmp = nv.nodes.new("ShaderNodeValToRGB")
    rmp.color_ramp.elements[0].color = (0.010, 0.022, 0.075, 1); rmp.color_ramp.elements[1].color = (0.030, 0.065, 0.190, 1)
    nv.links.new(noise.outputs["Fac"], rmp.inputs["Fac"]); nv.links.new(rmp.outputs["Color"], Pv.inputs["Base Color"])
    bump = nv.nodes.new("ShaderNodeBump"); bump.inputs["Strength"].default_value = 0.15
    nv.links.new(noise.outputs["Fac"], bump.inputs["Height"]); nv.links.new(bump.outputs["Normal"], Pv.inputs["Normal"])
    Pv.inputs["Roughness"].default_value = 0.9
    Pv.inputs["Sheen Weight"].default_value = 0.6; Pv.inputs["Sheen Roughness"].default_value = 0.4
    Pv.inputs["Sheen Tint"].default_value = (0.25, 0.35, 0.8, 1)
    piso.data.materials.append(mv)
    for nm in ("clave", "relleno", "contra", "filo"):
        bpy.data.objects.remove(bpy.data.objects[nm])
    tarjeta("cenital", (S * 0.5, -S * 0.7, S * 2.2), (S * 2.0, S * 1.6), 6.0, (1, 0.94, 0.88))
    tarjeta("lateral", (-S * 2.0, S * 0.2, S * 1.0), (S * 0.6, S * 2.4), 6.0)
    tarjeta("fondo", (S * 0.3, S * 2.2, S * 1.2), (S * 2.4, S * 0.5), 5.0)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35
    cam_d.dof.aperture_fstop = 9
    foco.location = (0, 0, 0)
    a = math.radians(0); d = S * 3
    for _ in range(12):
        cam.location = (0, -d * 0.45, d * 0.89); bpy.context.view_layer.update()
        zs = [world_to_camera_view(sc, cam, joya.matrix_world @ Vector(c)) for c in joya.bound_box]
        alto = max(p.y for p in zs) - min(p.y for p in zs); ancho = max(p.x for p in zs) - min(p.x for p in zs)
        d *= max(alto / 0.68, ancho / 0.86)
    sc.cycles.samples = max(SAMPLES * 3, 32)
    sc.render.image_settings.file_format = "JPEG"; sc.render.image_settings.quality = 92
    sc.render.filepath = os.path.join(OUT, "terciopelo.jpg"); bpy.ops.render.render(write_still=True)

# ------------------------------------------------------------------ 4. GLB para la web
if MODO in ("glb", "todo", "web"):
    for o in list(bpy.data.objects):
        if o.name != "joya": bpy.data.objects.remove(o)
    joya.rotation_euler = (0, 0, 0); joya.location = (0, 0, 0)
    joya.scale = (0.001, 0.001, 0.001)
    dec = joya.modifiers.new("ligero", "DECIMATE"); dec.ratio = min(1.0, 60000 / max(log["triangulos"], 1))
    kw = dict(filepath=os.path.join(OUT, "modelo.glb"), export_format="GLB", use_selection=False,
              export_apply=True, export_image_format="JPEG", export_jpeg_quality=88)
    try:
        bpy.ops.export_scene.gltf(**kw, export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7)
    except Exception as e:
        log["draco"] = str(e); bpy.ops.export_scene.gltf(**kw)
    joya.modifiers.remove(dec); joya.scale = (1, 1, 1)


json.dump(log, open(os.path.join(OUT, "informe.json"), "w"), indent=1, ensure_ascii=False)
print("JOYA3D_OK", json.dumps(log, ensure_ascii=False))
