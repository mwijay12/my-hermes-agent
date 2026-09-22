import React from "react";
import {
  Sparkles,
  Zap,
  Flame,
  ArrowRight,
} from "lucide-react";

interface JarvisPersonalHubProps {
  onExecutePrompt: (prompt: string) => void;
}

export const JarvisPersonalHub: React.FC<JarvisPersonalHubProps> = ({
  onExecutePrompt,
}) => {
  const hubSections = [
    {
      id: "piano-sifa",
      title: "🎹 Piano Sifa Studio",
      subtitle: "Gospel Amapiano Movement",
      accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
      badge: "Mwamba & Kukuabudu Mungu",
      actions: [
        {
          label: "Log Drum & Chord Progression",
          prompt:
            "Design a powerful Gospel Amapiano arrangement with authentic log drum syncopation, jazzy minor 9th chords, and transitional vocal chops in the key of F# Minor.",
        },
        {
          label: "Swahili & English Gospel Lyrics",
          prompt:
            "Write an uplifting, rhythmic Gospel Amapiano song hook and verse blending Swahili and English praises with an infectious energetic choir melody.",
        },
        {
          label: "Release & Marketing Campaign",
          prompt:
            "Generate a comprehensive rollout strategy for our next Piano Sifa track across TikTok, Audiomack, YouTube Shorts, and East African gospel DJ networks.",
        },
      ],
    },
    {
      id: "browser-scout",
      title: "🌐 Deep Web & GitHub Scout",
      subtitle: "Autonomous Browser & Agent Search",
      accent: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400",
      badge: "Live Browser Intelligence",
      actions: [
        {
          label: "Search Trending AI Agents on GitHub",
          prompt:
            "Use your browser and web tools to search GitHub and find the most trending autonomous agent repositories and JARVIS-like architectures released recently.",
        },
        {
          label: "Analyze Web Tech & Best Practices",
          prompt:
            "Browse the web to extract the latest 2026 UI/UX design trends, Cyberpunk glassmorphism CSS tricks, and fast Web Audio API implementations.",
        },
        {
          label: "Scrape & Summarize Tech Docs",
          prompt:
            "Use browser tools to inspect online documentation for modern TypeScript frameworks and summarize the top 3 architectural patterns.",
        },
      ],
    },
    {
      id: "desktop-commander",
      title: "🖥️ Computer Use & Desktop Control",
      subtitle: "Autonomous PC Automation",
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      badge: "Windows CUA Engine",
      actions: [
        {
          label: "Inspect Active Workspace & Windows",
          prompt:
            "Check my current workspace files and running processes to give me a clean diagnostic summary of what we're working on.",
        },
        {
          label: "Clean & Format Codebase",
          prompt:
            "Scan the local project directory, check for any typescript or formatting errors, and optimize bundle size.",
        },
        {
          label: "Workspace Health Diagnostic",
          prompt:
            "Run a full /doctor health check on all API keys, local models (Ollama, DeepSeek), and environment variables.",
        },
      ],
    },
    {
      id: "agent-swarm",
      title: "👥 Multi-Agent Swarm / Bot Squad",
      subtitle: "Parallel AI Specialists",
      accent: "from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400",
      badge: "Multi-Agent Swarm",
      actions: [
        {
          label: "Spawn Producer + Coder + Wingman",
          prompt:
            "Activate a multi-agent swarm: Agent 1 (Amapiano Music Producer), Agent 2 (Senior TypeScript Architect), and Agent 3 (Creative Strategist) to collaborate on our next milestone.",
        },
        {
          label: "Parallel Research & Coding Sprint",
          prompt:
            "Delegate tasks across subagents: have one subagent research API optimizations while another builds the UI mockup.",
        },
        {
          label: "Review Swarm Outputs",
          prompt:
            "Synthesize all active subagent work and provide a single clean executive summary of progress.",
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-black/60 border border-cyan-500/30 backdrop-blur-md">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold font-mono text-white flex items-center gap-2">
              <span>MZEE MWIJAY COMMAND STATION</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-normal">
                Personalized for David Erick Mwijage
              </span>
            </h2>
            <p className="text-xs text-neutral-400 font-sans">
              Piano Sifa · MwiTech · Ideazzy · Deep Web & Desktop Autonomous Intelligence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>AI Brain: DeepSeek v4 / Groq Ready</span>
          </span>
        </div>
      </div>

      {/* Grid of Power Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {hubSections.map((sec) => (
          <div
            key={sec.id}
            className={`flex flex-col justify-between p-3.5 rounded-xl bg-gradient-to-br ${sec.accent} border backdrop-blur-md transition-all hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <div>
                  <div className="text-xs sm:text-sm font-mono font-bold text-white">
                    {sec.title}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-sans">
                    {sec.subtitle}
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-neutral-300">
                  {sec.badge}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {sec.actions.map((act, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onExecutePrompt(act.prompt)}
                    className="w-full group flex items-center justify-between p-2 rounded-lg bg-black/40 hover:bg-black/80 border border-white/5 hover:border-cyan-500/40 text-left transition-all"
                  >
                    <div className="flex items-center gap-2 text-xs font-sans text-neutral-200 group-hover:text-cyan-300">
                      <Flame className="w-3.5 h-3.5 text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                      <span>{act.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
