# =============================================================================
#  INSTALAR.ps1  ·  Jorge Ávila, alta joyería: proyecto local, herramientas 3D y verificación
#
#  Uso (en PowerShell, desde la carpeta Descargas):
#     powershell -ExecutionPolicy Bypass -File .\INSTALAR.ps1              instala o actualiza todo
#     powershell -ExecutionPolicy Bypass -File .\INSTALAR.ps1 -Publicar    además sube a GitHub
#     powershell -ExecutionPolicy Bypass -File .\INSTALAR.ps1 -SoloVer     solo abre la vista previa
#
#  Ciclo: diagnóstico -> instalación -> verificación -> implementación -> verificación ->
#         corrección -> verificación (hasta 3 intentos por paso). Todo queda en un registro.
# =============================================================================
param(
    [string]$Paquete = (Join-Path $env:USERPROFILE "Downloads\jorge-perez-v3.zip"),
    [string]$Destino = (Join-Path $env:USERPROFILE "Proyectos\jorge-perez-alta-joyeria"),
    [string]$Anterior = (Join-Path $env:USERPROFILE "Downloads\jorge-perez-alta-joyeria"),
    [switch]$Publicar,
    [switch]$SoloVer,
    [switch]$SinHerramientas3D
)
$ErrorActionPreference = "Continue"
$env:GIT_ASK_YESNO = "false"   # git nunca debe quedarse esperando una respuesta (y/n)
$Registro = Join-Path $env:USERPROFILE "Downloads\instalacion_jorge_perez.log"
Start-Transcript -Path $Registro -Append | Out-Null
$fallos = New-Object System.Collections.ArrayList
function Paso($t) { Write-Host ""; Write-Host "== $t ==" -ForegroundColor Cyan }
function Ok($t) { Write-Host "  [OK] $t" -ForegroundColor Green }
function Mal($t) { Write-Host "  [!!] $t" -ForegroundColor Yellow; [void]$fallos.Add($t) }
function Refrescar-Path {
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
}
function Existe($cmd) { return [bool](Get-Command $cmd -ErrorAction SilentlyContinue) }
function Intentar([string]$nombre, [scriptblock]$accion, [scriptblock]$verificar) {
    for ($i = 1; $i -le 3; $i++) {
        try { & $accion } catch { Write-Host "    intento $($i): $($_.Exception.Message)" -ForegroundColor DarkYellow }
        Refrescar-Path
        if (& $verificar) { Ok $nombre; return $true }
        Write-Host "    verificación fallida, corrigiendo (intento $i de 3)..." -ForegroundColor DarkYellow
        Start-Sleep -Seconds 3
    }
    Mal "$nombre no quedó listo"; return $false
}
function Vista-Previa {
    $py = Join-Path $Destino "herramientas\.venv\Scripts\python.exe"
    if (-not (Test-Path $py)) { $py = "py" }
    $puerto = 8765
    Start-Process -WindowStyle Minimized -FilePath $py -ArgumentList "-m", "http.server", "$puerto", "--directory", "`"$Destino`""
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:$puerto/index.html#nuevo"
    Write-Host "  Vista previa en http://localhost:$puerto  (cierra la ventana minimizada de Python para detenerla)"
}

if ($SoloVer) { Vista-Previa; Stop-Transcript | Out-Null; exit }

# -----------------------------------------------------------------------------
Paso "1. Diagnóstico del equipo"
$os = Get-CimInstance Win32_OperatingSystem
$cpu = Get-CimInstance Win32_Processor | Select-Object -First 1
$gpu = (Get-CimInstance Win32_VideoController | ForEach-Object { $_.Name }) -join ", "
$ram = [Math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
$disco = [Math]::Round((Get-PSDrive C).Free / 1GB, 1)
Write-Host "  Sistema   : $($os.Caption) ($($os.Version))"
Write-Host "  Procesador: $($cpu.Name) · $($cpu.NumberOfLogicalProcessors) hilos"
Write-Host "  Memoria   : $ram GB · Espacio libre en C: $disco GB"
Write-Host "  Gráficos  : $gpu"
if ($disco -lt 6) { Mal "Hay poco espacio libre (se recomiendan 6 GB)" }
foreach ($c in "winget", "git", "py", "ffmpeg") { Write-Host ("  {0,-8}: {1}" -f $c, $(if (Existe $c) { "presente" } else { "falta" })) }
if (-not (Test-Path $Paquete)) { Mal "No encuentro el paquete $Paquete. Descárgalo del chat y guárdalo en Descargas."; Stop-Transcript | Out-Null; exit 1 }
Ok "paquete encontrado ($([Math]::Round((Get-Item $Paquete).Length / 1MB, 1)) MB)"

# -----------------------------------------------------------------------------
Paso "2. Instalación de lo que falte"
if (-not (Existe "winget")) { Mal "winget no está disponible: instala 'App Installer' desde Microsoft Store y vuelve a ejecutar." }
else {
    if (-not (Existe "git")) { Intentar "Git" { winget install -e --id Git.Git --silent --accept-package-agreements --accept-source-agreements } { Existe "git" } | Out-Null } else { Ok "Git" }
    $py311 = $false; try { $v = & py -3.11 --version 2>$null; $py311 = $v -match "3\.11" } catch {}
    if (-not $py311) { Intentar "Python 3.11" { winget install -e --id Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements } { try { (& py -3.11 --version 2>$null) -match "3\.11" } catch { $false } } | Out-Null } else { Ok "Python 3.11" }
    if (-not (Existe "ffmpeg")) { Intentar "FFmpeg" { winget install -e --id Gyan.FFmpeg --silent --accept-package-agreements --accept-source-agreements } { Existe "ffmpeg" } | Out-Null } else { Ok "FFmpeg" }
}

# -----------------------------------------------------------------------------
Paso "3. Proyecto local en $Destino"
New-Item -ItemType Directory -Force -Path (Split-Path $Destino) | Out-Null
if (-not (Test-Path (Join-Path $Destino ".git"))) {
    if (Test-Path (Join-Path $Anterior ".git")) {
        robocopy $Anterior $Destino /E /NFL /NDL /NJH /NJS /NP | Out-Null
        Ok "proyecto copiado desde Descargas (con su historial de git)"
    } else {
        Intentar "clonar desde GitHub" { git clone https://github.com/migueltillero-ship-it/jorge-perez-alta-joyeria.git $Destino } { Test-Path (Join-Path $Destino ".git") } | Out-Null
    }
} else { Ok "el proyecto ya existe, se actualiza" }

# -----------------------------------------------------------------------------
Paso "4. Implementación de la nueva versión"
$tmp = Join-Path $env:TEMP "jp_v3"
Intentar "paquete descomprimido" {
    if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
    Expand-Archive -Path $Paquete -DestinationPath $tmp -Force
} { Test-Path (Join-Path $tmp "index.html") } | Out-Null
robocopy $tmp $Destino /E /NFL /NDL /NJH /NJS /NP | Out-Null
Ok "archivos copiados al proyecto"

# -----------------------------------------------------------------------------
Paso "5. Verificación del sitio"
$catalogo = Get-Content (Join-Path $Destino "js\catalog.js") -Raw -Encoding UTF8
$ids = [regex]::Matches($catalogo, 'id: "(\d\d)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
$rutas = @([regex]::Matches($catalogo, '"(assets/[^"]+)"') | ForEach-Object { $_.Groups[1].Value })
foreach ($i in $ids) { $rutas += "assets/3d/$i.glb", "assets/3d/$i.mp4", "assets/3d/$i.jpg" }
$rutas += "assets/vendor/model-viewer.min.js", "assets/vendor/draco/draco_decoder.wasm", "index.html", "js/app.js", "css/styles.css"
$faltan = @($rutas | Sort-Object -Unique | Where-Object { -not (Test-Path (Join-Path $Destino ($_ -replace "/", "\"))) })
if ($faltan.Count -eq 0) { Ok "$($ids.Count) obras y $(@($rutas | Sort-Object -Unique).Count) archivos verificados" }
else {
    Write-Host "    faltan $($faltan.Count) archivos, se vuelven a copiar del paquete..." -ForegroundColor DarkYellow
    robocopy $tmp $Destino /E /IS /NFL /NDL /NJH /NJS /NP | Out-Null
    $faltan = @($faltan | Where-Object { -not (Test-Path (Join-Path $Destino ($_ -replace "/", "\"))) })
    if ($faltan.Count -eq 0) { Ok "corregido: todos los archivos presentes" } else { $faltan | ForEach-Object { Mal "falta $_" } }
}

# -----------------------------------------------------------------------------
if (-not $SinHerramientas3D) {
    Paso "6. Herramientas 3D (Blender como módulo de Python, recorte y video)"
    $venv = Join-Path $Destino "herramientas\.venv"
    $py = Join-Path $venv "Scripts\python.exe"
    Intentar "entorno de Python" { if (-not (Test-Path $py)) { & py -3.11 -m venv $venv } } { Test-Path $py } | Out-Null
    Intentar "librerías (bpy, opencv, scikit-image, rembg)" {
        & $py -m pip install --upgrade pip --quiet
        & $py -m pip install -r (Join-Path $Destino "herramientas\requirements.txt") --quiet
    } { & $py -c "import bpy, cv2, skimage, scipy, rembg; print('ok')" 2>$null | Select-String "ok" } | Out-Null

    Paso "7. Prueba real de reconstrucción (obra X, una imagen fija)"
    $prueba = Join-Path $Destino "herramientas\trabajo\_prueba"
    $env:JP_SAMPLES = "6"; $env:JP_SAT = "0.17"
    & $py (Join-Path $Destino "herramientas\joya3d.py") -- (Join-Path $Destino "assets\piezas\probador\10.png") $prueba 42 still 2>&1 | Select-String "JOYA3D_OK" | Out-Null
    $inf = Join-Path $prueba "informe.json"
    if (Test-Path $inf) {
        $j = Get-Content $inf -Raw | ConvertFrom-Json
        if ($j.iou_contorno -ge 0.88) { Ok ("reconstrucción fiel: el contorno 3D coincide en {0:P1} con la foto" -f $j.iou_contorno) } else { Mal ("coincidencia baja en la prueba ({0:P1})" -f $j.iou_contorno) }
    } else { Mal "la prueba de reconstrucción no produjo resultado (revisa $Registro)" }
}

# -----------------------------------------------------------------------------
if ($Publicar) {
    Paso "8. Publicación en GitHub"
    Push-Location $Destino
    attrib -R ".git\*" /S /D 2>$null | Out-Null
    git config core.autocrlf false; git config gc.auto 0; git config maintenance.auto false
    git add -A
    git commit -m "Colección Vetas del Sur, presentaciones y modelos 3D" | Out-Null
    git push
    if ($LASTEXITCODE -eq 0) { Ok "publicado: https://migueltillero-ship-it.github.io/jorge-perez-alta-joyeria/" } else { Mal "git push falló (revisa tu sesión de GitHub)" }
    Pop-Location
}

# -----------------------------------------------------------------------------
Paso "Resumen"
if ($fallos.Count -eq 0) { Write-Host "  Todo quedó instalado y verificado." -ForegroundColor Green }
else { Write-Host "  Pendientes:" -ForegroundColor Yellow; $fallos | ForEach-Object { Write-Host "   · $_" -ForegroundColor Yellow } }
Write-Host "  Proyecto: $Destino"
Write-Host "  Registro: $Registro"
Vista-Previa
Stop-Transcript | Out-Null
