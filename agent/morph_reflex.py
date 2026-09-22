"""Morph Reflex Integration for Hermes Agent.

Sub-90ms turn classifiers for:
- 'jailbreak': prompt injection & safety violation detection
- 'stuck-in-a-loop': loops & agent stall detection
- 'user-frustrated': user frustration detection
- 'leaked-thinking': raw reasoning/thinking leak detection
"""

from __future__ import annotations

import json
import logging
import ssl
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional

from tools.fast_apply import get_morph_api_key, MORPH_API_BASE

logger = logging.getLogger(__name__)


def predict_reflex(
    model: str,
    text: str,
    api_key: Optional[str] = None,
    timeout: float = 4.0,
) -> Optional[Dict[str, Any]]:
    """Query Morph Reflex classifier for a specific model."""
    key = api_key or get_morph_api_key()
    if not key or not text.strip():
        return None

    payload = {
        "model": model,
        "text": text[:8000],
    }

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        f"{MORPH_API_BASE}/reflex/predict",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "hermes-agent/morph-reflex",
        },
        data=json.dumps(payload).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        logger.debug("Morph Reflex predict (%s) error: %s", model, exc)
        return None


def is_jailbreak(text: str) -> bool:
    """Return True if text is flagged as a prompt injection or jailbreak."""
    res = predict_reflex("jailbreak", text)
    if not res:
        return False
    classes = res.get("classes", [])
    for c in classes:
        if c.get("label", "").lower() == "jailbreak" and c.get("selected") is True:
            return True
    return False


def is_stuck_in_a_loop(text: str) -> bool:
    """Return True if agent appears stuck in a repeating tool loop."""
    res = predict_reflex("stuck-in-a-loop", text)
    if not res:
        return False
    classes = res.get("classes", [])
    for c in classes:
        if c.get("label", "").lower() in ("looping", "stuck") and c.get("selected") is True:
            return True
    return False


def is_user_frustrated(text: str) -> bool:
    """Return True if user input indicates significant frustration."""
    res = predict_reflex("user-frustrated", text)
    if not res:
        return False
    classes = res.get("classes", [])
    for c in classes:
        if c.get("label", "").lower() == "frustrated" and c.get("selected") is True:
            return True
    return False


def has_leaked_thinking(text: str) -> bool:
    """Return True if text leaks internal thinking traces."""
    res = predict_reflex("leaked-thinking", text)
    if not res:
        return False
    classes = res.get("classes", [])
    for c in classes:
        if c.get("label", "").lower() == "leaked" and c.get("selected") is True:
            return True
    return False
