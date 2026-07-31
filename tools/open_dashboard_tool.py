#!/usr/bin/env python3
"""Open the Hermes Agent Web UI Dashboard in the default browser.

Provides seamless transition from Terminal / TUI to the rich Web UI Dashboard
(Profiles, Sessions, Channels, Models, Cron, MCP, Webhooks, Skills, Logs, Pairing).
"""

import json
import logging
import os
import sys
import subprocess
import time
import urllib.request
import webbrowser
from pathlib import Path

from tools.registry import registry, tool_error

logger = logging.getLogger(__name__)

DEFAULT_PORT = 9119
DEFAULT_URL = f"http://127.0.0.1:{DEFAULT_PORT}"


def _is_dashboard_running(url: str = DEFAULT_URL, timeout: float = 1.5) -> bool:
    """Check if the web dashboard is responding to HTTP requests."""
    try:
        req = urllib.request.Request(url, method="HEAD")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status in (200, 301, 302, 401, 403)
    except Exception:
        return False


def open_dashboard_tool(section: str = "") -> str:
    """Launch or open the Hermes Web UI Dashboard in the user's default browser."""
    target_url = DEFAULT_URL
    section_path = (section or "").strip().lstrip("/")
    if section_path:
        target_url = f"{DEFAULT_URL}/{section_path}"

    # Check if dashboard server is running; if not, launch it in background
    if not _is_dashboard_running():
        try:
            # Use sys.executable to run `python -m hermes_cli.main dashboard --no-open`
            cmd = [sys.executable, "-m", "hermes_cli.main", "dashboard", "--no-open"]
            creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
            subprocess.Popen(
                cmd,
                cwd=str(Path(__file__).parent.parent),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=creationflags,
            )
            # Short sleep to allow server startup
            time.sleep(2.0)
        except Exception as exc:
            logger.warning("Failed to background-launch dashboard server: %s", exc)

    # Open target URL in default browser
    try:
        webbrowser.open(target_url)
        return json.dumps(
            {
                "success": True,
                "url": target_url,
                "message": f"Opened Web UI Dashboard at {target_url}",
            },
            ensure_ascii=False,
        )
    except Exception as exc:
        return tool_error(f"Failed to open web browser for {target_url}: {exc}")


def check_open_dashboard_requirements() -> bool:
    """Always available — works on Windows, macOS, Linux."""
    return True


OPEN_DASHBOARD_SCHEMA = {
    "name": "open_dashboard",
    "description": (
        "Open the Hermes Web UI Dashboard in the default browser. "
        "Use this when the user asks to open the web interface, launch dashboard, "
        "access web controls, or manage Profiles, Sessions, Channels, Models, Cron, "
        "MCP, Webhooks, Skills, or Logs on the web. Optional 'section' parameter "
        "can specify a page like 'models', 'skills', 'profiles', 'cron', 'mcp', 'sessions'."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "section": {
                "type": "string",
                "description": (
                    "Optional section/page to open: 'models', 'skills', 'profiles', "
                    "'cron', 'mcp', 'channels', 'sessions', 'logs', 'env', 'config'."
                ),
            }
        },
        "required": [],
    },
}

registry.register(
    name="open_dashboard",
    toolset="terminal",
    schema=OPEN_DASHBOARD_SCHEMA,
    handler=lambda args, **kw: open_dashboard_tool(section=args.get("section", "")),
    check_fn=check_open_dashboard_requirements,
    emoji="🌐",
)
