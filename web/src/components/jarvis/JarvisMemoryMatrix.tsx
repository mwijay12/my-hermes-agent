/**
 * JarvisMemoryMatrix — Persistent Persona & Memory Matrix for Noellyne / JARVIS.
 *
 * Integrates SOUL.md personality traits, active user facts, and mode switches:
 * - 💎 Noellyne Mode (Default AI Wingwoman & Co-builder for David Erick Mwijage)
 * - 🛡️ Stark JARVIS Mode (Tactical Iron Man AI assistant)
 * - 🎹 Piano Sifa Studio Mode (Gospel Amapiano & creative production wingwoman)
 * - 💻 MwiTech Engineer Mode (TypeScript, AI systems, full-stack automation)
 */

import { useState } from "react";
import {
  Brain,
  Diamond,
  Music,
  Shield,
  User,
  Wrench,
} from "lucide-react";

export interface PersonaMode {
  id: string;
  name: string;
  badge: string;
  icon: typeof Diamond;
  description: string;
  greeting: string;
  accentColor: string;
}

export const PERSONA_MODES: PersonaMode[] = [
  {
    id: "noellyne",
    name: "Noellyne 💎",
    badge: "Co-Builder & Wingwoman",
    icon: Diamond,
    description: "Built for David Erick Mwijage (Mzee Mwijay). Energetic, Swahili/English mix, creative partner.",
    greeting: "Mzee, tuko tayari! Twende kazi 💎🔥",
    accentColor: "from-cyan-500 to-blue-600",
  },
  {
    id: "jarvis",
    name: "Stark JARVIS 🛡️",
    badge: "Tactical Intelligence",
    icon: Shield,
    description: "Crisp, hyper-intelligent Iron Man assistant. Maximum precision, system oversight, and automation.",
    greeting: "Good day, Sir. All systems fully operational and ready for your command.",
    accentColor: "from-amber-500 to-red-600",
  },
  {
    id: "pianosifa",
    name: "Piano Sifa 🎹",
    badge: "Gospel Amapiano Studio",
    icon: Music,
    description: "Deep music production awareness, Tanzanian Gospel Amapiano rhythms, cinematic visual strategy.",
    greeting: "Mzee, twende studio mode! Mwamba, Kukuabudu Mungu vibes on deck 🎹🔥",
    accentColor: "from-purple-500 to-pink-600",
  },
  {
    id: "mwitech",
    name: "MwiTech Engineer 💻",
    badge: "Code & Systems Architect",
    icon: Wrench,
    description: "Laser-focused TypeScript, full-stack architecture, API design, and rapid automation.",
    greeting: "MwiTech mode engaged. Let's architect and ship clean code.",
    accentColor: "from-emerald-500 to-teal-600",
  },
];

interface JarvisMemoryMatrixProps {
  currentPersona: string;
  onPersonaChange: (personaId: string) => void;
  className?: string;
}

export function JarvisMemoryMatrix({
  currentPersona,
  onPersonaChange,
  className = "",
}: JarvisMemoryMatrixProps) {
  const [activeTab, setActiveTab] = useState<"personas" | "profile" | "memories">("personas");

  const activePersonaObj =
    PERSONA_MODES.find((p) => p.id === currentPersona) || PERSONA_MODES[0];

  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-xl bg-black/70 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)] ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
            Memory & Persona Matrix
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-black/60 border border-cyan-500/20 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab("personas")}
            className={`px-2 py-0.5 rounded ${
              activeTab === "personas"
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/40"
                : "text-muted-foreground hover:text-cyan-300"
            }`}
          >
            Modes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-2 py-0.5 rounded ${
              activeTab === "profile"
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/40"
                : "text-muted-foreground hover:text-cyan-300"
            }`}
          >
            Soul
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("memories")}
            className={`px-2 py-0.5 rounded ${
              activeTab === "memories"
                ? "bg-cyan-500/30 text-cyan-300 border border-cyan-400/40"
                : "text-muted-foreground hover:text-cyan-300"
            }`}
          >
            Memories
          </button>
        </div>
      </div>

      {/* 1. Persona Switcher Tab */}
      {activeTab === "personas" && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {PERSONA_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = mode.id === currentPersona;

              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onPersonaChange(mode.id)}
                  className={`flex flex-col items-start gap-1 p-2.5 rounded-lg border text-left transition-all duration-200 ${
                    isSelected
                      ? "bg-cyan-950/70 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)] scale-[1.02]"
                      : "bg-black/50 border-cyan-900/30 hover:border-cyan-700/60 hover:bg-black/80"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-200">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-cyan-400 animate-pulse" : "text-muted-foreground"}`} />
                      <span>{mode.name}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400/70">{mode.badge}</span>
                  <span className="text-[10px] text-neutral-400 line-clamp-2 leading-tight mt-0.5">
                    {mode.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Mode Banner */}
          <div className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/20 font-mono text-[11px] text-cyan-300">
            <span className="text-cyan-400/70 font-semibold">Active Greeting: </span>
            <span className="italic">"{activePersonaObj.greeting}"</span>
          </div>
        </div>
      )}

      {/* 2. User & Soul Profile Tab */}
      {activeTab === "profile" && (
        <div className="flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
            <User className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-bold text-cyan-200">David Erick Mwijage</div>
              <div className="text-[10px] text-cyan-400/80">"Mzee" / "Mwijay" | Dar es Salaam, TZ</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2 rounded bg-black/50 border border-cyan-900/30 flex flex-col gap-0.5">
              <span className="text-cyan-400/70">🎵 Signature Project:</span>
              <span className="text-neutral-200 font-semibold">Piano Sifa</span>
              <span className="text-neutral-400">Gospel Amapiano Movement</span>
            </div>
            <div className="p-2 rounded bg-black/50 border border-cyan-900/30 flex flex-col gap-0.5">
              <span className="text-cyan-400/70">💎 Creative Brand:</span>
              <span className="text-neutral-200 font-semibold">Ideazzy</span>
              <span className="text-neutral-400">Design, UI/UX & Tech</span>
            </div>
          </div>

          <div className="p-2 rounded bg-black/50 border border-cyan-900/30 text-[10px] text-neutral-300 leading-relaxed">
            <span className="text-cyan-400 font-semibold">Communication Style: </span>
            Energetic, collaborative, natural English + Swahili mix, direct when coding, warm when casual. Emojis: 😂🤣🔥💀😆💎
          </div>
        </div>
      )}

      {/* 3. Persistent Memory Stream Tab */}
      {activeTab === "memories" && (
        <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700 font-mono text-[10px]">
          <div className="p-2 rounded bg-black/50 border border-cyan-900/30 text-neutral-300">
            <span className="text-cyan-400 font-bold">🧠 Core Anchor: </span>
            David Erick Mwijage is turning ambitious AI visions into Tanzanian & global reality.
          </div>
          <div className="p-2 rounded bg-black/50 border border-cyan-900/30 text-neutral-300">
            <span className="text-cyan-400 font-bold">🎹 Musical Pillar: </span>
            Gospel Amapiano genre producer (Mwamba, Kukuabudu Mungu). Cinematic divine realism.
          </div>
          <div className="p-2 rounded bg-black/50 border border-cyan-900/30 text-neutral-300">
            <span className="text-cyan-400 font-bold">💻 Tech Stack: </span>
            TypeScript, Full-Stack AI systems, Mwijay Music App v1 & v2.
          </div>
        </div>
      )}
    </div>
  );
}
