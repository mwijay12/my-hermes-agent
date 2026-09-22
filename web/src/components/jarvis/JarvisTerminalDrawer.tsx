/**
 * JarvisTerminalDrawer — Slide-out CLI Terminal Console for JARVIS.
 *
 * Embeds xterm.js PTY session in a collapsible Stark-HUD drawer so the user
 * can interact with raw CLI tools, run shell scripts, or inspect logs anytime.
 */

import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { Terminal, X } from "lucide-react";
import { buildWsUrl } from "@/lib/api";

interface JarvisTerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function JarvisTerminalDrawer({
  isOpen,
  onClose,
  className = "",
}: JarvisTerminalDrawerProps) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isOpen || !terminalRef.current) return;

    const term = new XTerm({
      cursorBlink: true,
      fontFamily: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, monospace',
      fontSize: 13,
      theme: {
        background: "#030d12",
        foreground: "#00f0ff",
        cursor: "#00f0ff",
        selectionBackground: "rgba(0, 240, 255, 0.3)",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Connect to PTY WS
    let unmounting = false;
    void (async () => {
      try {
        const token = `jarvis-term-${Date.now()}`;
        const wsUrl = await buildWsUrl("/api/pty", { token, cols: "80", rows: "24" });
        if (unmounting) return;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          term.writeln("\x1b[1;36m=== JARVIS TERMINAL CONSOLE LINKED ===\x1b[0m\r\n");
        };

        ws.onmessage = (ev) => {
          term.write(ev.data);
        };

        term.onData((data) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(data);
          }
        });
      } catch {
        term.writeln("\x1b[1;31mTerminal connection fallback mode active.\x1b[0m\r\n");
      }
    })();

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      unmounting = true;
      window.removeEventListener("resize", handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
      term.dispose();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-0 right-0 left-0 sm:left-auto sm:w-[600px] h-[380px] z-50 flex flex-col bg-black/95 border-t sm:border-l sm:border-t border-cyan-500/50 rounded-t-xl shadow-[0_0_30px_rgba(0,240,255,0.25)] backdrop-blur-xl transition-transform duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-cyan-950/40 border-b border-cyan-500/30">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300">
          <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>STARK CLI CONSOLE</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-cyan-400 hover:text-cyan-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal Viewport */}
      <div ref={terminalRef} className="flex-1 p-2 overflow-hidden bg-[#030d12]" />
    </div>
  );
}
