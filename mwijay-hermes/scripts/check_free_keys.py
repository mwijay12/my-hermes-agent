#!/usr/bin/env python3
"""check_free_keys.py — Pima kama API keys zako za bure zinaishi.

Usage:
    python3 check_free_keys.py                # jaribu providers wote wanaojulikana
    python3 check_free_keys.py groq gemini    # jaribu hawa tu
    python3 check_free_keys.py --list         # orodha ya majina ya providers

Inasoma .env kutoka:
    $HERMES_HOME/.env  (au ~/.hermes/.env, au %LOCALAPPDATA%\\hermes\\.env kwenye Windows)
na pia env zilizopo tayari kwenye shell. Haisomi wala kuchapisha thamani ya key —
inaonyesha SAWASAWAA / IMEKWAMA na sababu pekee (401, 429, n.k.).

Ombi ni fupi sana (model + ujumbe wa maneno machache, max_tokens=16) ili isile
mikopo yako ya bure. Inatumia stdlib pekee (urllib) — hakuna cha kusakinisha.
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# jina -> (env var, base_url, model, native?)
PROVIDERS: dict[str, tuple[str, str, str, bool]] = {
    # ---- native (Hermes inawatambua moja kwa moja) ----
    "groq":         ("GROQ_API_KEY",       "https://api.groq.com/openai/v1",                 "openai/gpt-oss-120b",   True),
    "nvidia":       ("NVIDIA_API_KEY",     "https://integrate.api.nvidia.com/v1",            "z-ai/glm-5.2",          True),
    "opencode-zen": ("OPENCODE_API_KEY",   "https://opencode.ai/zen/v1",                     "deepseek-v4-flash-free", True),
    "kilocode":     ("KILO_API_KEY",       "https://api.kilo.ai/api/gateway",                "nvidia/nemotron-3-ultra-550b-a55b:free", True),
    "openrouter":   ("OPENROUTER_API_KEY", "https://openrouter.ai/api/v1",                   "nvidia/nemotron-3-ultra-550b-a55b:free", True),
    "zai":          ("ZAI_API_KEY",        "https://open.bigmodel.cn/api/paas/v4",           "glm-4.5-flash",         True),
    "deepseek":     ("DEEPSEEK_API_KEY",   "https://api.deepseek.com/v1",                    "deepseek-chat",         True),
    "mistral":      ("MISTRAL_API_KEY",    "https://api.mistral.ai/v1",                      "mistral-small-latest",  False),
    # ---- custom (OpenAI-compatible) ----
    "inception":    ("INCEPTION_API_KEY",  "https://api.inceptionlabs.ai/v1",                "mercury-2",             False),
    "agnes":        ("AGNES_API_KEY",      "https://apihub.agnes-ai.com/v1",                 "agnes-2.0-flash",       False),
    "cerebras":     ("CEREBRAS_API_KEY",   "https://api.cerebras.ai/v1",                     "gpt-oss-120b",          False),
    "sambanova":    ("SAMBANOVA_API_KEY",  "https://api.sambanova.ai/v1",                    "Meta-Llama-3.3-70B-Instruct", False),
    "github-models": ("GITHUB_TOKEN",      "https://models.github.ai/inference",             "openai/gpt-4o-mini",    False),
    "llm7":         ("LLM7_API_KEY",       "https://api.llm7.io/v1",                         "gpt-oss-20b",           False),
    "modelscope":   ("MODELSCOPE_API_KEY", "https://api-inference.modelscope.cn/v1",         "Qwen/Qwen3-5-35B-A3B",  False),
    "siliconflow":  ("SILICONFLOW_API_KEY", "https://api.siliconflow.cn/v1",                 "Qwen/Qwen3-8B",         False),
    "chutes":       ("CHUTES_API_KEY",     "https://api.chutes.ai/v1",                       "chutesai/Llama-3.3-70B-Instruct", False),
}

TIMEOUT = 25


def env_file_paths() -> list[Path]:
    paths: list[Path] = []
    home = Path.home()
    if os.name == "nt":
        base = os.environ.get("LOCALAPPDATA")
        if base:
            paths.append(Path(base) / "hermes" / ".env")
    hermes_home = os.environ.get("HERMES_HOME")
    if hermes_home:
        paths.append(Path(hermes_home) / ".env")
    paths.append(home / ".hermes" / ".env")
    return paths


def load_env_file() -> dict[str, str]:
    """Soma .env ya kwanza inayopatikana (haitoi thamani popote)."""
    for p in env_file_paths():
        try:
            if not p.is_file():
                continue
        except OSError:
            continue
        out: dict[str, str] = {}
        for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, _, v = line.partition("=")
            v = v.strip().strip('"').strip("'")
            if v and k.strip() not in out:
                out[k.strip()] = v
        if out:
            return out
    return {}


def probe(name: str, env_var: str, base_url: str, model: str) -> tuple[str, str, float]:
    """Rudisha (hali, maelezo, sekunde). Hali: OK / HAKUNA-KEY / IMEKWAMA."""
    key = os.environ.get(env_var) or FILE_ENV.get(env_var, "")
    if not key:
        return "HAKUNA-KEY", f"{env_var} haijawekwa", 0.0

    url = base_url.rstrip("/") + "/chat/completions"
    payload = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": "Hi"}],
        "max_tokens": 16,
        "stream": False,
    }).encode()
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
            "User-Agent": "hermes-free-key-check/1.0",
        },
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            body = resp.read(4096).decode("utf-8", "replace")
            ms = time.time() - t0
            if resp.status == 200 and '"choices"' in body:
                return "SAWASAWAA", f"{model} — 200 OK", ms
            return "SAWASAWAA*", f"{model} — 200 lakini jibu si la kawaida", ms
    except urllib.error.HTTPError as e:
        ms = time.time() - t0
        detail = ""
        try:
            detail = e.read(512).decode("utf-8", "replace").replace("\n", " ")[:160]
        except Exception:
            pass
        hint = {
            401: "key si sahihi au haina ruhusa",
            403: "key imezuiwa / haina ruhusa ya model huu",
            404: "model au endpoint haupo (angalia base URL / jina la model)",
            429: "rate limit — key iko hai, subi kidogo",
        }.get(e.code, "")
        msg = f"HTTP {e.code}" + (f" — {hint}" if hint else "")
        if detail and e.code not in (401, 403):
            msg += f" | {detail}"
        # 429 = key inafanya kazi, imezuiwa kwa muda tu
        return ("SAWASAWAA*" if e.code == 429 else "IMEKWAMA"), msg, ms
    except Exception as e:  # noqa: BLE001
        ms = time.time() - t0
        return "IMEKWAMA", f"{type(e).__name__}: {e}"[:160], ms


FILE_ENV: dict[str, str] = {}


def main() -> int:
    args = sys.argv[1:]
    if args and args[0] in ("-h", "--help"):
        print(__doc__)
        return 0
    if args and args[0] == "--list":
        for n in PROVIDERS:
            print(n)
        return 0

    global FILE_ENV
    FILE_ENV = load_env_file()

    names = [a for a in args if not a.startswith("-")] or list(PROVIDERS)
    unknown = [n for n in names if n not in PROVIDERS]
    for n in unknown:
        print(f"[?] '{n}' haijulikani — ruka (tumia --list kuona majina)")

    names = [n for n in names if n in PROVIDERS]
    if not names:
        print("Hakuna provider wa kupima.")
        return 2

    print(f"Kupima providers {len(names)} (ombi fupi, max_tokens=16)...\n")
    print(f"{'PROVIDER':<14} {'HALI':<12} {'MS':>5}  MAELEZO")
    print("-" * 84)

    results = []
    for n in names:
        env_var, base, model, _native = PROVIDERS[n]
        status, msg, secs = probe(n, env_var, base, model)
        ms = f"{secs * 1000:.0f}"
        print(f"{n:<14} {status:<12} {ms:>5}  {msg}")
        results.append((n, status))

    ok = sum(1 for _, s in results if s.startswith("SAWASAWAA"))
    nokey = sum(1 for _, s in results if s == "HAKUNA-KEY")
    bad = sum(1 for _, s in results if s == "IMEKWAMA")

    print("-" * 84)
    print(f"Jumla: {ok} zinaishi · {nokey} hazina key · {bad} zimekwama  (ya {len(results)})")
    print("\nEndelea:")
    print("  1. Weka keys ulizonazo kwenye ~/.hermes/.env (angalia config/.env.free.example)")
    print("  2. Ongeza providers wa custom kwenye 'providers:' ya config.yaml")
    print("  3. Weka mnyororo wa fallback_model ili Hermes izunguke yenyewe")
    print("\nKumbuka: 429 haimaanishi key imekufa — ni rate limit tu. Subi na ujaribu tena.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\nImekatishwa.")
        sys.exit(130)
