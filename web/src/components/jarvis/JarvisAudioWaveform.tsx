/**
 * JarvisAudioWaveform — Real-time Web Audio API frequency visualizer.
 *
 * Renders glowing audio spectrum bars and oscillating sine wave harmonics
 * reflecting live microphone input or synthesized speech playback.
 */

import { useEffect, useRef } from "react";

interface JarvisAudioWaveformProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  isSpeaking?: boolean;
  height?: number;
  width?: number;
  className?: string;
}

export function JarvisAudioWaveform({
  analyser,
  isActive,
  isSpeaking = false,
  height = 64,
  width = 320,
  className = "",
}: JarvisAudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const barCount = 32;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let dataArray: Uint8Array<ArrayBuffer> | null = null;
      if (analyser && isActive) {
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
      }

      phase += 0.05;

      const barWidth = (width / barCount) * 0.7;
      const barGap = (width / barCount) * 0.3;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 4; // minimum height

        if (dataArray && isActive) {
          const dataIndex = Math.floor((i / barCount) * dataArray.length * 0.6);
          const rawVal = dataArray[dataIndex] || 0;
          barHeight = Math.max(4, (rawVal / 255) * (height - 8));
        } else if (isSpeaking) {
          // Simulated smooth waveform when assistant is speaking
          const sine = Math.sin(phase + i * 0.3);
          barHeight = Math.max(4, Math.abs(sine) * (height * 0.75) + 6);
        } else if (isActive) {
          // Ambient idle breathing wave
          const sine = Math.sin(phase + i * 0.2);
          barHeight = Math.max(3, Math.abs(sine) * 12 + 4);
        }

        const x = i * (barWidth + barGap) + barGap / 2;
        const y = (height - barHeight) / 2;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isSpeaking) {
          grad.addColorStop(0, "rgba(255, 200, 50, 0.9)"); // Gold
          grad.addColorStop(0.5, "rgba(0, 240, 255, 0.9)"); // Cyan
          grad.addColorStop(1, "rgba(0, 150, 255, 0.6)");
        } else if (isActive) {
          grad.addColorStop(0, "rgba(0, 255, 170, 0.9)"); // Emerald
          grad.addColorStop(0.5, "rgba(0, 240, 255, 0.8)"); // Cyan
          grad.addColorStop(1, "rgba(0, 100, 200, 0.4)");
        } else {
          grad.addColorStop(0, "rgba(0, 240, 255, 0.3)");
          grad.addColorStop(1, "rgba(0, 100, 180, 0.1)");
        }

        ctx.fillStyle = grad;
        ctx.shadowBlur = isActive || isSpeaking ? 8 : 0;
        ctx.shadowColor = isSpeaking ? "rgba(255, 200, 50, 0.8)" : "rgba(0, 240, 255, 0.8)";

        // Rounded pill bars
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [radius]);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [analyser, height, isActive, isSpeaking, width]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full max-w-full rounded-lg bg-black/40 border border-cyan-500/20 backdrop-blur-sm p-1"
      />
    </div>
  );
}
