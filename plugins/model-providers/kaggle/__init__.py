"""Kaggle Cloudflare Tunnel provider profile."""

from __future__ import annotations

import logging
from providers import register_provider
from providers.base import ProviderProfile

logger = logging.getLogger(__name__)

KAGGLE_FALLBACK_MODELS = (
    "qwen3-coder:30b",
    "hermes3:8b",
)

kaggle = ProviderProfile(
    name="kaggle",
    aliases=("kaggle-cf", "kaggle-tunnel"),
    env_vars=("KAGGLE_API_KEY",),
    display_name="Kaggle",
    description="Kaggle GPU via Cloudflare Tunnel (qwen3-coder:30b, hermes3:8b)",
    signup_url="https://kaggle.com",
    fallback_models=KAGGLE_FALLBACK_MODELS,
    base_url="https://pierce-sections-lodging-agreement.trycloudflare.com/v1",
    default_max_tokens=16384,
    default_aux_model="hermes3:8b",
    supports_health_check=True,
    supports_vision=False,
)

register_provider(kaggle)
