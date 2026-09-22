/**
 * JarvisChatFeed — Conversational feed & high-performance input bar for JARVIS / Noellyne.
 *
 * Features:
 * - Ultra-responsive text input (never locks typing, handles Enter to send).
 * - Integrated Mic button right in the input bar for instant voice-to-text dictation.
 * - Live interim speech preview banner with instant Send.
 * - Markdown rendering with syntax highlighting, code copying, and TTS playback.
 * - Quick prompt chips & signature Mzee reactions.
 */

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Mic,
  MicOff,
} from "lucide-react";
import type { ChatMessage } from "../../hooks/useJarvisGateway";

interface JarvisChatFeedProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onSendMessage: (text: string) => void;
  onSpeakMessage: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  // Voice integration props
  isListening?: boolean;
  interimTranscript?: string;
  onStartListening?: () => void;
  onStopListening?: () => void;
  onResetSession?: () => void;
}

const QUICK_PROMPTS = [
  "Search GitHub for top AI agent architectures 🚀",
  "Analyze current workspace status & errors 🔍",
  "Brainstorm Gospel Amapiano track concept 🎹",
  "Summarize key system prompt leak takeaways 💎",
];

const SIGNATURE_REACTIONS = ["🔥", "💎", "😂", "🚀", "✝️", "💀"];

export function JarvisChatFeed({
  messages,
  isGenerating,
  onSendMessage,
  onSpeakMessage,
  isSpeaking,
  onStopSpeaking,
  isListening = false,
  interimTranscript = "",
  onStartListening,
  onStopListening,
  onResetSession,
}: JarvisChatFeedProps) {
  const [inputText, setInputText] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [messageReactions, setMessageReactions] = useState<{ [id: string]: string[] }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, interimTranscript]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed && !interimTranscript.trim()) return;

    const payload = trimmed || interimTranscript.trim();
    onSendMessage(payload);
    setInputText("");

    if (isListening && onStopListening) {
      onStopListening();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessageReactions((prev) => {
      const existing = prev[messageId] || [];
      if (existing.includes(emoji)) {
        return { ...prev, [messageId]: existing.filter((e) => e !== emoji) };
      }
      return { ...prev, [messageId]: [...existing, emoji] };
    });
  };

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-2xl border border-cyan-500/30 backdrop-blur-xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20 bg-cyan-950/20">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
              JARVIS Neural Stream
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[10px] text-neutral-400 font-mono">
                {isGenerating ? "Reasoning & generating..." : "Live & Ready"}
              </span>
            </div>
          </div>
        </div>

        {onResetSession && (
          <button
            type="button"
            onClick={onResetSession}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 border border-cyan-500/20 text-neutral-400 hover:text-cyan-300 hover:border-cyan-500/50 text-[11px] font-mono transition-colors"
            title="Reset conversation stream"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 font-sans">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
              <Bot className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white font-mono">JARVIS Multimodal Online 💎</h4>
              <p className="text-xs text-neutral-400 max-w-sm">
                Speak directly with the mic, type in simple English, or pick a quick prompt below to start.
              </p>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-mono transition-all text-left hover:scale-[1.02]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isAssistant = msg.role === "assistant";
            const reactions = messageReactions[msg.id] || [];

            return (
              <div
                key={msg.id || idx}
                className={`flex gap-3 group ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                {/* Assistant Avatar */}
                {isAssistant && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-900 to-cyan-600 border border-cyan-400/50 flex items-center justify-center text-white shrink-0 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`flex flex-col max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                    isAssistant
                      ? "bg-neutral-900/90 border border-cyan-500/30 text-neutral-100 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                      : "bg-gradient-to-r from-cyan-950 to-cyan-900/90 border border-cyan-400/50 text-cyan-50 shadow-[0_4px_20px_rgba(0,240,255,0.15)]"
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
                    <span className="font-bold text-cyan-400">
                      {isAssistant ? "NOELLYNE 💎" : "DAVID (MZEE) 🔥"}
                    </span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Content */}
                  <FormattedMessage text={msg.content} />

                  {/* Assistant Actions Bar */}
                  {isAssistant && (
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                      {/* Left: Speak / Copy */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isSpeaking) {
                              onStopSpeaking();
                            } else {
                              onSpeakMessage(msg.content);
                            }
                          }}
                          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 transition-colors"
                          title="Read message aloud"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                          <span className="font-mono text-[10px]">
                            {isSpeaking ? "Stop" : "Listen"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="font-mono text-[10px]">
                            {copiedIndex === idx ? "Copied" : "Copy"}
                          </span>
                        </button>
                      </div>

                      {/* Right: Signature Reactions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {SIGNATURE_REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => addReaction(msg.id, emoji)}
                            className={`p-1 rounded hover:bg-white/10 text-xs transition-transform ${
                              reactions.includes(emoji) ? "scale-125 bg-cyan-500/20" : ""
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rendered Reaction Badges */}
                  {reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {reactions.map((r, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-xs"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isAssistant && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 border border-amber-300 flex items-center justify-center text-black font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(255,180,0,0.3)]">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live Generation Indicator */}
        {isGenerating && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-lg bg-cyan-900/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono text-cyan-300">
                JARVIS is synthesizing response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Live Voice Dictation Banner */}
      {isListening && (
        <div className="px-4 py-2 bg-emerald-950/60 border-t border-emerald-500/40 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-[11px] font-mono text-emerald-300 font-bold shrink-0">
              Hearing:
            </span>
            <span className="text-xs text-white truncate font-sans">
              {interimTranscript || "Listening for speech..."}
            </span>
          </div>
          {interimTranscript.trim() && (
            <button
              type="button"
              onClick={handleSend}
              className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-bold shrink-0 transition-colors"
            >
              Send Voice
            </button>
          )}
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-3 border-t border-cyan-500/20 bg-black/60">
        <div className="relative flex items-center gap-2">
          {/* Direct Mic Button inside Input Bar */}
          {onStartListening && onStopListening && (
            <button
              type="button"
              onClick={isListening ? onStopListening : onStartListening}
              className={`p-2.5 rounded-xl border transition-all duration-200 ${
                isListening
                  ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(0,255,170,0.6)] animate-pulse"
                  : "bg-cyan-950/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/60 hover:text-white"
              }`}
              title={isListening ? "Stop Voice Dictation" : "Dictate with Voice"}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          )}

          {/* Text Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Listening... (or type here directly)"
                : "Ask JARVIS / Noellyne anything (Press Enter to send)..."
            }
            className="flex-1 bg-black/80 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() && !interimTranscript.trim()}
            className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
            title="Send Message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FormattedMessage({ text }: { text: string }) {
  if (!text) return null;

  // Split code blocks from regular text
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs leading-relaxed break-words">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0]?.trim();
          const hasLang = Boolean(firstLine && !firstLine.includes(" ") && firstLine.length < 20);
          const lang = hasLang ? firstLine : "";
          const code = (hasLang ? lines.slice(1) : lines).join("\n");

          return (
            <div
              key={index}
              className="my-2 rounded-lg bg-black/90 border border-cyan-500/30 overflow-hidden font-mono text-[11px]"
            >
              {lang && (
                <div className="flex items-center justify-between px-3 py-1 bg-cyan-950/40 border-b border-cyan-500/20 text-[10px] text-cyan-400 font-bold uppercase">
                  <span>{lang}</span>
                </div>
              )}
              <pre className="p-3 overflow-x-auto text-neutral-200">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const lines = part.split("\n");
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Clean Header detection: ###, ##, #
              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={lIdx} className="font-bold text-cyan-300 pt-1 text-xs font-mono">
                    {parseInlineStyles(trimmed.slice(4))}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={lIdx} className="font-bold text-cyan-200 pt-1.5 pb-0.5 text-xs font-mono border-b border-cyan-500/20">
                    {parseInlineStyles(trimmed.slice(3))}
                  </h3>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={lIdx} className="font-bold text-white pt-2 pb-0.5 text-sm font-mono border-b border-cyan-400/30">
                    {parseInlineStyles(trimmed.slice(2))}
                  </h2>
                );
              }

              // Bullet points: - or *
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1">
                    <span className="text-cyan-400 font-bold">•</span>
                    <span>{parseInlineStyles(trimmed.slice(2))}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{parseInlineStyles(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function parseInlineStyles(line: string) {
  const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return tokens.map((tok, i) => {
    if (tok.startsWith("**") && tok.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-cyan-200">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    if (tok.startsWith("`") && tok.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded bg-black/60 border border-cyan-500/30 font-mono text-cyan-300 text-[11px]"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    return tok;
  });
}
