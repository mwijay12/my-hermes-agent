/**
 * JarvisArcReactor — 3D/Canvas Holographic Arc Reactor & Neural Core.
 *
 * Renders an animated, multi-layered Iron Man Arc Reactor with:
 * - Rotating energy rings and segmented torque coils
 * - Pulsing core flare with particle emissions
 * - Real-time state modulation:
 *   • 'idle': Smooth cyan/gold breathing glow
 *   • 'listening': Reactive pulse responding to voice decibels
 *   • 'thinking': Rapid spinning neural rings with blue/violet turbulence
 *   • 'speaking': Resonant acoustic ripples matching TTS
 *   • 'executing': High-intensity amber/gold energy surge
 */

import { useEffect, useRef } from "react";

export type JarvisCoreState = "idle" | "listening" | "thinking" | "speaking" | "executing";

interface JarvisArcReactorProps {
  state?: JarvisCoreState;
  volume?: number; // 0 to 1
  size?: number; // width & height in px
  onClick?: () => void;
  className?: string;
}

export function JarvisArcReactor({
  state = "idle",
  volume = 0,
  size = 280,
  onClick,
  className = "",
}: JarvisArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rotationAngle = 0;
    let pulseAngle = 0;
    const particles: { x: number; y: number; angle: number; dist: number; speed: number; size: number; alpha: number }[] = [];

    // Initialize ambient particles
    for (let i = 0; i < 48; i++) {
      particles.push({
        x: 0,
        y: 0,
        angle: Math.random() * Math.PI * 2,
        dist: 20 + Math.random() * (size / 2 - 30),
        speed: 0.005 + Math.random() * 0.015,
        size: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.7,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // Color paletting based on state
      let primaryColor = "rgba(0, 240, 255, "; // Stark Cyan
      let secondaryColor = "rgba(0, 140, 255, "; // Deep Blue
      let coreColor = "rgba(200, 250, 255, "; // Pure White-Cyan
      let speedMultiplier = 1;

      if (state === "listening") {
        primaryColor = "rgba(0, 255, 170, "; // Neon Emerald
        secondaryColor = "rgba(0, 200, 130, ";
        speedMultiplier = 1.8 + volume * 2.5;
      } else if (state === "thinking") {
        primaryColor = "rgba(160, 80, 255, "; // Cyber Violet
        secondaryColor = "rgba(90, 40, 255, ";
        coreColor = "rgba(240, 200, 255, ";
        speedMultiplier = 2.8;
      } else if (state === "speaking") {
        primaryColor = "rgba(0, 220, 255, "; // Electric Blue
        secondaryColor = "rgba(255, 200, 50, "; // Gold Sparks
        speedMultiplier = 1.5;
      } else if (state === "executing") {
        primaryColor = "rgba(255, 170, 0, "; // Amber Gold
        secondaryColor = "rgba(255, 60, 0, "; // Plasma
        coreColor = "rgba(255, 240, 200, ";
        speedMultiplier = 3.2;
      }

      rotationAngle += 0.015 * speedMultiplier;
      pulseAngle += 0.03 * speedMultiplier;

      const dynamicRadiusBoost = state === "listening" ? volume * 20 : Math.sin(pulseAngle) * 4;

      // 1. Ambient Outer Halo Glow
      const haloGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, size / 2);
      haloGrad.addColorStop(0, primaryColor + (0.15 + (state === "listening" ? volume * 0.2 : 0.05)) + ")");
      haloGrad.addColorStop(0.6, secondaryColor + "0.08)");
      haloGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haloGrad;
      ctx.fillRect(0, 0, size, size);

      // 2. Rotating Particles
      particles.forEach((p) => {
        p.angle += p.speed * speedMultiplier;
        const px = cx + Math.cos(p.angle) * (p.dist + dynamicRadiusBoost * 0.5);
        const py = cy + Math.sin(p.angle) * (p.dist + dynamicRadiusBoost * 0.5);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor + p.alpha + ")";
        ctx.shadowBlur = 8;
        ctx.shadowColor = primaryColor + "1)";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Outer Cybernetic Ring (Segmented)
      const outerR = size * 0.42;
      ctx.lineWidth = 2;
      ctx.strokeStyle = primaryColor + "0.4)";
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.stroke();

      const segments = 12;
      for (let i = 0; i < segments; i++) {
        const segAngle = rotationAngle + (i * Math.PI * 2) / segments;
        const startX = cx + Math.cos(segAngle) * (outerR - 6);
        const startY = cy + Math.sin(segAngle) * (outerR - 6);
        const endX = cx + Math.cos(segAngle) * (outerR + 4);
        const endY = cy + Math.sin(segAngle) * (outerR + 4);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = primaryColor + (i % 2 === 0 ? "0.9)" : "0.5)");
        ctx.lineWidth = i % 2 === 0 ? 3 : 1.5;
        ctx.stroke();
      }

      // 4. Middle Arc Reactor Coils (Spinning in reverse)
      const midR = size * 0.32;
      const coilCount = 10;
      for (let i = 0; i < coilCount; i++) {
        const coilAngle = -rotationAngle * 1.4 + (i * Math.PI * 2) / coilCount;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(coilAngle);

        ctx.fillStyle = secondaryColor + "0.6)";
        ctx.shadowBlur = 10;
        ctx.shadowColor = primaryColor + "0.8)";
        ctx.fillRect(midR - 8, -4, 16, 8);

        ctx.strokeStyle = primaryColor + "1)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(midR - 8, -4, 16, 8);
        ctx.restore();
      }

      // 5. Inner Core Ring & Energy Spokes
      const innerR = size * 0.18 + (state === "listening" ? volume * 8 : Math.sin(pulseAngle * 1.5) * 3);
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.strokeStyle = primaryColor + "0.85)";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = primaryColor + "1)";
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Triangular Arc Reactor Inner Reticle
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotationAngle * 0.6);
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const triAngle = (i * Math.PI * 2) / 3 - Math.PI / 2;
        const tx = Math.cos(triAngle) * (innerR * 0.85);
        const ty = Math.sin(triAngle) * (innerR * 0.85);
        if (i === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.strokeStyle = coreColor + "0.95)";
      ctx.lineWidth = 2;
      ctx.shadowBlur = 12;
      ctx.shadowColor = coreColor + "1)";
      ctx.stroke();
      ctx.restore();

      // 6. Central Arc Energy Core
      const coreR = size * 0.09 + (state === "listening" ? volume * 6 : Math.sin(pulseAngle * 2) * 2);
      const coreGrad = ctx.createRadialGradient(cx, cy, 1, cx, cy, coreR);
      coreGrad.addColorStop(0, coreColor + "1)");
      coreGrad.addColorStop(0.5, primaryColor + "0.9)");
      coreGrad.addColorStop(1, primaryColor + "0)");

      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.shadowBlur = 24;
      ctx.shadowColor = primaryColor + "1)";
      ctx.fill();
      ctx.shadowBlur = 0;

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [size, state, volume]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none group transition-transform duration-300 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      title={`JARVIS Arc Reactor — Current State: ${state.toUpperCase()}`}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full rounded-full drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]"
      />

      {/* Cybernetic HUD Crosshair Rings */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/20 pointer-events-none group-hover:border-cyan-400/50 transition-colors animate-pulse" />
      <div className="absolute -inset-2 rounded-full border border-dashed border-cyan-500/15 pointer-events-none group-hover:border-cyan-400/30 transition-colors" />

      {/* Center State Label Indicator */}
      <div className="absolute -bottom-6 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-black/70 border border-cyan-500/40 text-[10px] uppercase font-mono tracking-widest text-cyan-300 backdrop-blur-md shadow-[0_0_10px_rgba(0,240,255,0.2)]">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            state === "listening"
              ? "bg-emerald-400 animate-ping"
              : state === "thinking"
              ? "bg-purple-400 animate-spin"
              : state === "speaking"
              ? "bg-cyan-400 animate-pulse"
              : state === "executing"
              ? "bg-amber-400 animate-bounce"
              : "bg-cyan-500"
          }`}
        />
        {state}
      </div>
    </div>
  );
}
