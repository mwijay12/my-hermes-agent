/**
 * JarvisVoiceControls — Voice Intelligence controls for JARVIS / Noellyne.
 *
 * Features:
 * - Direct Click-to-Talk and Continuous Listening modes.
 * - Real-time volume visualizer & barge-in interrupt affordance.
 * - Speech synthesis voice selector.
 * - Safe from keyboard spacebar interception (never blocks typing in input boxes).
 */

import { Mic, MicOff, Radio, VolumeX } from "lucide-react";

interface JarvisVoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  isContinuous: boolean;
  volume: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: string | null;
  onVoiceChange: (voiceName: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleContinuous: () => void;
  onStopSpeaking: () => void;
  disabled?: boolean;
}

export function JarvisVoiceControls({
  isListening,
  isSpeaking,
  isContinuous,
  volume,
  availableVoices,
  selectedVoice,
  onVoiceChange,
  onStartListening,
  onStopListening,
  onToggleContinuous,
  onStopSpeaking,
  disabled = false,
}: JarvisVoiceControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-black/60 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)] w-full">
      {/* Left: Main Mic Button & Status */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={isListening ? onStopListening : onStartListening}
          className={`relative group flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            isListening
              ? "bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(0,255,170,0.6)] scale-105"
              : "bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/60 hover:border-cyan-400"
          }`}
          title={isListening ? "Click to stop listening" : "Click to speak with JARVIS"}
        >
          {isListening ? (
            <Mic className="w-5 h-5 animate-pulse" />
          ) : (
            <MicOff className="w-5 h-5 group-hover:text-cyan-300" />
          )}

          {/* Pulsing ring when active */}
          {isListening && (
            <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping pointer-events-none opacity-60" />
          )}
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              {isListening ? "Mic Listening..." : "Voice Input"}
            </span>
            {isContinuous && (
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[9px] font-mono uppercase animate-pulse">
                Live
              </span>
            )}
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">
            {isListening ? "Speak clearly into your mic" : "Click mic to speak"}
          </span>
        </div>
      </div>

      {/* Center: Live Volume Level Meter */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-cyan-500/20">
        <span className="text-[10px] font-mono text-cyan-400">MIC VOL</span>
        <div className="w-20 sm:w-28 h-2 bg-cyan-950 rounded-full overflow-hidden border border-cyan-800/50">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75 rounded-full"
            style={{ width: `${Math.min(100, Math.max(5, volume * 100))}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-cyan-300/70">{Math.round(volume * 100)}%</span>
      </div>

      {/* Right: Actions & Voice Selector */}
      <div className="flex items-center gap-2">
        {/* Barge-in Stop Speech button if assistant is speaking */}
        {isSpeaking && (
          <button
            type="button"
            onClick={onStopSpeaking}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono hover:bg-amber-500/30 transition-colors animate-pulse"
            title="Stop voice output"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Stop Audio</span>
          </button>
        )}

        {/* Continuous Voice Toggle */}
        <button
          type="button"
          onClick={onToggleContinuous}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
            isContinuous
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              : "bg-black/30 border-cyan-900/40 text-neutral-400 hover:text-cyan-300 hover:border-cyan-700/50"
          }`}
          title="Toggle hands-free conversation"
        >
          <Radio className={`w-3.5 h-3.5 ${isContinuous ? "text-cyan-400 animate-spin" : ""}`} />
          <span>{isContinuous ? "Hands-Free: ON" : "Hands-Free"}</span>
        </button>

        {/* Voice Selector */}
        {availableVoices.length > 0 && (
          <select
            value={selectedVoice || ""}
            onChange={(e) => onVoiceChange(e.target.value)}
            className="h-8 px-2 py-0 text-xs font-mono bg-black/60 text-cyan-300 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 max-w-[120px] truncate"
            title="Select speech voice"
          >
            {availableVoices.map((v) => (
              <option key={v.name} value={v.name} className="bg-neutral-900 text-white">
                {v.name.length > 18 ? `${v.name.slice(0, 16)}…` : v.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
