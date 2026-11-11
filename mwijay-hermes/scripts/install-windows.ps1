# Mwijay AI — Install Hermes kwenye Windows (PowerShell)
# Endesha: powershell -ExecutionPolicy Bypass -File .\mwijay-hermes\scripts\install-windows.ps1
# Hii inaitisha installer rasmi ya Hermes, kisha inakumbusha hatua zinazofuata.

Write-Host "=== Mwijay AI — Hermes Installer (Windows) ===" -ForegroundColor Cyan
Write-Host "Hatua 1: Inaendesha installer rasmi ya Hermes..." -ForegroundColor Green

iex (irm https://hermes-agent.nousresearch.com/install.ps1)

Write-Host ""
Write-Host "=== Hatua zinazofuata (fanya mwenyewe) ===" -ForegroundColor Yellow
Write-Host "1. Weka API keys kwenye .env ya Hermes:"
Write-Host "   Notepad `$env:LOCALAPPDATA\hermes\.env"
Write-Host "   GEMINI_API_KEY=...  (https://aistudio.google.com/apikey)"
Write-Host "   GROQ_API_KEY=...    (https://console.groq.com/keys)"
Write-Host "   OPENROUTER_API_KEY=...(https://openrouter.ai/keys)"
Write-Host ""
Write-Host "2. Nakili profile na config ya Mwijay:"
Write-Host "   Copy-Item .\mwijay-hermes\profile\SOUL.md   `$env:LOCALAPPDATA\hermes\SOUL.md -Force"
Write-Host "   Copy-Item .\mwijay-hermes\profile\USER.md   `$env:LOCALAPPDATA\hermes\USER.md -Force"
Write-Host "   Copy-Item .\mwijay-hermes\profile\MEMORY.md `$env:LOCALAPPDATA\hermes\MEMORY.md -Force"
Write-Host "   Copy-Item .\mwijay-hermes\config\config.yaml `$env:LOCALAPPDATA\hermes\config.yaml -Force"
Write-Host "   Copy-Item .\mwijay-hermes\skills\* `$env:LOCALAPPDATA\hermes\skills\ -Recurse -Force"
Write-Host ""
Write-Host "3. Anza:  hermes   kisha  /personality mwijay" -ForegroundColor Green
Write-Host "Sawa Mwijay! Karibu Mwijay AI! 🚀" -ForegroundColor Cyan
