#!/usr/bin/env python3
"""
Mwijay AI — Kimi K3 Bridge (MAJARIBIO TU)

Inafanya Kimi K3 local (kimi-k3-in-c binary) ionekane kama OpenAI-compatible API,
ili Hermes Agent ingeweza kuitumia kama provider: custom.

⚠️  MAONYO:
- Inahitaji checkpoint ya Kimi K3 (1.56 TB) — PC ya Mwijay ya sasa (<1 TB) HAIWEZI.
- Ni polepole sana: sekunde 5-26 kwa token. SIO kwa kazi za kila siku.
- Kwa kazi halisi tumia Groq / Gemini / OpenRouter.

Matumizi:
    python kimi_bridge.py --k3-bin ./bin/k3 --model-dir ~/k3model --trunk ~/k3trunk --port 8080

Kisha kwenye Hermes config.yaml:
    model:
      provider: "custom"
      base_url: "http://127.0.0.1:8080/v1"
      default: "kimi-k3-local"

Hii ni mfano wa kuanzia (starter) — inatumia tu standard library, hakuna dependencies.
"""

import argparse
import json
import subprocess
import time
from http.server import BaseHTTPRequestHandler, HTTPServer


def run_k3(k3_bin: str, model_dir: str, trunk: str, prompt: str, gen: int = 64) -> str:
    """Endesha kimi-k3-in-c binary na kurudisha generated text."""
    cmd = [
        k3_bin, model_dir,
        "--trunk", trunk,
        "--preset", "laptop",
        "--tok", model_dir,
        "--prompt", prompt,
        "--gen", str(gen),
        "--incremental",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=3600)
    output = result.stdout or ""
    # Binary inachapisha kati ya "--- generated text ---" na "----------------------"
    if "--- generated text ---" in output:
        output = output.split("--- generated text ---", 1)[1]
    if "----------------------" in output:
        output = output.split("----------------------", 1)[0]
    return output.strip() or "(Kimi K3 haikurudisha maandishi — angalia model/trunk paths)"


class Handler(BaseHTTPRequestHandler):
    k3_bin = "./bin/k3"
    model_dir = ""
    trunk = ""
    gen = 64

    def _json(self, code: int, payload: dict):
        body = json.dumps(payload).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path in ("/v1/models", "/models"):
            self._json(200, {"object": "list", "data": [{"id": "kimi-k3-local", "object": "model"}]})
        else:
            self._json(404, {"error": "not found"})

    def do_POST(self):
        if self.path not in ("/v1/chat/completions", "/chat/completions"):
            self._json(404, {"error": "not found"})
            return
        length = int(self.headers.get("Content-Length", 0))
        data = json.loads(self.rfile.read(length) or b"{}")
        messages = data.get("messages", [])
        prompt = "\n".join(f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages)
        max_tokens = int(data.get("max_tokens", self.gen))
        print(f"[kimi-bridge] prompt chars={len(prompt)} max_tokens={max_tokens} — inasubiri Kimi K3 (polepole!)...")
        text = run_k3(self.k3_bin, self.model_dir, self.trunk, prompt, gen=max_tokens)
        self._json(200, {
            "id": f"chatcmpl-{int(time.time())}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": data.get("model", "kimi-k3-local"),
            "choices": [{"index": 0, "message": {"role": "assistant", "content": text}, "finish_reason": "stop"}],
            "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
        })

    def log_message(self, fmt, *args):
        print(f"[kimi-bridge] {fmt % args}")


def main():
    p = argparse.ArgumentParser(description="Kimi K3 -> OpenAI-compatible bridge (majaribio)")
    p.add_argument("--k3-bin", default="./bin/k3", help="Path ya kimi-k3-in-c binary")
    p.add_argument("--model-dir", required=True, help="Folder ya Kimi K3 checkpoint (1.56 TB!)")
    p.add_argument("--trunk", required=True, help="Folder ya trunk")
    p.add_argument("--port", type=int, default=8080)
    p.add_argument("--gen", type=int, default=64, help="Default tokens za kuzalisha")
    args = p.parse_args()

    Handler.k3_bin = args.k3_bin
    Handler.model_dir = args.model_dir
    Handler.trunk = args.trunk
    Handler.gen = args.gen

    print("=" * 60)
    print("Mwijay AI — Kimi K3 Bridge (MAJARIBIO)")
    print(f"  Binary: {args.k3_bin}")
    print(f"  Model:  {args.model_dir}")
    print(f"  API:    http://127.0.0.1:{args.port}/v1")
    print("  ⚠️  Polepole sana (5-26 s/token). Kwa kazi halisi: Groq/Gemini.")
    print("=" * 60)
    HTTPServer(("127.0.0.1", args.port), Handler).serve_forever()


if __name__ == "__main__":
    main()
