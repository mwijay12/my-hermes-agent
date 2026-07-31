"""Round-robin API-key pool with cooldown tracking for tools that read a single
canonical env var (TTS, STT, music generation).

Why this exists
---------------
Hermes's :mod:`agent.credential_pool` natively rotates keys for inference
providers via ``auth.json``'s ``credential_pool`` block. But the TTS and
STT tools (:mod:`tools.tts_tool`, :mod:`tools.transcription_tools`) read
a single canonical env var (``ELEVENLABS_API_KEY`` / ``GROQ_API_KEY``)
on every call. This helper adds per-process rotation for those tools by:

1. Reading all keys from ``os.environ`` at first use — the canonical var
   (``ELEVENLABS_API_KEY``) plus numbered siblings (``ELEVENLABS_API_KEY_2``,
   ``ELEVENLABS_API_KEY_3``, …) sourced from ``~/.hermes/.env``.
2. On each call, picking the next healthy key (round-robin), skipping any
   key currently in cooldown, and writing it back to the canonical env
   var so downstream code paths see the chosen key.
3. On failure (``report_failure``), marking the key exhausted for a
   cooldown window: 60s for 429, 5 minutes for 401, 1 hour otherwise.
4. On success (``report_success``), clearing any cooldown.

The pool is process-local and thread-safe — cooldowns do not persist
across restarts (intentional: the next process run gets a fresh rotation).
"""

from __future__ import annotations

import logging
import os
import threading
import time
from dataclasses import dataclass, field
from typing import Iterable, Optional

logger = logging.getLogger(__name__)


_COOLDOWN_429_SECONDS = 60.0
_COOLDOWN_401_SECONDS = 5 * 60.0
_COOLDOWN_DEFAULT_SECONDS = 60 * 60.0


@dataclass
class _PooledKey:
    key: str
    label: str
    cooldown_until: float = 0.0
    last_status: Optional[int] = None
    last_error: Optional[str] = None
    success_count: int = 0
    failure_count: int = 0


@dataclass
class KeyPool:
    """Thread-safe round-robin key pool keyed by canonical env-var name.

    Usage::

        pool = KeyPool.from_env("ELEVENLABS_API_KEY")
        if pool:
            pool.acquire()                       # writes active key to env
            try:
                result = some_elevenlabs_call()
                pool.report_success()
            except ElevenLabsRateLimit as e:
                pool.report_failure(status=429, error=str(e))

    The ``acquire()`` call writes the chosen key to ``os.environ[<canonical>]``
    so the next :func:`hermes_cli.config.get_env_value` call sees it.
    """

    canonical_var: str
    keys: list[_PooledKey] = field(default_factory=list)
    _cursor: int = 0
    _lock: threading.Lock = field(default_factory=threading.Lock)

    @classmethod
    def from_env(
        cls,
        canonical_var: str,
        *,
        extra_keys: Iterable[str] = (),
    ) -> Optional["KeyPool"]:
        """Build a pool from ``os.environ`` + ``~/.hermes/.env``.

        Reads the canonical var and any numbered siblings (``_2``, ``_3``,
        …) plus an optional ``extra_keys`` iterable (handy for tests).
        Returns ``None`` if no keys are configured so callers can short
        out cleanly when there's nothing to rotate.

        Returns ``None`` when only the canonical var is set — there's
        nothing to rotate against, and the caller's single-key code path
        stays in charge.  The pool only activates when there is at least
        one numbered sibling (or ``extra_keys`` was supplied), keeping
        tests that set just ``os.environ[canonical_var]`` unchanged.
        """
        try:
            from hermes_cli.config import load_env
            dotenv = load_env()
        except Exception:
            dotenv = {}

        def _read(name: str) -> str:
            return (
                os.environ.get(name)
                or dotenv.get(name)
                or ""
            ).strip()

        keys: list[_PooledKey] = []
        primary = _read(canonical_var)
        if primary:
            keys.append(_PooledKey(key=primary, label=f"{canonical_var}"))

        # Numbered siblings: _2, _3, …, _99 (cap to avoid pathological loops).
        # The early-break guard (n > 50) means: if we hit a contiguous gap past
        # sibling 50, assume the rest are unset and stop iterating. Sibling
        # numbers >10 used to trigger the break; raised to 50 so setups with
        # 11..50+ contiguous keys still load fully.
        sibling_found = False
        for n in range(2, 100):
            sibling = _read(f"{canonical_var}_{n}")
            if not sibling:
                # Stop at first missing suffix so trailing gaps don't waste work.
                if n > 50:
                    break
                continue
            sibling_found = True
            keys.append(_PooledKey(key=sibling, label=f"{canonical_var}_{n}"))

        for extra in extra_keys:
            extra = (extra or "").strip()
            if extra:
                sibling_found = True
                keys.append(_PooledKey(key=extra, label="extra"))

        if not keys:
            return None
        # Single-key fast path: caller keeps its own single-env-var code path.
        if not sibling_found and not extra_keys:
            return None
        return cls(canonical_var=canonical_var, keys=keys)

    @property
    def size(self) -> int:
        return len(self.keys)

    def has_available(self) -> bool:
        """True if at least one key is not in cooldown right now."""
        now = time.monotonic()
        return any(k.cooldown_until <= now for k in self.keys)

    def _cooldown_for(self, status: Optional[int]) -> float:
        if status == 429:
            return _COOLDOWN_429_SECONDS
        if status == 401:
            return _COOLDOWN_401_SECONDS
        return _COOLDOWN_DEFAULT_SECONDS

    def acquire(self) -> Optional[str]:
        """Pick the next healthy key, write it to ``os.environ[<canonical>]``,
        and return it. Returns ``None`` when every key is in cooldown.
        """
        with self._lock:
            now = time.monotonic()
            start = self._cursor
            for offset in range(len(self.keys)):
                idx = (start + offset) % len(self.keys)
                k = self.keys[idx]
                if k.cooldown_until > now:
                    continue
                self._cursor = (idx + 1) % len(self.keys)
                os.environ[self.canonical_var] = k.key
                logger.debug(
                    "KeyPool(%s) acquired %s (cursor -> %d)",
                    self.canonical_var,
                    k.label,
                    self._cursor,
                )
                return k.key
            logger.warning(
                "KeyPool(%s): every key is in cooldown; "
                "calls will fail until the earliest expires",
                self.canonical_var,
            )
            return None

    def report_failure(
        self,
        *,
        key: Optional[str] = None,
        status: Optional[int] = None,
        error: Optional[str] = None,
    ) -> None:
        """Mark a key as exhausted for a cooldown window.

        If ``key`` is ``None`` we mark whichever key is currently active
        in ``os.environ`` (the one this pool just ``acquire()``'d).
        """
        target_key = key or os.environ.get(self.canonical_var)
        if not target_key:
            return
        with self._lock:
            for k in self.keys:
                if k.key != target_key:
                    continue
                cooldown = self._cooldown_for(status)
                k.cooldown_until = time.monotonic() + cooldown
                k.last_status = status
                k.last_error = error
                k.failure_count += 1
                logger.info(
                    "KeyPool(%s) cooldown %s for %.0fs (status=%s, error=%s)",
                    self.canonical_var,
                    k.label,
                    cooldown,
                    status,
                    error[:120] if error else "",
                )
                return

    def report_success(self, key: Optional[str] = None) -> None:
        """Clear cooldown + bump success counter for the active key."""
        target_key = key or os.environ.get(self.canonical_var)
        if not target_key:
            return
        with self._lock:
            for k in self.keys:
                if k.key != target_key:
                    continue
                if k.cooldown_until or k.failure_count:
                    logger.debug(
                        "KeyPool(%s) recovered %s after %d prior failure(s)",
                        self.canonical_var,
                        k.label,
                        k.failure_count,
                    )
                k.cooldown_until = 0.0
                k.last_status = None
                k.last_error = None
                k.success_count += 1
                return

    def status_lines(self) -> list[str]:
        """Human-readable status snapshot for `hermes tools` / logs."""
        now = time.monotonic()
        lines = [f"KeyPool({self.canonical_var}): {len(self.keys)} keys"]
        for k in self.keys:
            if k.cooldown_until > now:
                remaining = int(k.cooldown_until - now)
                state = f"cooldown {remaining}s (status={k.last_status})"
            else:
                state = "ok"
            lines.append(
                f"  - {k.label}: {state} "
                f"(ok={k.success_count}, fail={k.failure_count})"
            )
        return lines


# ---------------------------------------------------------------------------
# Module-level singletons — built lazily on first use so importing this
# module doesn't force a .env read at import time.
# ---------------------------------------------------------------------------

_elevenlabs_pool: Optional[KeyPool] = None
_groq_pool: Optional[KeyPool] = None
_pools_lock = threading.Lock()


def get_elevenlabs_pool() -> Optional[KeyPool]:
    global _elevenlabs_pool
    with _pools_lock:
        if _elevenlabs_pool is None:
            _elevenlabs_pool = KeyPool.from_env("ELEVENLABS_API_KEY")
        return _elevenlabs_pool


def get_groq_pool() -> Optional[KeyPool]:
    global _groq_pool
    with _pools_lock:
        if _groq_pool is None:
            _groq_pool = KeyPool.from_env("GROQ_API_KEY")
        return _groq_pool