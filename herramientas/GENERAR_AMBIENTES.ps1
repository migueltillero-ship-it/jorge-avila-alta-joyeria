# Genera la imagen de campana (terciopelo azul, fotografica) de las piezas nuevas con Gemini,
# usando la foto real de cada pieza como referencia. Misma estetica que las 9 primeras.
# Uso (desde la carpeta del proyecto):  .\herramientas\GENERAR_AMBIENTES.ps1            (piezas 10 a 22)
#                                       .\herramientas\GENERAR_AMBIENTES.ps1 -Ids 12,15  (solo esas)
param([int[]]$Ids = (10..22), [switch]$Forzar)
$ErrorActionPreference = "Continue"
$P = Split-Path -Parent $PSScriptRoot
$dir = Join-Path $P "assets\piezas"
$resp = Join-Path $P "herramientas\trabajo\ambientes_cg"
New-Item -ItemType Directory -Force $resp | Out-Null

if (-not $env:GEMINI_API_KEY) {
    $s = Read-Host "Pega tu clave de Gemini (no se muestra ni se guarda)" -AsSecureString
    $env:GEMINI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
}
$modelos = @("gemini-nano-banana-2.1", "gemini-3.1-flash-image", "gemini-3-pro-image")

$prompt = @"
Edit this reference photo of a real handmade silver jewelry piece (sterling silver with natural rhodochrosite stone) into a high-jewelry campaign photograph.
ABSOLUTE RULE: the piece must stay exactly faithful to the reference: same shape, same proportions, same stones with their exact banding, color and vein pattern, same silver settings, bail and wire. Do not add, remove, redesign or embellish anything. The metal is silver, never gold.
Style: macro product photograph shot on a full-frame camera with a 100mm macro lens, piece lying on deep midnight-blue velvet, soft diagonal studio light with gentle specular highlights on the silver and a natural glow in the stone, shallow depth of field, fine velvet fibers visible, realistic reflections and subtle shadow contact with the fabric, slightly tilted 3/4 top view, vertical 4:5 composition, piece large in frame, no text, no watermark, no hands, no other objects.
"@

foreach ($id in $Ids) {
    $n = "{0:D2}" -f $id
    $src = Join-Path $dir "${n}_real.jpg"
    $dst = Join-Path $dir "${n}_ambiente.jpg"
    if (-not (Test-Path $src)) { Write-Host "  [!!] $n sin foto real" -ForegroundColor Yellow; continue }
    if ((Test-Path (Join-Path $resp "${n}_ambiente_cg.jpg")) -and -not $Forzar) { Write-Host "  [OK] $n ya generada (usa -Forzar para repetir)"; continue }
    $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($src))
    $ok = $false
    foreach ($m in $modelos) {
        if ($ok) { break }
        for ($i = 1; $i -le 2 -and -not $ok; $i++) {
            try {
                $body = @{ model = $m; input = @(@{ type = "text"; text = $prompt }, @{ type = "image"; mime_type = "image/jpeg"; data = $b64 }); response_format = @{ type = "image"; mime_type = "image/jpeg"; aspect_ratio = "4:5"; image_size = "2K" } } | ConvertTo-Json -Depth 8 -Compress
                $r = Invoke-RestMethod -Method Post -Uri "https://generativelanguage.googleapis.com/v1beta/interactions" -Headers @{ "x-goog-api-key" = $env:GEMINI_API_KEY } -ContentType "application/json" -Body $body -TimeoutSec 240
                $img = $null
                foreach ($st in $r.steps) { if ($st.type -eq "model_output") { foreach ($c in $st.content) { if ($c.type -eq "image" -and $c.data) { $img = $c.data } } } }
                if ($img) {
                    $bytes = [Convert]::FromBase64String($img)
                    if ($bytes.Length -gt 60KB) {
                        if (Test-Path $dst) { Copy-Item $dst (Join-Path $resp "${n}_ambiente_cg.jpg") -Force }
                        [IO.File]::WriteAllBytes($dst, $bytes)
                        Write-Host ("  [OK] {0} generada con {1} ({2:N0} KB)" -f $n, $m, ($bytes.Length / 1KB)) -ForegroundColor Green
                        $ok = $true
                    }
                }
            } catch { Write-Host "    $n $m intento ${i}: $($_.Exception.Message.Substring(0, [Math]::Min(90, $_.Exception.Message.Length)))" }
            if (-not $ok) { Start-Sleep 4 }
        }
    }
    if (-not $ok) { Write-Host "  [!!] $n no se pudo generar" -ForegroundColor Yellow }
}
Write-Host "Revisa las imagenes en assets\piezas y compara con 01_ambiente.jpg antes de publicar." -ForegroundColor Cyan
