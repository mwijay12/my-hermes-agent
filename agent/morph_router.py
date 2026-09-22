"""Morph Model Router Integration for Hermes Agent.

Classifies prompts in ~50-180ms across difficulty (easy/medium/hard),
ambiguity (low/med/high), and domain (coding/general/design/data).
Enables dynamic routing to the optimal/cheapest model per turn.
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


def classify_prompt(
    prompt_text: str,
    classes: Optional[List[str]] = None,
    api_key: Optional[str] = None,
    timeout: float = 5.0,
) -> Optional[Dict[str, Any]]:
    """Classify prompt difficulty, ambiguity, and domain using Morph Router.

    Returns dict with keys: 'difficulty', 'ambiguity', 'domain' (or None on failure).
    """
    key = api_key or get_morph_api_key()
    if not key or not prompt_text.strip():
        return None

    payload: Dict[str, Any] = {"input": prompt_text[:2000]}
    if classes:
        payload["classes"] = classes
    else:
        payload["classes"] = ["difficulty", "ambiguity", "domain"]

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        f"{MORPH_API_BASE}/router/classify",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "hermes-agent/morph-router",
        },
        data=json.dumps(payload).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("classifications")
    except Exception as exc:
        logger.debug("Morph router/classify call failed: %s", exc)
        return None


def select_optimal_model(
    prompt_text: str,
    default_model: str = "morph-kimik3",
    api_key: Optional[str] = None,
) -> str:
    """Select the best Morph model for the prompt based on difficulty classification.

    - easy -> 'morph-dsv4flash' (DeepSeek V4 Flash ~150-200 tok/s, lowest cost)
    - medium / hard -> 'morph-kimik3' (Kimi K3 2.8T high reasoning capacity)
    """
    classifications = classify_prompt(prompt_text, classes=["difficulty"], api_key=api_key)
    if not classifications:
        return default_model

    diff_info = classifications.get("difficulty", {})
    label = diff_info.get("label", "medium")
    confidence = diff_info.get("confidence", 0.0)

    logger.debug("Morph Router classified prompt difficulty as %s (conf: %.2f)", label, confidence)

    if label == "easy" and confidence >= 0.7:
        return "morph-dsv4flash"
    elif label == "hard":
        return "morph-kimik3"
    else:
        return default_model
