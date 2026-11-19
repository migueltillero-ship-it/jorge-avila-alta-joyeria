# =============================================================================
#  NUEVA_PIEZA.ps1  ·  Agrega una joya al sitio con su modelo 3D, su video y su imagen de campaña
#
#  Ejemplo:
#    .\herramientas\NUEVA_PIEZA.ps1 -Foto "C:\Users\alian\Downloads\nueva.jpg" -Id 23 -AltoMM 42
#    .\herramientas\NUEVA_PIEZA.ps1 -Foto "...\aros.jpg" -Id 24 -AltoMM 40 -Aros
#
#  Ciclo automático: recorte -> verificación -> reconstrucción 3D con varios umbrales ->
#  verificación de fidelidad (se queda con la versión cuyo contorno coincide mejor con la foto)
#  -> video de presentación -> imagen de campaña -> copia al sitio.
#  AltoMM: alto real aproximado de la pieza, con argolla o gancho incluidos.
# =============================================================================
param(
    [Parameter(Mandatory = $true)][string]$Foto,
    [Parameter(Mandatory = $true)][string]$Id,
    [double]$AltoMM = 42,
    [switch]$Aros,
    [int]$Muestras = 16
)
$ErrorActionPreference = "Stop"
$Raiz = Split-Path -Parent $PSScriptRoot
$Py = Join-Path $Raiz "herramientas\.venv\Scripts\python.exe"
$Id = $Id.PadLeft(2, "0")
$Trabajo = Join-Path $Raiz "herramientas\trabajo\$Id"
New-Item -ItemType Directory -Force -Path $Trabajo | Out-Null
function Paso($t) { Write-Host ""; Write-Host "== $t ==" -ForegroundColor Cyan }
function Ok($t) { Write-Host "  [OK] $t" -ForegroundColor Green }
function Mal($t) { Write-Host "  [!!] $t" -ForegroundColor Yellow }

if (-not (Test-Path $Py)) { throw "Falta el entorno de herramientas. Ejecuta primero INSTALAR.ps1" }
if (-not (Test-Path $Foto)) { throw "No encuentro la foto: $Foto" }

Paso "1. Recorte del fondo"
$recorte = Join-Path $Trabajo "recorte.png"
$args1 = @((Join-Path $Raiz "herramientas\recortar.py"), $Foto, $recorte)
if ($Aros) { $args1 += "--aros" }
& $Py @args1
if (-not (Test-Path $recorte)) { throw "El recorte falló" }
Ok "recorte listo: $recorte (revísalo: debe verse solo la joya)"

Paso "2. Reconstrucción 3D con verificación de fidelidad"
$mejor = $null; $mejorIoU = -1
foreach ($sat in @("0.17", "0.12", "0.25", "0.33")) {
    $dir = Join-Path $Trabajo "sat_$sat"
    $env:JP_SAT = $sat; $env:JP_SAMPLES = "8"
    & $Py (Join-Path $Raiz "herramientas\joya3d.py") -- $recorte $dir $AltoMM still 2>&1 | Select-String "JOYA3D_OK|Error" | ForEach-Object { $_.Line.Substring(0, [Math]::Min(160, $_.Line.Length)) }
    $inf = Join-Path $dir "informe.json"
    if (Test-Path $inf) {
        $j = Get-Content $inf -Raw | ConvertFrom-Json
        Write-Host ("  umbral {0}: coincidencia del contorno {1:P1}, piedras {2}" -f $sat, $j.iou_contorno, $j.piedras)
        if ($j.iou_contorno -gt $mejorIoU) { $mejorIoU = $j.iou_contorno; $mejor = $sat }
    }
}
if ($null -eq $mejor) { throw "No se pudo reconstruir la pieza" }
if ($mejorIoU -lt 0.88) { Mal ("La mejor coincidencia es {0:P1}. Revisa el recorte antes de publicar." -f $mejorIoU) } else { Ok ("umbral elegido {0} (coincidencia {1:P1})" -f $mejor, $mejorIoU) }

Paso "3. Modelo, video de presentación e imagen de campaña (puede tardar 10 a 30 minutos)"
$final = Join-Path $Trabajo "final"
$env:JP_SAT = $mejor; $env:JP_SAMPLES = "$Muestras"; $env:JP_RES = "960x540"
& $Py (Join-Path $Raiz "herramientas\joya3d.py") -- $recorte $final $AltoMM todo 40 2>&1 | Select-String "JOYA3D_OK|Error"

Paso "4. Codificación del video"
$d3 = Join-Path $Raiz "assets\3d"; New-Item -ItemType Directory -Force -Path $d3 | Out-Null
$n = (Get-ChildItem (Join-Path $final "frames") -Filter *.jpg).Count
$dur = [Math]::Round($n / 8, 2); $fo = [Math]::Round($dur - 0.9, 2)
$vf = "minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,scale=1280:720:flags=lanczos,fade=t=in:st=0:d=0.8,fade=t=out:st=$($fo):d=0.9"
ffmpeg -y -loglevel error -framerate 8 -i (Join-Path $final "frames\f_%04d.jpg") -vf $vf -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -movflags +faststart -an (Join-Path $d3 "$Id.mp4")
$medio = "{0:D4}" -f [int]($n * 0.55)
ffmpeg -y -loglevel error -i (Join-Path $final "frames\f_$medio.jpg") -vf "scale=1280:720:flags=lanczos" -q:v 3 (Join-Path $d3 "$Id.jpg")
Copy-Item (Join-Path $final "modelo.glb") (Join-Path $d3 "$Id.glb") -Force
Copy-Item (Join-Path $final "terciopelo.jpg") (Join-Path $Raiz "assets\piezas\$($Id)_ambiente.jpg") -Force
Copy-Item $recorte (Join-Path $Raiz "assets\piezas\probador\$Id.png") -Force
Copy-Item $Foto (Join-Path $Raiz "assets\piezas\$($Id)_real.jpg") -Force

Paso "5. Verificación final"
foreach ($f in @("assets\3d\$Id.mp4", "assets\3d\$Id.jpg", "assets\3d\$Id.glb", "assets\piezas\$($Id)_ambiente.jpg", "assets\piezas\$($Id)_real.jpg", "assets\piezas\probador\$Id.png")) {
    $p = Join-Path $Raiz $f
    if ((Test-Path $p) -and ((Get-Item $p).Length -gt 1000)) { Ok $f } else { Mal "falta $f" }
}
Write-Host ""
Write-Host "Último paso: agrega la ficha de la obra $Id en js\catalog.js (copia el bloque de otra obra de la colección vetas y cambia id, textos y precio)." -ForegroundColor Cyan
Write-Host "Luego revisa en el navegador con:  .\INSTALAR.ps1 -SoloVer" -ForegroundColor Cyan
