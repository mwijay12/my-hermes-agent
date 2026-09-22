"""Morph Compact Integration for Hermes Agent.

Context compression at 33,000 tok/s using Morph's native /v1/compact endpoint
and morph-compactor. Preserves surviving lines byte-for-byte with optional query conditioning.
"""

from __future__ import annotations

import json
import logging
import ssl
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

from tools.fast_apply import get_morph_api_key, MORPH_API_BASE

logger = logging.getLogger(__name__)


def compact_text(
    input_text: str,
    query: str = "",
    compression_ratio: float = 0.5,
    preserve_recent: int = 0,
    api_key: Optional[str] = None,
    timeout: float = 15.0,
) -> Tuple[bool, str]:
    """Compress text using Morph Compact at 33,000 tok/s.

    Args:
        input_text: Full context or transcript text to compress.
        query: What matters for the next turn (guides pruning).
        compression_ratio: Target ratio (0.1 = heavy compression, 0.9 = light).
        preserve_recent: Lines at the end to keep intact.
        api_key: Optional Morph API key.
        timeout: Network timeout.

    Returns:
        (success, compressed_text_or_original)
    """
    key = api_key or get_morph_api_key()
    if not key:
        return False, input_text

    payload: Dict[str, Any] = {
        "input": input_text,
        "compression_ratio": compression_ratio,
        "preserve_recent": preserve_recent,
    }
    if query:
        payload["query"] = query

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(
        f"{MORPH_API_BASE}/compact",
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "hermes-agent/morph-compact",
        },
        data=json.dumps(payload).encode("utf-8"),
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            out = data.get("output")
            if out:
                return True, out
            return False, input_text
    except Exception as exc:
        logger.warning("Morph Compact error: %s", exc)
        return False, input_text


def compact_conversation_messages(
    messages: List[Dict[str, Any]],
    query: str = "",
    compression_ratio: float = 0.5,
    protect_head: int = 2,
    protect_tail: int = 4,
) -> List[Dict[str, Any]]:
    """Compress middle messages of a conversation using Morph Compact."""
    if len(messages) <= (protect_head + protect_tail):
        return messages

    head = messages[:protect_head]
    middle = messages[protect_head:-protect_tail]
    tail = messages[-protect_tail:]

    # Format middle messages as text for compaction
    serialized_lines = []
    for i, msg in enumerate(middle):
        role = msg.get("role", "unknown")
        content = msg.get("content") or ""
        if isinstance(content, list):
            content = json.dumps(content)
        serialized_lines.append(f"[{role.upper()} #{i+1}]: {content}")

    raw_text = "\n".join(serialized_lines)
    ok, compressed_text = compact_text(
        input_text=raw_text,
        query=query,
        compression_ratio=compression_ratio,
    )

    if not ok:
        return messages

    summary_msg = {
        "role": "user",
        "content": (
            "<historical_context_compacted via='morph-compact' tok_speed='33000'>\n"
            f"{compressed_text}\n"
            "</historical_context_compacted>"
        ),
    }

    return head + [summary_msg] + tail
