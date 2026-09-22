/**
 * JarvisToolCards — Rich Visual Cards for Web, GitHub, Terminal, and Media Tools.
 *
 * Renders interactive holographic telemetry cards when Hermes executes tools:
 * - 🌐 Web & Social Search Cards
 * - 🐙 GitHub Repository & PR Cards
 * - 💻 Shell & Code Execution Output
 * - 🎨 AI Image & Asset Generation
 */

import { useState } from "react";
import {
  Github,
  Globe,
  Image as ImageIcon,
  Terminal,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";
import type { ToolExecution } from "@/hooks/useJarvisGateway";

interface JarvisToolCardProps {
  tool: ToolExecution;
  className?: string;
}

export function JarvisToolCard({ tool, className = "" }: JarvisToolCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const copyResult = () => {
    if (!tool.result) return;
    const text = typeof tool.result === "string" ? tool.result : JSON.stringify(tool.result, null, 2);
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isWebSearch = tool.name.toLowerCase().includes("search") || tool.name.toLowerCase().includes("web");
  const isGithub = tool.name.toLowerCase().includes("github") || tool.name.toLowerCase().includes("git");
  const isImageGen = tool.name.toLowerCase().includes("image") || tool.name.toLowerCase().includes("flux");

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all duration-200 text-xs font-mono backdrop-blur-md ${
        tool.status === "running"
          ? "border-amber-500/50 bg-amber-950/20 shadow-[0_0_15px_rgba(255,180,0,0.15)]"
          : tool.status === "error"
          ? "border-red-500/50 bg-red-950/20"
          : "border-cyan-500/40 bg-black/60 shadow-[0_0_10px_rgba(0,240,255,0.08)]"
      } ${className}`}
    >
      {/* Card Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-2.5 bg-black/40 border-b border-cyan-500/20 cursor-pointer select-none hover:bg-black/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isWebSearch ? (
            <Globe className="w-3.5 h-3.5 text-blue-400" />
          ) : isGithub ? (
            <Github className="w-3.5 h-3.5 text-purple-400" />
          ) : isImageGen ? (
            <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
          ) : (
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          )}

          <span className="font-bold text-cyan-200">{tool.name}</span>

          <span
            className={`px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider ${
              tool.status === "running"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                : tool.status === "error"
                ? "bg-red-500/20 text-red-300 border border-red-500/40"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            }`}
          >
            {tool.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {tool.result && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                copyResult();
              }}
              className="p-1 text-muted-foreground hover:text-cyan-300 transition-colors"
              title="Copy Output"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 flex flex-col gap-2">
          {/* Tool Arguments */}
          {tool.args && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-cyan-400/70 font-semibold">PARAMETERS:</span>
              <pre className="p-2 rounded bg-black/70 border border-cyan-900/30 text-[11px] text-neutral-300 overflow-x-auto whitespace-pre-wrap break-all">
                {typeof tool.args === "string" ? tool.args : JSON.stringify(tool.args, null, 2)}
              </pre>
            </div>
          )}

          {/* Tool Result / Output */}
          {tool.result && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-emerald-400/80 font-semibold">OUTPUT:</span>
              <pre className="p-2 rounded bg-black/80 border border-emerald-900/30 text-[11px] text-emerald-200 overflow-x-auto whitespace-pre-wrap max-h-48 scrollbar-thin scrollbar-thumb-cyan-700 break-all">
                {typeof tool.result === "string" ? tool.result : JSON.stringify(tool.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface JarvisToolCardsProps {
  currentTool?: ToolExecution | null;
  tools?: ToolExecution[];
  className?: string;
}

export function JarvisToolCards({
  currentTool,
  tools = [],
  className = "",
}: JarvisToolCardsProps) {
  const displayTools = currentTool ? [currentTool, ...tools.filter((t) => t.id !== currentTool.id)] : tools;

  return (
    <div
      className={`flex flex-col gap-2 p-3 rounded-xl bg-black/60 border border-cyan-500/20 backdrop-blur-md ${className}`}
    >
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
        <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
          Tool Telemetry Stream
        </span>
        <span className="text-[10px] font-mono text-cyan-400/70">
          {displayTools.length} {displayTools.length === 1 ? "EXECUTION" : "EXECUTIONS"}
        </span>
      </div>

      {displayTools.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center text-neutral-500 font-mono text-xs">
          <span>Standby — No active tool invocations</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {displayTools.map((t) => (
            <JarvisToolCard key={t.id} tool={t} />
          ))}
        </div>
      )}
    </div>
  );
}

