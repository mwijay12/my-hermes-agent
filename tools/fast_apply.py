"""Morph Fast Apply Integration for Hermes Agent.

Merges lazy edit snippets into files at 10,500+ tok/s using Morph's morph-v3-fast model.
Handles // ... existing code ... markers and partial diffs seamlessly.
"""

from __future__ import annotations

import json
import logging
import os
import ssl
import urllib.error
import urllib.request
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

MORPH_API_BASE = "https://api.morphllm.com/v1"


def get_morph_api_key() -> Optional[str]:
    """Retrieve an active Morph API key from Hermes credential pool or environment."""
    try:
        from hermes_cli.env_loader import load_hermes_dotenv
        from hermes_constants import get_hermes_home
        load_hermes_dotenv(hermes_home=get_hermes_home())
    except Exception:
        pass

    try:
        from agent.credential_pool import load_pool

        pool = load_pool("morph")
        if pool:
            entries = pool.entries() if callable(pool.entries) else getattr(pool, "entries", [])
            for e in entries:
                if getattr(e, "access_token", None):
                    return e.access_token
    except Exception as exc:
        logger.debug("Failed to get Morph key from credential pool: %s", exc)

    return os.getenv("MORPH_API_KEY")


def fast_apply_merge(
    original_code: str,
    code_edit: str,
    instructions: str = "Apply updates to code",
    api_key: Optional[str] = None,
    timeout: float = 20.0,
) -> Tuple[bool, str]:
    """Merge code_edit into original_code using Morph Fast Apply.

    Args:
        original_code: Full original file content.
        code_edit: Snippet containing changes, potentially using '// ... existing code ...'.
        instructions: Description of what the edit accomplishes.
        api_key: Optional Morph API key override.
        timeout: Request timeout in seconds.

    Returns:
        (success, result_or_error_message)
    """
    key = api_key or get_morph_api_key()
    if not key:
        return False, "Morph API key not available for Fast Apply"

    prompt = (
        f"<instruction>{instructions}</instruction>\n"
        f"<code>{original_code}</code>\n"
        f"<update>{code_edit}</update>"
    )

    payload = {
        "model": "morph-v3-fast",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.0,
    }

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        f"{MORPH_API_BASE}/chat/completions",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "hermes-agent/morph-fast-apply",
        },
        data=json.dumps(payload).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            choices = data.get("choices", [])
            if not choices:
                return False, "Morph Fast Apply returned empty choices"
            merged = choices[0].get("message", {}).get("content", "")
            if not merged:
                return False, "Morph Fast Apply returned empty content"
            return True, merged
    except urllib.error.HTTPError as exc:
        err_body = exc.read().decode("utf-8", errors="ignore")
        logger.warning("Morph Fast Apply HTTP %d: %s", exc.code, err_body)
        return False, f"Fast Apply HTTP {exc.code}: {exc.reason}"
    except Exception as exc:
        logger.warning("Morph Fast Apply error: %s", exc)
        return False, f"Fast Apply error: {exc}"
