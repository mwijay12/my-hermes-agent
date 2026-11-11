#!/usr/bin/env bash
# Mwijay AI — Install Hermes kwenye Linux / WSL2
# Endesha: bash mwijay-hermes/scripts/install-linux.sh
set -e

echo "=== Mwijay AI — Hermes Installer (Linux/WSL2) ==="
echo "Hatua 1: Inaendesha installer rasmi ya Hermes..."
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

echo ""
echo "=== Hatua zinazofuata (fanya mwenyewe) ==="
echo "1. Weka API keys kwenye ~/.hermes/.env:"
echo "   GEMINI_API_KEY=...  (https://aistudio.google.com/apikey)"
echo "   GROQ_API_KEY=...    (https://console.groq.com/keys)"
echo "   OPENROUTER_API_KEY=...(https://openrouter.ai/keys)"
echo ""
echo "2. Nakili profile na config ya Mwijay:"
echo "   cp mwijay-hermes/profile/SOUL.md mwijay-hermes/profile/USER.md mwijay-hermes/profile/MEMORY.md ~/.hermes/"
echo "   cp mwijay-hermes/config/config.yaml ~/.hermes/config.yaml"
echo "   mkdir -p ~/.hermes/skills && cp -r mwijay-hermes/skills/* ~/.hermes/skills/"
echo ""
echo "3. Anza:  hermes   kisha  /personality mwijay"
echo "Sawa Mwijay! Karibu Mwijay AI! 🚀"
