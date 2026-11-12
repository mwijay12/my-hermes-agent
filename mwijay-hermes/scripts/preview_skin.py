#!/usr/bin/env python3
"""preview_skin.py — Ona skin yako kwenye terminal KABLA ya kuitumia.

Hiki ndicho chombo cha "kuipendezesha": unaona nembo, paneli ya majibu,
spinner, mistari ya tools na rangi zote — halafu ukibadilisha rangi kwenye
faili la skin, endesha tena na uone tofauti mara moja.

Matumizi:
    python3 mwijay-hermes/scripts/preview_skin.py mwijay
    python3 mwijay-hermes/scripts/preview_skin.py mwijay-mwanga
    python3 mwijay-hermes/scripts/preview_skin.py --list
    python3 mwijay-hermes/scripts/preview_skin.py mwijay --no-logo   # acha nembo kubwa
    python3 mwijay-hermes/scripts/preview_skin.py mwijay --width 100 # jaribu upana mwingine

Haigusi config.yaml wala ~/.hermes — inasoma skins moja kwa moja kutoka
folda ya repo hii (au kutoka HERMES_HOME ukitumia --installed).

Inahitaji: pyyaml na rich (Hermes tayari inazo zote mbili).
"""

from __future__ import annotations

import argparse
import os
import shutil
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SKINS_DIR = REPO_ROOT / "mwijay-hermes" / "skins"

SAMPLE_REPLY = (
    "Sawa Mwijay! Nimekuwekea mambo matatu:\n"
    "  1. Skin ya rangi za bendera yako\n"
    "  2. Amri [bold]/mwijay[/bold] inayopakia skills zote\n"
    "  3. Mnyororo wa providers wa bure\n"
    "Endesha [bold]hermes chat[/] kuanza."
)


def _die(msg: str) -> int:
    print(f"[!] {msg}", file=sys.stderr)
    return 1


def load_skin_from_dir(skins_dir: Path, name: str):
    """Pakia skin kwa kulaghai HERMES_HOME (hakuna kinachoandikwa popote)."""
    tmp = Path(tempfile.mkdtemp(prefix="mwijay-skin-"))
    (tmp / "skins").mkdir(parents=True, exist_ok=True)
    found = False
    for f in sorted(skins_dir.glob("*.yaml")):
        shutil.copy2(f, tmp / "skins" / f.name)
        found = True
    if not found:
        return None, f"Hamna faili za skin kwenye {skins_dir}"

    os.environ["HERMES_HOME"] = str(tmp)
    sys.path.insert(0, str(REPO_ROOT))
    try:
        from hermes_cli.skin_engine import load_skin, list_skins
    except Exception as exc:  # noqa: BLE001
        return None, f"Imeshindwa kuingiza hermes_cli.skin_engine: {exc}"

    known = {s["name"]: s["source"] for s in list_skins()}
    if name not in known:
        return None, f"Skin '{name}' haipo. Zilizopo: {', '.join(sorted(known))}"
    return load_skin(name), None


def swatches(console, skin, keys, columns=2):
    """Chapisha rangi kama gridi (mbili kwa mstari) ili zisisogezwe."""
    from rich.table import Table
    from rich.text import Text

    grid = Table.grid(padding=(0, 3))
    for _ in range(columns):
        grid.add_column()
    cells: list[Text] = []
    for key in keys:
        value = skin.get_color(key) or "(imerithiwa)"
        cell = Text()
        cell.append("████ ", style=f"bold {value}" if value.startswith("#") else "dim")
        cell.append(f"{key}", style="default")
        cell.append(f"  {value}", style="dim")
        cells.append(cell)
    rows = (len(cells) + columns - 1) // columns
    for r in range(rows):
        grid.add_row(*[cells[r * columns + c] if r * columns + c < len(cells) else Text("")
                       for c in range(columns)])
    console.print(grid)


def main() -> int:
    ap = argparse.ArgumentParser(description="Onyesha skin ya Mwijay AI kwenye terminal.")
    ap.add_argument("skin", nargs="?", default="mwijay", help="jina la skin (default: mwijay)")
    ap.add_argument("--installed", action="store_true",
                    help="soma skins kutoka HERMES_HOME badala ya repo")
    ap.add_argument("--list", action="store_true", help="orodhesha skins zilizopo")
    ap.add_argument("--no-logo", action="store_true", help="usionyeshe nembo kubwa")
    ap.add_argument("--width", type=int, default=None, help="jaribu upana wa terminal (kawaida: halisi)")
    args = ap.parse_args()

    skins_dir = SKINS_DIR
    if args.installed:
        home = os.environ.get("HERMES_HOME")
        base = Path(home) if home else (
            Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local")) / "hermes"
            if os.name == "nt" else Path.home() / ".hermes"
        )
        skins_dir = base / "skins"

    if args.list:
        if not skins_dir.is_dir():
            return _die(f"Folda haipo: {skins_dir}")
        for f in sorted(skins_dir.glob("*.yaml")):
            print(f.stem)
        return 0

    if not skins_dir.is_dir():
        return _die(f"Folda ya skins haipo: {skins_dir}")

    skin, err = load_skin_from_dir(skins_dir, args.skin)
    if err:
        return _die(err)

    try:
        from rich.console import Console
        from rich.panel import Panel
        from rich.table import Table
        from rich.text import Text
    except ImportError:
        return _die("Moduli ya 'rich' haipo. Sakinisha: pip install rich")

    width = args.width or shutil.get_terminal_size().columns
    console = Console(width=max(60, width))

    accent = skin.get_color("banner_accent")
    dim = skin.get_color("banner_dim")
    text_c = skin.get_color("banner_text")

    console.print()
    # 1. Nembo kuu (kama terminal ni pana vya kutosha)
    if not args.no_logo and width >= 95 and skin.banner_logo:
        console.print(skin.banner_logo)
        console.print()

    # 2. Paneli ya kuanza: nembo ya mlima (kushoto) + "Available Tools" (kulia)
    layout = Table.grid(padding=(0, 3))
    layout.add_column("left", justify="center")
    layout.add_column("right", justify="left")

    left = ["", skin.banner_hero or "", ""]
    left.append(f"[{accent}]groq/gpt-oss-120b[/] [dim {dim}]·[/] [dim {dim}]131K context[/]")
    left.append(f"[dim {dim}]{Path.cwd()}[/]")
    left.append(f"[dim {skin.get_color('session_border')}]Session: demo-1a2b[/]")
    layout.add_row("\n".join(left), "\n".join([
        f"[bold {accent}]Available Tools[/]",
        f"[{text_c}]terminal, process, web_search[/]",
        f"[{text_c}]read_file, write_file, memory[/]",
        f"[{text_c}]cron, skills, computer_use[/]",
    ]))

    console.print(Panel(
        layout,
        title=f"[bold {skin.get_color('banner_title')}]Hermes v0.17.0 — {skin.get_branding('agent_name')}[/]",
        border_style=skin.get_color("banner_border"),
        padding=(0, 2),
    ))
    console.print()

    # 3. Ujumbe wa kukaribisha + alama ya prompt
    console.print(f"[{skin.get_color('prompt')}]{skin.get_branding('welcome')}[/]")
    console.print()

    # 4. Spinner (mwonekano wa kusubiri)
    spinner = getattr(skin, "spinner", None) or {}
    faces = spinner.get("waiting_faces") or ["(⚕)"]
    verbs = spinner.get("thinking_verbs") or ["inafikiria"]
    wings = skin.get_spinner_wings() or [("⟪⚕", "⚕⟫")]
    wl, wr = wings[0]
    console.print(Text.from_markup(
        f"[{accent}]{wl}[/] [{skin.get_color('prompt')}]{faces[0]}[/] "
        f"[{text_c}]{verbs[0]}…[/] [{accent}]{wr}[/]  [dim]( 2.3s · ↓ 1.2k tok)[/]"
    ))
    console.print()

    # 5. Mistari ya tools (tool_prefix)
    tp = skin.tool_prefix or "┊"
    console.print(f"[{skin.get_color('ui_label')}]{tp}[/] [{text_c}]Inasoma mwijay-hermes/skins/mwijay.yaml[/]")
    console.print(f"[{skin.get_color('ui_label')}]{tp}[/] [{skin.get_color('ui_ok')}]✓[/] [{text_c}]Skin imepakiwa[/]")
    console.print()

    # 6. Paneli la jibu
    console.print(Panel(
        SAMPLE_REPLY,
        title=f"[bold {skin.get_color('banner_title')}]{skin.get_branding('response_label')}[/]",
        border_style=skin.get_color("response_border"),
        padding=(0, 2),
    ))
    console.print()

    # 7. Rangi zote kwa mtazamo mmoja
    console.print(f"[bold {accent}]Rangi za skin '{args.skin}'[/]")
    swatches(console, skin, ["banner_title", "banner_accent", "banner_dim", "banner_text"])
    swatches(console, skin, ["ui_accent", "ui_label", "ui_ok", "ui_warn", "ui_error"])
    swatches(console, skin, ["response_border", "prompt", "session_label", "status_bar_bg"])
    console.print()

    # 8. Mstari wa mwisho
    console.print(f"[dim {dim}]{skin.get_branding('help_header')}[/]  "
                  f"[dim]/help · /model · /personality · /mwijay · /quit[/]")
    console.print(f"[{skin.get_color('prompt')}]{skin.get_branding('prompt_symbol')}[/] "
                  f"[{text_c}]andika ujumbe wako hapa…[/]")
    console.print()
    console.print(f"[dim]Upana uliojaribiwa: {width} kolamu"
                  f"{'  (nembo kuu inaonekana tu kuanzia 95)' if width < 95 else ''}[/]")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        sys.exit(130)
