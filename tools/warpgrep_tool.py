"""Morph WarpGrep Integration for Hermes Agent.

Autonomous semantic code search subagent powered by morph-warp-grep-v2.1.
Explores codebase via multi-turn tool-calling loop (grep_search, read, list_directory, glob).
"""

from __future__ import annotations

import fnmatch
import json
import logging
import os
import re
import ssl
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional

from tools.registry import registry
from tools.fast_apply import get_morph_api_key, MORPH_API_BASE

logger = logging.getLogger(__name__)


def build_repo_structure(root_dir: Path, max_depth: int = 2, max_entries: int = 300) -> str:
    """Build flat depth-2 list of paths starting with repo root."""
    paths = [str(root_dir.resolve())]
    try:
        for root, dirs, files in os.walk(root_dir):
            rel = Path(root).relative_to(root_dir)
            if len(rel.parts) >= max_depth:
                dirs.clear()
                continue
            # Skip hidden / build dirs
            dirs[:] = [d for d in dirs if not d.startswith(".") and d not in ("node_modules", "__pycache__", "venv", ".git")]
            for d in sorted(dirs):
                paths.append(str((Path(root) / d).resolve()))
                if len(paths) >= max_entries:
                    return "\n".join(paths)
            for f in sorted(files):
                if not f.startswith("."):
                    paths.append(str((Path(root) / f).resolve()))
                if len(paths) >= max_entries:
                    return "\n".join(paths)
    except Exception as exc:
        logger.debug("build_repo_structure error: %s", exc)

    return "\n".join(paths)


def _exec_grep_search(root: Path, query: str, path: str = ".") -> str:
    results = []
    target_dir = (root / path).resolve()
    try:
        pat = re.compile(query, re.IGNORECASE)
    except Exception:
        pat = re.compile(re.escape(query), re.IGNORECASE)

    for p in target_dir.rglob("*"):
        if p.is_file() and not any(part.startswith(".") or part in ("node_modules", "__pycache__", "venv") for part in p.parts):
            try:
                content = p.read_text(encoding="utf-8", errors="ignore")
                for i, line in enumerate(content.splitlines(), start=1):
                    if pat.search(line):
                        results.append(f"{p}:{i}: {line.strip()[:200]}")
                        if len(results) >= 50:
                            return "\n".join(results)
            except Exception:
                continue
    return "\n".join(results) if results else "No matches found."


def _exec_read(root: Path, path: str, start_line: int = 1, end_line: int = 200) -> str:
    target_file = (root / path).resolve() if not Path(path).is_absolute() else Path(path)
    if not target_file.is_file():
        return f"File not found: {path}"
    try:
        lines = target_file.read_text(encoding="utf-8", errors="ignore").splitlines()
        selected = lines[max(0, start_line - 1):end_line]
        return "\n".join(f"{i + start_line}: {line}" for i, line in enumerate(selected))
    except Exception as exc:
        return f"Error reading {path}: {exc}"


def _exec_list_dir(root: Path, path: str = ".") -> str:
    target_dir = (root / path).resolve() if not Path(path).is_absolute() else Path(path)
    if not target_dir.is_dir():
        return f"Directory not found: {path}"
    try:
        items = [p.name for p in target_dir.iterdir() if not p.name.startswith(".")]
        return "\n".join(sorted(items)[:100])
    except Exception as exc:
        return f"Error listing {path}: {exc}"


def _exec_glob(root: Path, pattern: str, path: str = ".") -> str:
    target_dir = (root / path).resolve() if not Path(path).is_absolute() else Path(path)
    results = []
    try:
        for p in target_dir.rglob("*"):
            if fnmatch.fnmatch(p.name, pattern):
                results.append(str(p))
                if len(results) >= 50:
                    break
        return "\n".join(results) if results else "No files matched pattern."
    except Exception as exc:
        return f"Error running glob: {exc}"


def run_warpgrep_search(query: str, repo_root: Optional[str] = None, max_turns: int = 5) -> Dict[str, Any]:
    """Execute WarpGrep semantic code search loop."""
    key = get_morph_api_key()
    if not key:
        return {"error": "Morph API key not available for WarpGrep"}

    root = Path(repo_root).resolve() if repo_root else Path.cwd()
    repo_structure = build_repo_structure(root)

    initial_prompt = (
        f"<repo_structure>\n{repo_structure}\n</repo_structure>\n"
        f"<search_query>\n{query}\n</search_query>"
    )

    messages: List[Dict[str, Any]] = [{"role": "user", "content": initial_prompt}]

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    for turn in range(max_turns):
        payload = {
            "model": "morph-warp-grep-v2.1",
            "messages": messages,
            "temperature": 0.0,
            "max_tokens": 2048,
        }

        req = urllib.request.Request(
            f"{MORPH_API_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "User-Agent": "hermes-agent/morph-warpgrep",
            },
            data=json.dumps(payload).encode("utf-8"),
        )

        try:
            with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            return {"error": f"WarpGrep API call failed: {exc}"}

        choices = data.get("choices", [])
        if not choices:
            break

        assistant_msg = choices[0].get("message", {})
        messages.append(assistant_msg)

        tool_calls = assistant_msg.get("tool_calls", [])
        if not tool_calls:
            # Reached direct completion
            return {
                "success": True,
                "answer": assistant_msg.get("content", ""),
                "turns": turn + 1,
            }

        # Check for finish tool
        for tc in tool_calls:
            fn = tc.get("function", {})
            name = fn.get("name")
            args_str = fn.get("arguments", "{}")
            try:
                args = json.loads(args_str)
            except Exception:
                args = {}

            if name == "finish":
                files = args.get("files") or args.get("locations") or args.get("file") or []
                answer = args.get("answer") or args.get("response") or f"Found target code at: {files}"
                return {
                    "success": True,
                    "answer": answer,
                    "locations": files,
                    "turns": turn + 1,
                }

            # Execute tool call
            out = ""
            if name == "grep_search":
                out = _exec_grep_search(root, args.get("query", ""), args.get("path", "."))
            elif name == "read":
                out = _exec_read(root, args.get("path", ""), args.get("start_line", 1), args.get("end_line", 200))
            elif name == "list_directory":
                out = _exec_list_dir(root, args.get("path", "."))
            elif name == "glob":
                out = _exec_glob(root, args.get("pattern", "*"), args.get("path", "."))
            else:
                out = f"Unknown tool {name}"

            messages.append({
                "role": "tool",
                "tool_call_id": tc.get("id"),
                "content": out[:5000],
            })

    return {
        "success": True,
        "answer": assistant_msg.get("content", "Search concluded"),
        "turns": max_turns,
    }


WARPGREP_SCHEMA = {
    "name": "codebase_search",
    "description": "Autonomous semantic code search powered by Morph WarpGrep (#1 on SWE-Bench Pro). Explores repositories multi-turn to find where concepts, symbols, routes, or behaviors are implemented.",
    "parameters": {
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Natural language query describing what code, logic, or function to find",
            },
            "path": {
                "type": "string",
                "description": "Root directory of the repository or subsystem to explore (default: current working directory)",
                "default": ".",
            },
        },
        "required": ["query"],
    },
}


def _handle_codebase_search(args: Dict[str, Any], **kw: Any) -> str:
    query = args.get("query", "")
    path = args.get("path", ".")
    res = run_warpgrep_search(query=query, repo_root=path)
    return json.dumps(res, indent=2, ensure_ascii=False)


def _check_warpgrep_reqs() -> bool:
    return True


registry.register(
    name="codebase_search",
    toolset="file",
    schema=WARPGREP_SCHEMA,
    handler=_handle_codebase_search,
    check_fn=_check_warpgrep_reqs,
    emoji="🛸",
    max_result_size_chars=100_000,
)
