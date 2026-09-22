"""Morph provider profile.

Morph serves fast open-weight models (Kimi K3, GLM-5.3, DeepSeek V4 Flash, MiniMax M3, Qwen 3.6)
and specialized subagents (Fast Apply, WarpGrep, Compact, Model Router, Reflexes).
"""

from __future__ import annotations

import logging
from typing import Any

from providers import register_provider
from providers.base import ProviderProfile

logger = logging.getLogger(__name__)

MORPH_FALLBACK_MODELS = (
    "morph-kimik3",
    "morph-glm53-744b",
    "morph-glm53flash",
    "morph-dsv4flash",
    "morph-minimax3-428b",
    "morph-qwen36-27b",
    "morph-v3-fast",
    "morph-compactor",
    "morph-warp-grep-v2.1",
)


class MorphProfile(ProviderProfile):
    """Morph provider profile."""

    def __init__(self) -> None:
        super().__init__(
            name="morph",
            display_name="Morph",
            description="Fast specialized models & subagents for AI coding agents",
            signup_url="https://morphllm.com/dashboard/api-keys",
            api_mode="chat_completions",
            aliases=("morphllm", "morph-ai"),
            base_url="https://api.morphllm.com/v1",
            env_vars=("MORPH_API_KEY",),
            auth_type="api_key",
            supports_health_check=True,
            supports_vision=True,
            fallback_models=MORPH_FALLBACK_MODELS,
            default_aux_model="morph-glm53flash",
        )

    def build_api_kwargs_extras(
        self,
        *,
        reasoning_config: dict | None = None,
        model: str | None = None,
        **context: Any,
    ) -> tuple[dict[str, Any], dict[str, Any]]:
        """Configure reasoning or service tier if provided."""
        extra_body: dict[str, Any] = {}
        top_level: dict[str, Any] = {}

        if reasoning_config and isinstance(reasoning_config, dict):
            effort = reasoning_config.get("effort")
            if effort in ("low", "medium", "high"):
                extra_body["reasoning"] = {"effort": effort}

        return extra_body, top_level


register_provider(MorphProfile())
