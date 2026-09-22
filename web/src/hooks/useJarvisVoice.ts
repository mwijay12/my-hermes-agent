/**
 * useJarvisVoice — Duplex Voice Intelligence Hook for Hermes / JARVIS.
 *
 * Provides:
 * 1. Real-time Speech-to-Text (STT) via Web Speech API with live transcript streaming.
 * 2. Real-time audio waveform / frequency analysis via Web Audio API (AnalyserNode).
 * 3. Text-to-Speech (TTS) natural audio playback with instant barge-in cancellation.
 * 4. Safe from keyboard spacebar interception (never blocks typing).
 * 5. Direct real-time callback to sync spoken words into the chat input field.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isContinuous: boolean;
  transcript: string;
  interimTranscript: string;
  volume: number; // 0 to 1
  wakeWordDetected: boolean;
  supported: boolean;
  selectedVoice: string | null;
  availableVoices: SpeechSynthesisVoice[];
  error: string | null;
}

interface UseJarvisVoiceOptions {
  onPromptSubmit?: (text: string) => void;
  onInterimText?: (text: string) => void;
  wakeWords?: string[];
}

// Default wake words tailored for Noellyne & JARVIS
const DEFAULT_WAKE_WORDS = [
  "hey noellyne",
  "noellyne",
  "hey jarvis",
  "jarvis",
  "mzee mwijay",
  "mzee",
  "hello noellyne",
  "habari noellyne",
];

export function useJarvisVoice({
  onPromptSubmit,
  onInterimText,
  wakeWords = DEFAULT_WAKE_WORDS,
}: UseJarvisVoiceOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [supported, setSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Web Speech & Web Audio refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isSpeakingRef = useRef(false);
  const isContinuousRef = useRef(false);

  isSpeakingRef.current = isSpeaking;
  isContinuousRef.current = isContinuous;

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      if (!selectedVoice && voices.length > 0) {
        // Look for premium natural English voices
        const preferred =
          voices.find((v) => v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural")) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        setSelectedVoice(preferred?.name || voices[0].name);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoice]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Audio Analyser for reactive waveform and volume
  const initAudioAnalyser = useCallback(async () => {
    try {
      if (audioContextRef.current && audioContextRef.current.state === "running") {
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 128);
        setVolume(normalized);

        // Barge-in: If agent is speaking and user speaks loudly, interrupt agent
        if (isSpeakingRef.current && normalized > 0.35) {
          stopSpeaking();
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err: any) {
      console.warn("Microphone audio analyser initialization:", err);
    }
  }, [stopSpeaking]);

  const stopAudioAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setVolume(0);
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Web Speech Recognition is not supported by your browser. Please use Chrome, Edge, or Brave.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
      initAudioAnalyser();
    };

    rec.onresult = (event: any) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalStr += text;
        } else {
          interimStr += text;
        }
      }

      const activeInterim = interimStr.trim();
      setInterimTranscript(activeInterim);
      if (activeInterim && onInterimText) {
        onInterimText(activeInterim);
      }

      const fullText = (finalStr || interimStr).trim().toLowerCase();

      // Check Wake Word
      const matchedWakeWord = wakeWords.some((w) => fullText.includes(w.toLowerCase()));
      if (matchedWakeWord) {
        setWakeWordDetected(true);
      }

      if (finalStr.trim()) {
        const cleaned = finalStr.trim();
        setTranscript(cleaned);
        setInterimTranscript("");

        if (onInterimText) {
          onInterimText(cleaned);
        }

        // If continuous mode or wake word was triggered
        if (onPromptSubmit && isContinuousRef.current) {
          let prompt = cleaned;
          for (const w of wakeWords) {
            const regex = new RegExp(`^${w}[,\\s]*`, "i");
            prompt = prompt.replace(regex, "");
          }
          if (prompt.trim()) {
            onPromptSubmit(prompt.trim());
          }
        }
      }
    };

    rec.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        setError(`Speech recognition notice: ${event.error}`);
      }
    };

    rec.onend = () => {
      if (isContinuousRef.current) {
        try {
          rec.start();
        } catch {
          setIsListening(false);
          stopAudioAnalyser();
        }
      } else {
        setIsListening(false);
        stopAudioAnalyser();
      }
    };

    recognitionRef.current = rec;

    return () => {
      try {
        rec.abort();
      } catch {}
      stopAudioAnalyser();
    };
  }, [initAudioAnalyser, onInterimText, onPromptSubmit, stopAudioAnalyser, wakeWords]);

  // Voice Controls
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      stopSpeaking();
      recognitionRef.current.start();
      setIsListening(true);
    } catch (e) {
      console.warn("Speech recognition start:", e);
    }
  }, [stopSpeaking]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setIsContinuous(false);
      recognitionRef.current.stop();
      setIsListening(false);
      stopAudioAnalyser();
    } catch {}
  }, [stopAudioAnalyser]);

  const toggleContinuous = useCallback(() => {
    setIsContinuous((prev) => {
      const next = !prev;
      if (next) {
        startListening();
      } else {
        stopListening();
      }
      return next;
    });
  }, [startListening, stopListening]);

  // Text-To-Speech (Speech Synthesis)
  const speak = useCallback(
    (text: string, voiceName?: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
        return;
      }

      window.speechSynthesis.cancel();

      // Clean markdown tags for natural speech
      const cleaned = text
        .replace(/```[\s\S]*?```/g, "Code block.")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
        .replace(/[*_#~]/g, "")
        .trim();

      if (!cleaned) return;

      const utterance = new SpeechSynthesisUtterance(cleaned);
      const voice = availableVoices.find((v) => v.name === (voiceName || selectedVoice));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [availableVoices, selectedVoice]
  );

  return {
    isListening,
    isSpeaking,
    isContinuous,
    transcript,
    interimTranscript,
    volume,
    wakeWordDetected,
    supported,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
    error,
    startListening,
    stopListening,
    toggleContinuous,
    speak,
    stopSpeaking,
    analyser: analyserRef.current,
  };
}
