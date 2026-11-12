#Requires -Version 5.1
<#
.SYNOPSIS
    Sakinisha Mwijay AI (Hermes Agent) kwenye PC ya chuo - bila haja ya admin.

.DESCRIPTION
    Script hii imeandaliwa kwa PC za shule/chuo: haigusi chochote nje ya folda
    yako ya mtumiaji, haihitaji ruhusa za msimamizi (admin), na inafanya kazi
    hata kama Git haipo (inapakua ZIP).

    Inafanya:
      1. Kagua: toleo la Python (3.11-3.13), mtandao (GitHub/PyPI), Git
      2. Pata repo (clone kama Git ipo, vinginevyo pakua ZIP)
      3. Tengeneza mazingira ya Python (venv) ndani ya folda yako
      4. Sakinisha Hermes + vifurushi vyake
      5. Endesha setup_personal.py: skins, /mwijay, misemo za Kiswahili
      6. Onyesha hatua zinazofuata

.PARAMETER Method
    auto (default) | official | source
      official = tumia installer rasmi wa Hermes (inajileta Python yenyewe)
      source   = sakinisha moja kwa moja kutoka repo yako (inahitaji Python 3.11+)
      auto     = chagua source kama Python ni sahihi, vinginevyo official

.PARAMETER RepoDir
    Folda ya kupakia repo. Default: $HOME\my-hermes-agent

.PARAMETER Extras
    Vifurushi vya ziada vya kusakinisha (njia ya source).
    Default: cli,cron,mcp,pty,web

.PARAMETER Wipe
    Futa funguo zako (.env) kabla hujaondoka kwenye PC ya chuo.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\install-chuo.ps1
    powershell -ExecutionPolicy Bypass -File .\install-chuo.ps1 -Method official
    powershell -ExecutionPolicy Bypass -File .\install-chuo.ps1 -Wipe
#>

[CmdletBinding()]
param(
    [ValidateSet('auto', 'official', 'source')]
    [string]$Method = 'auto',
    [string]$RepoDir = (Join-Path $HOME 'my-hermes-agent'),
    [string]$Extras = 'cli,cron,mcp,pty,web',
    [switch]$Wipe
)

$ErrorActionPreference = 'Stop'
$RepoUrl   = 'https://github.com/mwijay12/my-hermes-agent'
$ZipUrl    = 'https://github.com/mwijay12/my-hermes-agent/archive/refs/heads/main.zip'
$OfficialInstaller = 'https://hermes-agent.nousresearch.com/install.ps1'

function Say($msg)  { Write-Host $msg -ForegroundColor Cyan }
function Good($msg) { Write-Host "  [OK]   $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "  [!!]   $msg" -ForegroundColor Yellow }
function Bad($msg)  { Write-Host "  [XX]   $msg" -ForegroundColor Red }
function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }

# ---------------------------------------------------------------- WIPE MODE
if ($Wipe) {
    Step 'Kufuta funguo (wipe)'
    $envFile = Join-Path $HOME '.hermes\.env'
    if (Test-Path $envFile) {
        Remove-Item $envFile -Force
        Good ".env imefutwa: $envFile"
    } else {
        Warn "Hakuna .env: $envFile"
    }
    $envExample = Join-Path $HOME '.hermes\.env.free.example'
    if (Test-Path $envExample) {
        Remove-Item $envExample -Force
        Good ".env.free.example imefutwa"
    }
    Write-Host ''
    Say 'Kumbuka: funguo bado zipo kwenye akaunti zako za providers - zinafanya'
    Say 'kazi popote. Ukimaliza, zifute pia kwenye tovuti za providers kama hutaki'
    Say 'zitumike tena. Tazama: mwijay-hermes/free-providers.html'
    exit 0
}

Step 'Mwijay AI - usakinishaji kwenye PC ya chuo'
Write-Host "  Folda      : $RepoDir"
Write-Host "  Njia       : $Method"
Write-Host "  Mtumiaji   : $env:USERNAME"
Write-Host "  Windows    : $([System.Environment]::OSVersion.VersionString)"

# ------------------------------------------------------------- 1. MTANDAOO
Step '1) Kukagua mtandao'
$netOk = $true
foreach ($url in @('https://github.com', 'https://pypi.org')) {
    try {
        $r = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 15 -UseBasicParsing
        Good "$url (hali: $($r.StatusCode))"
    } catch {
        Bad "$url - HAUFIKIKI"
        $netOk = $false
    }
}
if (-not $netOk) {
    Warn 'Baadhi ya tovuti hazifiki. Shule nyingi huzuia baadhi ya tovuti.'
    Warn 'Jaribu: muulize msimamizi wa mtandao, au tumia mtandao wa simu (hotspot).'
    Warn 'Bila mtandao, usakinishaji hauwezi kuendelea.'
}

# -------------------------------------------------------------- 2. PYTHON
Step '2) Kukagua Python'
$py = $null
foreach ($cmd in @('py -3', 'python', 'python3')) {
    try {
        $out = Invoke-Expression "$cmd --version" 2>$null
        if ($out -match 'Python (\d+)\.(\d+)\.(\d+)') {
            $major = [int]$Matches[1]; $minor = [int]$Matches[2]
            if ($major -eq 3 -and $minor -ge 11 -and $minor -le 13) {
                $py = $cmd
                Good "$cmd -> $out (sawa: inahitajika 3.11 - 3.13)"
                break
            } else {
                Warn "$cmd -> $out (si sahihi: Hermes inahitaji 3.11 - 3.13)"
            }
        }
    } catch { }
}
if (-not $py) { Warn 'Python 3.11-3.13 haipatikani kwenye PATH' }

# ------------------------------------------------------------------ 3. GIT
Step '3) Kukagua Git'
$hasGit = $false
try {
    $gv = (git --version 2>$null)
    if ($gv) { Good $gv; $hasGit = $true } else { Warn 'Git haipo' }
} catch { Warn 'Git haipo' }

# --------------------------------------------------------- 4. CHAGUA NJIA
if ($Method -eq 'auto') {
    if ($py) { $Method = 'source'; Say "Njia: SOURCE (Python ipo)" }
    else     { $Method = 'official'; Say "Njia: OFFICIAL (Python haipo - installer italeta)" }
}

# ------------------------------------------------------------- 5. PATA REPO
Step '4) Kupata repo ya Mwijay AI'
if (Test-Path (Join-Path $RepoDir 'mwijay-hermes')) {
    Good "Repo ipo tayari: $RepoDir"
} elseif ($hasGit) {
    Say "Inakili (clone) kwenda $RepoDir ..."
    git clone $RepoUrl $RepoDir
    Good 'Imekamilika'
} else {
    Say "Git haipo - inapakua ZIP kwenda $RepoDir ..."
    $tmpZip = Join-Path $env:TEMP "mwijay-hermes-$([guid]::NewGuid().ToString('N').Substring(0,8)).zip"
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $ZipUrl -OutFile $tmpZip -UseBasicParsing
    Expand-Archive -Path $tmpZip -DestinationPath $env:TEMP -Force
    $extracted = Join-Path $env:TEMP 'my-hermes-agent-main'
    if (Test-Path $RepoDir) { Remove-Item $RepoDir -Recurse -Force }
    Move-Item $extracted $RepoDir
    Remove-Item $tmpZip -Force
    Good "Imekamilika: $RepoDir"
}

$mwijayDir = Join-Path $RepoDir 'mwijay-hermes'
if (-not (Test-Path $mwijayDir)) { Bad "Folda ya mwijay-hermes haipo: $mwijayDir"; exit 1 }

# ----------------------------------------------------------- 6. SAKINISHA
if ($Method -eq 'official') {
    Step '5) Kusakinisha Hermes (installer rasmi)'
    Say 'Inapakua na kuendesha installer rasmi...'
    Say '  (inajileta Python 3.11, uv na ripgrep - haihitaji admin)'
    try {
        Invoke-Expression (Invoke-WebRequest -Uri $OfficialInstaller -UseBasicParsing).Content
        Good 'Installer imemaliza'
    } catch {
        Bad "Installer imeshindwa: $($_.Exception.Message)"
        Warn 'Endesha mwenyewe kwenye PowerShell:'
        Warn '  iex (irm https://hermes-agent.nousresearch.com/install.ps1)'
    }
} else {
    Step '5) Kusakinisha Hermes kutoka repo (source)'
    $venv = Join-Path $RepoDir '.venv'
    if (-not (Test-Path $venv)) {
        Say "Inatengeneza mazingira ya Python: $venv"
        Invoke-Expression "$py -m venv `"$venv`""
        Good 'Imekamilika'
    } else { Good "Mazingira yapo tayari: $venv" }

    $vpy = Join-Path $venv 'Scripts\python.exe'
    if (-not (Test-Path $vpy)) { Bad "Python ya venv haipo: $vpy"; exit 1 }

    Say 'Inasasisha pip...'
    & $vpy -m pip install --upgrade pip --quiet
    Good 'pip iko sawa'

    $extraArgs = @()
    foreach ($e in ($Extras -split ',')) { if ($e.Trim()) { $extraArgs += $e.Trim() } }
    $pkg = '.'
    if ($extraArgs.Count -gt 0) { $pkg = ".[$($extraArgs -join ',')]" }

    Say "Inasakinisha Hermes ($pkg) - inaweza kuchukua dakika kadhaa..."
    & $vpy -m pip install -e $pkg
    if ($LASTEXITCODE -eq 0) { Good 'Hermes imesakinishwa' } else { Bad 'Usakinishaji umeshindwa'; exit 1 }

    $hermes = Join-Path $venv 'Scripts\hermes.exe'
    if (Test-Path $hermes) {
        Say 'Toleo:'
        & $hermes --version
    }
}

# ------------------------------------------------------ 7. BINAFISISHA
Step '6) Kuweka utambulisho wa Mwijay AI'
$hermesHome = Join-Path $HOME '.hermes'
if (-not (Test-Path $hermesHome)) { New-Item -ItemType Directory -Path $hermesHome -Force | Out-Null }

$setup = Join-Path $mwijayDir 'scripts\setup_personal.py'
if ($Method -eq 'source') { $runPy = Join-Path $RepoDir '.venv\Scripts\python.exe' } else { $runPy = 'python' }

if (Test-Path $setup) {
    Say 'Kwanza kausa kavu (hakibadilishi chochote):'
    & $runPy $setup
    Write-Host ''
    $ans = Read-Host 'Endelea na --apply? (Y/N)'
    if ($ans -match '^[Yy]') {
        & $runPy $setup --apply
        Good 'Ubinafsishaji umekamilika'
    } else {
        Warn 'Umeahirisha. Endesha baadaye:'
        Warn "  $runPy $setup --apply"
    }
} else { Bad "Hamna setup_personal.py: $setup" }

# --------------------------------------------------------- 8. HATUA ZAIDI
Step 'IMEMALIZIKA'
Write-Host @"

Hatua zinazofuata:

  1. Weka funguo zako (API keys) kwenye:  $hermesHome\.env
     Mfano uko kwenye repo:  mwijay-hermes\config\.env.free.example
     Usiweke funguo kwenye Git. Kamwe.

  2. Pima funguo:
     $runPy $(Join-Path $mwijayDir 'scripts\check_free_keys.py')

  3. Ona mwonekano wa terminal:
     $runPy $(Join-Path $mwijayDir 'scripts\preview_skin.py') mwijay

  4. Anza:
     hermes chat        (au: hermes --tui  kwa paneli la kisasa)
     hermes doctor      (kama kitu hakifanyi kazi)

KUMBUKA KWA PC YA CHUO:
  - Hii PC inaweza kuwa ya watu wengi. Kabla hujaondoka:
      powershell -ExecutionPolicy Bypass -File <hapa>\install-chuo.ps1 -Wipe
    (au futa $hermesHome\.env mwenyewe)
  - Mwongozo kamili: mwijay-hermes\install-chuo.html
"@ -ForegroundColor Cyan
