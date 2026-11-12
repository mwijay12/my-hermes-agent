#!/usr/bin/env bash
# ============================================================================
# install-chuo.sh — Sakinisha Mwijay AI kwenye PC ya maabara/chuo (Linux/macOS/WSL)
#
# Toleo hili ni la mashine za shule zinazotumia Linux (au WSL2 kwenye Windows).
# Kwa Windows halisi tumia: install-chuo.ps1
#
# Matumizi:
#   bash install-chuo.sh                 # sakinisha (source, na venv)
#   bash install-chuo.sh --official      # tumia installer rasmi wa Hermes
#   bash install-chuo.sh --wipe          # futa funguo kabla ya kuondoka
#
# Haihitaji sudo. Inaweka kila kitu chini ya $HOME.
# ============================================================================

set -euo pipefail

REPO_URL="https://github.com/mwijay12/my-hermes-agent"
ZIP_URL="https://github.com/mwijay12/my-hermes-agent/archive/refs/heads/main.zip"
OFFICIAL="https://hermes-agent.nousresearch.com/install.sh"

REPO_DIR="${REPO_DIR:-$HOME/my-hermes-agent}"
EXTRAS="${EXTRAS:-cli,cron,mcp,pty,web}"
METHOD="source"

G='\033[0;32m'; Y='\033[0;33m'; C='\033[0;36m'; R='\033[0;31m'; N='\033[0m'
say()  { printf "${C}%s${N}\n" "$*"; }
good() { printf "  ${G}[OK]${N}   %s\n" "$*"; }
warn() { printf "  ${Y}[!!]${N}   %s\n" "$*"; }
bad()  { printf "  ${R}[XX]${N}   %s\n" "$*"; }
step() { printf "\n${C}=== %s ===${N}\n" "$*"; }

# ---------------------------------------------------------------- WIPE MODE
if [[ "${1:-}" == "--wipe" ]]; then
    step "Kufuta funguo (wipe)"
    for f in "$HOME/.hermes/.env" "$HOME/.hermes/.env.free.example"; do
        if [[ -f "$f" ]]; then rm -f "$f"; good "Imefutwa: $f"; else warn "Haipo: $f"; fi
    done
    say ""
    say "Kumbuka: funguo bado zipo kwenye akaunti zako za providers — zinafanya kazi"
    say "popote. Zifute pia kwenye tovuti za providers kama hutaki zitumike tena."
    exit 0
fi

[[ "${1:-}" == "--official" ]] && METHOD="official"

step "Mwijay AI — usakinishaji (Linux/macOS/WSL)"
echo "  Folda    : $REPO_DIR"
echo "  Njia     : $METHOD"
echo "  Mtumiaji : $(whoami)"

# --------------------------------------------------------------- 1. MTANDAO
step "1) Kukagua mtandao"
for url in https://github.com https://pypi.org; do
    if curl -fsS -o /dev/null --max-time 12 "$url" 2>/dev/null; then
        good "$url inafikika"
    else
        bad "$url HAIFIKIKI"
        warn "Baadhi ya mitandao ya shule huzuia tovuti. Jaribu hotspot ya simu."
    fi
done

# ---------------------------------------------------------------- 2. PYTHON
step "2) Kukagua Python"
PY=""
for cand in python3.13 python3.12 python3.11 python3 python; do
    if command -v "$cand" >/dev/null 2>&1; then
        ver="$("$cand" --version 2>&1 || true)"
        if [[ "$ver" =~ Python\ 3\.([0-9]+)\. ]]; then
            minor="${BASH_REMATCH[1]}"
            if (( minor >= 11 && minor <= 13 )); then
                PY="$cand"; good "$cand -> $ver (sawa: 3.11 - 3.13)"; break
            else
                warn "$cand -> $ver (si sahihi: inahitajika 3.11 - 3.13)"
            fi
        fi
    fi
done
[[ -z "$PY" ]] && warn "Python 3.11-3.13 haipatikani kwenye PATH"

# ------------------------------------------------------------------- 3. GIT
step "3) Kukagua Git"
if command -v git >/dev/null 2>&1; then good "$(git --version)"; HAS_GIT=1; else warn "Git haipo"; HAS_GIT=0; fi

if [[ "$METHOD" == "source" && -z "$PY" ]]; then
    warn "Python sahihi haipo — kubadili njia kuwa 'official' (installer italeta Python)."
    METHOD="official"
fi

# ---------------------------------------------------------------- 4. REPO
step "4) Kupata repo ya Mwijay AI"
if [[ -d "$REPO_DIR/mwijay-hermes" ]]; then
    good "Repo ipo tayari: $REPO_DIR"
elif (( HAS_GIT )); then
    say "Inakili (clone) kwenda $REPO_DIR ..."
    git clone "$REPO_URL" "$REPO_DIR"
    good "Imekamilika"
else
    say "Git haipo — inapakua ZIP kwenda $REPO_DIR ..."
    tmp="$(mktemp -d)"
    curl -fsSL "$ZIP_URL" -o "$tmp/repo.zip"
    command -v unzip >/dev/null 2>&1 || { bad "'unzip' haipo. Sakinisha Git au unzip kwanza."; exit 1; }
    unzip -q "$tmp/repo.zip" -d "$tmp"
    [[ -d "$REPO_DIR" ]] && rm -rf "$REPO_DIR"
    mv "$tmp/my-hermes-agent-main" "$REPO_DIR"
    rm -rf "$tmp"
    good "Imekamilika: $REPO_DIR"
fi

MWIJAY_DIR="$REPO_DIR/mwijay-hermes"
[[ -d "$MWIJAY_DIR" ]] || { bad "Folda ya mwijay-hermes haipo: $MWIJAY_DIR"; exit 1; }

# -------------------------------------------------------------- 5. SAKINISHA
if [[ "$METHOD" == "official" ]]; then
    step "5) Kusakinisha Hermes (installer rasmi)"
    say "Inapakua na kuendesha installer rasmi (haihitaji sudo)..."
    curl -fsSL "$OFFICIAL" | bash
    good "Installer imemaliza"
    RUN_PY="python3"
else
    step "5) Kusakinisha Hermes kutoka repo (source)"
    VENV="$REPO_DIR/.venv"
    if [[ ! -d "$VENV" ]]; then
        say "Inatengeneza mazingira ya Python: $VENV"
        "$PY" -m venv "$VENV"
        good "Imekamilika"
    else
        good "Mazingira yapo tayari: $VENV"
    fi
    RUN_PY="$VENV/bin/python"
    say "Inasasisha pip..."
    "$RUN_PY" -m pip install --upgrade pip --quiet
    good "pip iko sawa"
    say "Inasakinisha Hermes [.$EXTRAS] — inaweza kuchukua dakika kadhaa..."
    "$RUN_PY" -m pip install -e ".[$EXTRAS]"
    good "Hermes imesakinishwa"
    if [[ -x "$VENV/bin/hermes" ]]; then
        say "Toleo:"; "$VENV/bin/hermes" --version || true
    fi
fi

# ----------------------------------------------------------- 6. BINAFISISHA
step "6) Kuweka utambulisho wa Mwijay AI"
mkdir -p "$HOME/.hermes"
SETUP="$MWIJAY_DIR/scripts/setup_personal.py"
if [[ -f "$SETUP" ]]; then
    say "Kwanza kausa kavu (hakibadilishi chochote):"
    "$RUN_PY" "$SETUP" || true
    echo ""
    read -r -p "Endelea na --apply? (y/N) " ans
    if [[ "$ans" =~ ^[Yy]$ ]]; then
        "$RUN_PY" "$SETUP" --apply
        good "Ubinafsishaji umekamilika"
    else
        warn "Umeahirisha. Endesha baadaye:"
        warn "  $RUN_PY $SETUP --apply"
    fi
else
    bad "Hamna setup_personal.py: $SETUP"
fi

# ------------------------------------------------------------- 7. HATUA ZAIDI
step "IMEMALIZIKA"
cat <<EOF

Hatua zinazofuata:

  1. Weka funguo zako (API keys):  \$HOME/.hermes/.env
     Mfano:  $MWIJAY_DIR/config/.env.free.example
     Usiweke funguo kwenye Git. Kamwe.

  2. Pima funguo:      $RUN_PY $MWIJAY_DIR/scripts/check_free_keys.py
  3. Ona mwonekano:    $RUN_PY $MWIJAY_DIR/scripts/preview_skin.py mwijay
  4. Anza:             hermes chat   (au: hermes --tui)
     Tatizo?:          hermes doctor

KUMBUKA KWA PC YA CHUO:
  - Kabla hujaondoka:   bash $MWIJAY_DIR/scripts/install-chuo.sh --wipe
  - Mwongozo kamili:    $MWIJAY_DIR/install-chuo.html
EOF
