/**
 * JarvisPage — The Next-Gen Multimodal JARVIS Command Center for Hermes & Mzee Mwijay.
 *
 * Master layout combining:
 * - Holographic 3D Arc Reactor Core & Frequency Waveforms
 * - Duplex Voice Intelligence (STT, TTS, Barge-in, Voice-to-Text)
 * - Multimodal Vision (Webcam HUD, Screen Sharing, Snapshots)
 * - Persistent Memory Matrix & Persona Switcher
 * - Conversational Feed & Tool Activity Cards
 * - Responsive Layout for all screen sizes
 */

import { useState, useCallback, useEffect } from "react";
import {
  Sparkles,
  Terminal,
  Activity,
  Maximize2,
  Minimize2,
  Volume2,
  Tv,
  MessageSquare,
  Cpu,
} from "lucide-react";

import { useJarvisVoice } from "../hooks/useJarvisVoice";
import { useJarvisVision } from "../hooks/useJarvisVision";
import { useJarvisGateway } from "../hooks/useJarvisGateway";
import { usePageHeader } from "../contexts/usePageHeader";

import { JarvisArcReactor, type JarvisCoreState } from "../components/jarvis/JarvisArcReactor";
import { JarvisAudioWaveform } from "../components/jarvis/JarvisAudioWaveform";
import { JarvisVoiceControls } from "../components/jarvis/JarvisVoiceControls";
import { JarvisVisionFeed } from "../components/jarvis/JarvisVisionFeed";
import { JarvisMemoryMatrix } from "../components/jarvis/JarvisMemoryMatrix";
import { JarvisToolCards } from "../components/jarvis/JarvisToolCards";
import { JarvisChatFeed } from "../components/jarvis/JarvisChatFeed";
import { JarvisTerminalDrawer } from "../components/jarvis/JarvisTerminalDrawer";
import { JarvisPersonalHub } from "../components/jarvis/JarvisPersonalHub";

export default function JarvisPage() {
  const { setTitle } = usePageHeader();

  // Layout & View State
  const [activeTab, setActiveTab] = useState<"hud" | "chat" | "matrix" | "studio">("hud");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Gateway Connection
  const {
    connectionState,
    messages,
    isGenerating,
    activeTool,
    persona,
    setPersona,
    submitPrompt,
    clearChat,
  } = useJarvisGateway();

  // Vision Engine
  const vision = useJarvisVision();

  // Voice Engine
  const voice = useJarvisVoice({
    onPromptSubmit: (spokenText) => {
      if (spokenText.trim()) {
        submitPrompt(spokenText.trim());
      }
    },
  });

  // Keep Page Header updated
  useEffect(() => {
    setTitle("JARVIS Command Center 💎");
  }, [setTitle]);

  // Voice playback of latest assistant response
  const handleSpeakResponse = useCallback(
    (text: string) => {
      voice.speak(text);
    },
    [voice]
  );

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Determine current Arc Reactor state
  const reactorState: JarvisCoreState = isGenerating
    ? "thinking"
    : voice.isListening
    ? "listening"
    : voice.isSpeaking
    ? "speaking"
    : activeTool
    ? "executing"
    : "idle";

  const isConnected = connectionState === "open";

  return (
    <div className="relative flex flex-col h-full w-full bg-gradient-to-b from-neutral-950 via-[#030b14] to-black text-white font-sans overflow-hidden">
      {/* Top HUD Status & Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-cyan-500/20 bg-black/60 backdrop-blur-xl shrink-0 z-30">
        {/* Left: Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-wider text-cyan-300">
                  JARVIS
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  v3.0 HUD
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                Noellyne 💎 • David Erick Mwijage
              </span>
            </div>
          </div>

          {/* Connection Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-cyan-500/30 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className={isConnected ? "text-emerald-300" : "text-amber-300"}>
              {isConnected ? "Gateway Online" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Center: Mode & Tab Switcher */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-cyan-500/20">
          <button
            type="button"
            onClick={() => setActiveTab("hud")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              activeTab === "hud"
                ? "bg-cyan-500/30 border border-cyan-400 text-cyan-200"
                : "text-neutral-400 hover:text-cyan-300"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>HUD & Reactor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
              activeTab === "studio"
                ? "bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.2)] font-bold"
                : "text-neutral-400 hover:text-amber-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>👑 Mwijay Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all xl:hidden ${
              activeTab === "chat"
                ? "bg-cyan-500/30 border border-cyan-400 text-cyan-200"
                : "text-neutral-400 hover:text-cyan-300"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all xl:hidden ${
              activeTab === "matrix"
                ? "bg-cyan-500/30 border border-cyan-400 text-cyan-200"
                : "text-neutral-400 hover:text-cyan-300"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Matrix</span>
          </button>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Activity Indicator */}
          {voice.isSpeaking && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono animate-pulse">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Active</span>
            </div>
          )}

          {/* Terminal Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsTerminalOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              isTerminalOpen
                ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                : "bg-cyan-950/40 border-cyan-500/30 text-cyan-300 hover:border-cyan-400"
            }`}
            title="Open CLI Terminal Drawer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CLI Console</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-black/40 border border-cyan-500/30 text-neutral-400 hover:text-cyan-300 transition-colors"
            title="Toggle Fullscreen HUD"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 min-h-0 w-full p-3 sm:p-4 overflow-hidden">
        {activeTab === "studio" ? (
          <div className="h-full flex flex-col min-h-0 overflow-y-auto pr-1">
            <JarvisPersonalHub
              onExecutePrompt={(prompt) => {
                submitPrompt(prompt);
                setActiveTab("chat");
              }}
            />
          </div>
        ) : (
          <>
            {/* Desktop 3-Column Layout */}
            <div className="hidden xl:grid grid-cols-12 gap-4 h-full">
              {/* Column 1: Arc Reactor, Waveform & Voice Controls (4 cols) */}
              <section className="col-span-4 flex flex-col gap-3 min-h-0 h-full overflow-y-auto pr-1">
                {/* 3D Arc Reactor Core */}
                <div className="h-64 sm:h-72 w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.15)] relative flex items-center justify-center">
                  <JarvisArcReactor
                    state={reactorState}
                    volume={voice.volume}
                    size={260}
                  />
                </div>

                {/* Audio Waveform Visualizer */}
                <div className="rounded-xl overflow-hidden border border-cyan-500/20 bg-black/40">
                  <JarvisAudioWaveform
                    analyser={voice.analyser}
                    isActive={voice.isListening || voice.isSpeaking}
                    isSpeaking={voice.isSpeaking}
                    height={70}
                  />
                </div>

                {/* Voice Controls */}
                <JarvisVoiceControls
                  isListening={voice.isListening}
                  isSpeaking={voice.isSpeaking}
                  isContinuous={voice.isContinuous}
                  volume={voice.volume}
                  availableVoices={voice.availableVoices}
                  selectedVoice={voice.selectedVoice}
                  onVoiceChange={voice.setSelectedVoice}
                  onStartListening={voice.startListening}
                  onStopListening={voice.stopListening}
                  onToggleContinuous={voice.toggleContinuous}
                  onStopSpeaking={voice.stopSpeaking}
                />

                {/* Memory Matrix & Soul Switcher */}
                <div className="flex-1 min-h-[220px]">
                  <JarvisMemoryMatrix
                    currentPersona={persona}
                    onPersonaChange={setPersona}
                  />
                </div>
              </section>

              {/* Column 2: Conversational Neural Chat Stream (5 cols) */}
              <section className="col-span-5 flex flex-col min-h-0 h-full">
                <JarvisChatFeed
                  messages={messages}
                  isGenerating={isGenerating}
                  onSendMessage={(text) => submitPrompt(text)}
                  onSpeakMessage={handleSpeakResponse}
                  isSpeaking={voice.isSpeaking}
                  onStopSpeaking={voice.stopSpeaking}
                  isListening={voice.isListening}
                  interimTranscript={voice.interimTranscript}
                  onStartListening={voice.startListening}
                  onStopListening={voice.stopListening}
                  onResetSession={clearChat}
                />
              </section>

              {/* Column 3: Vision Matrix & Tool Activity Stream (3 cols) */}
              <section className="col-span-3 flex flex-col gap-3 min-h-0 h-full overflow-y-auto pl-1">
                {/* Vision Feed (Camera & Screen Share) */}
                <div className="flex-1 min-h-[300px]">
                  <JarvisVisionFeed
                    isCameraActive={vision.isCameraActive}
                    isScreenActive={vision.isScreenActive}
                    streamSource={vision.streamSource}
                    capturedImages={vision.capturedImages}
                    videoRef={vision.videoRef}
                    onStartCamera={vision.startCamera}
                    onStartScreenShare={vision.startScreenShare}
                    onStopStream={vision.stopStream}
                    onCaptureSnapshot={vision.captureSnapshot}
                    onAddImageFile={vision.addImageFile}
                    onRemoveCapturedImage={vision.removeCapturedImage}
                    onClearImages={vision.clearImages}
                    onSendVisionPrompt={(promptText, img) => {
                      submitPrompt(
                        promptText || "Analyze this image and explain what you see in detail.",
                        [img.dataUrl]
                      );
                    }}
                  />
                </div>

                {/* Live Tool Execution Telemetry */}
                <div className="flex-1 min-h-[240px]">
                  <JarvisToolCards currentTool={activeTool} />
                </div>
              </section>
            </div>

            {/* Responsive Mobile / Tablet View (Tabbed) */}
            <div className="xl:hidden h-full flex flex-col min-h-0">
              {activeTab === "hud" && (
                <div className="flex flex-col gap-3 h-full overflow-y-auto">
                  <div className="h-60 w-full rounded-2xl overflow-hidden border border-cyan-500/30 bg-black/40 relative shrink-0 flex items-center justify-center">
                    <JarvisArcReactor
                      state={reactorState}
                      volume={voice.volume}
                      size={240}
                    />
                  </div>

                  <div className="rounded-xl overflow-hidden border border-cyan-500/20 bg-black/40 shrink-0">
                    <JarvisAudioWaveform
                      analyser={voice.analyser}
                      isActive={voice.isListening || voice.isSpeaking}
                      isSpeaking={voice.isSpeaking}
                      height={60}
                    />
                  </div>

                  <JarvisVoiceControls
                    isListening={voice.isListening}
                    isSpeaking={voice.isSpeaking}
                    isContinuous={voice.isContinuous}
                    volume={voice.volume}
                    availableVoices={voice.availableVoices}
                    selectedVoice={voice.selectedVoice}
                    onVoiceChange={voice.setSelectedVoice}
                    onStartListening={voice.startListening}
                    onStopListening={voice.stopListening}
                    onToggleContinuous={voice.toggleContinuous}
                    onStopSpeaking={voice.stopSpeaking}
                  />

                  <div className="min-h-[300px]">
                    <JarvisVisionFeed
                      isCameraActive={vision.isCameraActive}
                      isScreenActive={vision.isScreenActive}
                      streamSource={vision.streamSource}
                      capturedImages={vision.capturedImages}
                      videoRef={vision.videoRef}
                      onStartCamera={vision.startCamera}
                      onStartScreenShare={vision.startScreenShare}
                      onStopStream={vision.stopStream}
                      onCaptureSnapshot={vision.captureSnapshot}
                      onAddImageFile={vision.addImageFile}
                      onRemoveCapturedImage={vision.removeCapturedImage}
                      onClearImages={vision.clearImages}
                      onSendVisionPrompt={(promptText, img) => {
                        submitPrompt(
                          promptText || "Analyze this image and explain what you see in detail.",
                          [img.dataUrl]
                        );
                      }}
                    />
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div className="h-full flex flex-col min-h-0">
                  <JarvisChatFeed
                    messages={messages}
                    isGenerating={isGenerating}
                    onSendMessage={(text) => submitPrompt(text)}
                    onSpeakMessage={handleSpeakResponse}
                    isSpeaking={voice.isSpeaking}
                    onStopSpeaking={voice.stopSpeaking}
                    isListening={voice.isListening}
                    interimTranscript={voice.interimTranscript}
                    onStartListening={voice.startListening}
                    onStopListening={voice.stopListening}
                    onResetSession={clearChat}
                  />
                </div>
              )}

              {activeTab === "matrix" && (
                <div className="flex flex-col gap-3 h-full overflow-y-auto">
                  <JarvisMemoryMatrix
                    currentPersona={persona}
                    onPersonaChange={setPersona}
                  />
                  <JarvisToolCards currentTool={activeTool} />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Slide-out Terminal Drawer (xterm.js) */}
      <JarvisTerminalDrawer
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />

      {/* Bottom Status Bar */}
      <footer className="flex items-center justify-between px-4 py-1.5 border-t border-cyan-500/20 bg-black/80 text-[10px] font-mono text-neutral-400 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-cyan-400">
            <Activity className="w-3 h-3 animate-pulse" />
            STARK ARCHITECTURE v3
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">MODE: {persona.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-2">
          <span>LATENCY: ~12ms</span>
          <span>•</span>
          <span className="text-emerald-400">SECURE DUPLEX</span>
        </div>
      </footer>
    </div>
  );
}
