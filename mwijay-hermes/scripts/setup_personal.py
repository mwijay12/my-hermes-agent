#!/usr/bin/env python3
"""setup_personal.py — Geuza Hermes iwe "Mwijay AI" yako binafsi.

Inafanya nini (hatua kwa hatua, na inauliza kabla ya kubadilisha chochote):

  1. Inakili SKINS  -> <HERMES_HOME>/skins/mwijay.yaml (+ mwijay-mwanga.yaml)
  2. Inakili BUNDLE -> <HERMES_HOME>/skill-bundles/mwijay.yaml   (amri: /mwijay)
  3. Inakili PROFILE-> <HERMES_HOME>/SOUL.md, USER.md, MEMORY.md
  4. Inakili MISEMO -> <HERMES_HOME>/status_phrases/mwijay.yaml  (Telegram kwa Kiswahili)
  5. Inasanidi config.yaml (bila kufuta kilichopo):
       display.skin                = "mwijay"
       display.personality         = "mwijay"      (tu kama halikuwa limewekwa)
       display.status_phrases      = {path:..., mode: replace}  (tu kama halipo)
       skills.external_dirs        += <repo>/skills/mwijay-ai

Matumizi:
    python3 mwijay-hermes/scripts/setup_personal.py            # kausa kavu (onyesha tu)
    python3 mwijay-hermes/scripts/setup_personal.py --apply    # fanya mabadiliko
    python3 mwijay-hermes/scripts/setup_personal.py --skin mwijay-mwanga --apply
    python3 mwijay-hermes/scripts/setup_personal.py --profile mwijay --apply   # tengeneza pia profile

Baada ya hapo:
    hermes skin mwijay      # au anza upya hermes (config tayari inasomeka)
    hermes bundles list     # lazima uone /mwijay
    /mwijay                 # ndani ya chat

Ni salama: hailazimishi, inaweka nakala ya akiba (config.yaml.bak) kabla ya
kuandika config.yaml, na hailazimishwi kugusa .env wala API keys zako.
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
MWIJAY_DIR = REPO_ROOT / "mwijay-hermes"


def hermes_home() -> Path:
    env = os.environ.get("HERMES_HOME")
    if env:
        return Path(env).expanduser()
    if os.name == "nt":
        base = os.environ.get("LOCALAPPDATA") or (Path.home() / "AppData" / "Local")
        return Path(base) / "hermes"
    return Path.home() / ".hermes"


def _log(msg: str = "") -> None:
    print(msg)


def copy_into(src: Path, dst: Path, apply: bool) -> str:
    """Rudisha mstari wa hali (iliyokwishatekelezwa au iliyopangwa)."""
    if not src.exists():
        return f"  !  HAIPO: {src}"
    if dst.exists() and dst.read_bytes() == src.read_bytes():
        return f"  =  tayari: {dst}"
    verb = "nakili" if not apply else "IMENAKILIWA"
    if apply:
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
    return f"  {'+' if apply else '~'}  {verb}: {src.name} -> {dst}"


def merge_config(cfg_path: Path, skin: str, apply: bool) -> list[str]:
    """Ongeza display.skin + skills.external_dirs kwenye config.yaml."""
    lines: list[str] = []
    try:
        import yaml  # noqa: PLC0415
    except ImportError:
        lines.append("  !  pyyaml haipatikani — ruka kuhariri config.yaml.")
        lines.append("     Ongeza mwenyewe kwenye config.yaml:")
        lines.append(f"       display:")
        lines.append(f"         skin: {skin}")
        return lines

    cfg = {}
    if cfg_path.is_file():
        cfg = yaml.safe_load(cfg_path.read_text(encoding="utf-8")) or {}
    if not isinstance(cfg, dict):
        lines.append("  !  config.yaml si kamusi — ruka kuhariri.")
        return lines

    changed = False

    display = cfg.get("display")
    if not isinstance(display, dict):
        display = {}
    if display.get("skin") != skin:
        lines.append(f"  {'+' if apply else '~'}  display.skin: {display.get('skin', '(hamna)')} -> {skin}")
        display["skin"] = skin
        cfg["display"] = display
        changed = True
    else:
        lines.append(f"  =  display.skin tayari ni {skin}")

    # Skills za Mwijay ziko kwenye repo: <repo>/skills/mwijay-ai/<skill>/SKILL.md
    ext_dir = str(REPO_ROOT / "skills" / "mwijay-ai").replace("\\", "/")
    skills = cfg.get("skills")
    if not isinstance(skills, dict):
        skills = {}
    dirs = [str(d) for d in (skills.get("external_dirs") or [])]
    if not any(str(d).replace("\\", "/").rstrip("/") == ext_dir for d in dirs):
        dirs.append(ext_dir)
        skills["external_dirs"] = dirs
        cfg["skills"] = skills
        changed = True
        lines.append(f"  {'+' if apply else '~'}  skills.external_dirs += {ext_dir}")
    else:
        lines.append("  =  skills.external_dirs tayari ina njia ya skills za Mwijay")

    # Misemo ya Kiswahili kwa Telegram/gateway (tu kama hakuna iliyowekwa)
    sp = display.get("status_phrases")
    if not isinstance(sp, dict) or not sp.get("path"):
        display["status_phrases"] = {
            "path": "status_phrases/mwijay.yaml",
            "mode": "replace",
        }
        cfg["display"] = display
        changed = True
        lines.append("  +  display.status_phrases -> status_phrases/mwijay.yaml (mode: replace)")
    else:
        lines.append("  =  display.status_phrases tayari imewekwa")

    # Sauti ya Mwijay kama hakuna personality iliyochaguliwa
    if not str(display.get("personality") or "").strip():
        display["personality"] = "mwijay"
        cfg["display"] = display
        changed = True
        lines.append("  +  display.personality -> mwijay")
    else:
        lines.append(f"  =  display.personality tayari ni {display.get('personality')}")

    if changed and apply:
        if cfg_path.is_file():
            shutil.copy2(cfg_path, cfg_path.with_suffix(cfg_path.suffix + ".bak"))
            lines.append(f"  +  akiba: {cfg_path.name}.bak")
        cfg_path.parent.mkdir(parents=True, exist_ok=True)
        cfg_path.write_text(
            yaml.safe_dump(cfg, sort_keys=False, allow_unicode=True, default_flow_style=False),
            encoding="utf-8",
        )
        lines.append(f"  +  imeandikwa: {cfg_path}")
    elif changed:
        lines.append(f"  ~  ingeandikwa: {cfg_path}")

    return lines


def main() -> int:
    ap = argparse.ArgumentParser(description="Sanidi Hermes iwe Mwijay AI yako binafsi.")
    ap.add_argument("--apply", action="store_true", help="fanya mabadiliko (default: onyesha tu)")
    ap.add_argument("--skin", default="mwijay", help="skin ya kutumia (default: mwijay)")
    ap.add_argument("--profile", default=None, help="tengeneza pia profile yenye jina hili")
    args = ap.parse_args()

    home = hermes_home()
    mode = "KUHARIRI" if args.apply else "KAUSA KAVU (onyesha tu — ongeza --apply kutekeleza)"
    _log()
    _log(f"=== Mwijay AI — usanidi wa Hermes ({mode}) ===")
    _log(f"    HERMES_HOME : {home}")
    _log(f"    Repo        : {REPO_ROOT}")
    _log(f"    Skin        : {args.skin}")
    _log()

    _log("1) SKINS")
    for name in ("mwijay.yaml", "mwijay-mwanga.yaml"):
        src = MWIJAY_DIR / "skins" / name
        _log(copy_into(src, home / "skins" / name, args.apply))
    _log()

    _log("2) SKILL BUNDLE  (/mwijay)")
    _log(copy_into(MWIJAY_DIR / "skill-bundles" / "mwijay.yaml",
                   home / "skill-bundles" / "mwijay.yaml", args.apply))
    _log()

    _log("3) PROFILE (SOUL / USER / MEMORY)")
    for name in ("SOUL.md", "USER.md", "MEMORY.md"):
        src = MWIJAY_DIR / "profile" / name
        dst = home / name
        if dst.exists():
            _log(f"  =  ipo tayari (sijaguswa): {dst}")
        else:
            _log(copy_into(src, dst, args.apply))
    _log()

    _log("4) MISEMO YA KISWAHILI (Telegram / gateway)")
    _log(copy_into(MWIJAY_DIR / "status_phrases.yaml",
                   home / "status_phrases" / "mwijay.yaml", args.apply))
    _log()

    _log("5) CONFIG")
    for line in merge_config(home / "config.yaml", args.skin, args.apply):
        _log(line)
    _log()

    if args.profile:
        _log(f"6) PROFILE MPYA: {args.profile}")
        cmd = f"hermes profile create {args.profile}"
        if args.apply:
            _log(f"  ~  endesha mwenyewe:  {cmd}")
        else:
            _log(f"  ~  ingeendeshwa:      {cmd}")
        _log("     Kisha:  "
             f"{args.profile} setup   &&   {args.profile} chat")
        _log()

    if not args.apply:
        _log("Hakuna kilichobadilishwa. Endesha tena na --apply ili kutekeleza.")
    else:
        _log("Imekamilika. Hatua zinazofuata:")
        _log("    hermes bundles list      # thibitisha /mwijay upo")
        _log("    hermes skin              # thibitisha skin ya mwijay inaonekana")
        _log("    hermes chat              # kisha andika: /mwijay")
        _log()
        _log("Kumbuka: kama hermes inatumia venv yake, endesha script hii kwa python")
        _log("ileile inayoendesha hermes (sharti pyyaml ipatikane).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
