/**
 * JarvisVisionFeed — Multimodal Vision HUD for JARVIS / Noellyne.
 *
 * Features:
 * - Live WebRTC Camera Stream with Iron Man / Cyberpunk targeting reticle & scanlines.
 * - Live Screen & Window Share viewer for real-time IDE / GitHub / browser inspection.
 * - Snapshot frame grabber sending instant visual frames to Hermes.
 * - Drag-and-drop & clipboard paste dropzone.
 * - Snapshot gallery with 1-click vision prompt actions.
 */

import React, { useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  Eye,
  Monitor,
  Trash2,
  Upload,
  Crosshair,
  X,
} from "lucide-react";
import type { CapturedImage } from "@/hooks/useJarvisVision";

interface JarvisVisionFeedProps {
  isCameraActive: boolean;
  isScreenActive: boolean;
  streamSource: "camera" | "screen" | null;
  capturedImages: CapturedImage[];
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStartCamera: () => void;
  onStartScreenShare: () => void;
  onStopStream: () => void;
  onCaptureSnapshot: () => CapturedImage | null;
  onAddImageFile: (file: File, source?: "upload" | "paste") => void;
  onRemoveCapturedImage: (id: string) => void;
  onClearImages: () => void;
  onSendVisionPrompt: (promptText: string, image: CapturedImage) => void;
  className?: string;
}

export function JarvisVisionFeed({
  isCameraActive,
  isScreenActive,
  streamSource,
  capturedImages,
  videoRef,
  onStartCamera,
  onStartScreenShare,
  onStopStream,
  onCaptureSnapshot,
  onAddImageFile,
  onRemoveCapturedImage,
  onClearImages,
  onSendVisionPrompt,
  className = "",
}: JarvisVisionFeedProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isStreamActive = isCameraActive || isScreenActive;

  // File drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (file.type.startsWith("image/")) {
          onAddImageFile(file, "upload");
        }
      }
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-xl bg-black/70 border border-cyan-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)] ${className}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Header Bar with Stream Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-cyan-300 uppercase">
            Multimodal Vision Matrix
          </h3>
          {isStreamActive && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono uppercase animate-pulse">
              {streamSource === "camera" ? "Webcam Online" : "Screen Feed"}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {!isStreamActive ? (
            <>
              <button
                type="button"
                onClick={onStartCamera}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono hover:bg-cyan-900/60 hover:border-cyan-400 transition-colors"
                title="Turn on live camera"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Webcam</span>
              </button>

              <button
                type="button"
                onClick={onStartScreenShare}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono hover:bg-cyan-900/60 hover:border-cyan-400 transition-colors"
                title="Share screen or browser tab"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Screen</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onCaptureSnapshot}
                className="flex items-center gap-1 px-3 py-1 rounded bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-mono text-xs font-semibold shadow-[0_0_12px_rgba(0,255,170,0.5)] hover:scale-105 transition-transform"
                title="Capture snapshot frame"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Capture Frame</span>
              </button>

              <button
                type="button"
                onClick={onStopStream}
                className="p-1 rounded bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-mono hover:bg-red-900/60 transition-colors"
                title="Stop video feed"
              >
                <CameraOff className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded bg-black/40 border border-cyan-500/20 text-cyan-400 text-xs hover:border-cyan-400 transition-colors"
            title="Upload image file"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onAddImageFile(e.target.files[0], "upload");
              }
            }}
          />
        </div>
      </div>

      {/* Main Video Screen / Drag Drop Zone */}
      <div
        className={`relative w-full aspect-video rounded-lg overflow-hidden border transition-all duration-300 flex items-center justify-center ${
          isDragOver
            ? "border-cyan-400 bg-cyan-950/40 scale-[1.01]"
            : "border-cyan-500/30 bg-black/80"
        }`}
      >
        {/* Hidden/Active Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${!isStreamActive ? "hidden" : ""}`}
        />

        {/* Stark HUD Scanlines & Crosshairs Overlay */}
        {isStreamActive && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px]" />
            {/* Corner Brackets */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
            {/* Center Target Reticle */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <div className="w-16 h-16 rounded-full border border-dashed border-cyan-400 animate-spin" />
              <Crosshair className="absolute w-6 h-6 text-cyan-300" />
            </div>
            {/* Telemetry Tag */}
            <div className="absolute bottom-2 left-3 font-mono text-[9px] text-cyan-300 bg-black/70 px-1.5 py-0.5 rounded border border-cyan-500/30">
              FPS: 30 | RES: 1280x720 | MULTIMODAL ACTIVE
            </div>
          </div>
        )}

        {/* Empty State when no camera is active */}
        {!isStreamActive && (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground select-none">
            <Eye className="w-10 h-10 text-cyan-500/40 animate-pulse" />
            <span className="text-xs font-mono text-cyan-300/80">
              Vision Feed Standby
            </span>
            <span className="text-[10px] text-neutral-400 max-w-[240px]">
              Turn on Webcam, Share Screen, or drop images here to inspect with JARVIS.
            </span>
          </div>
        )}
      </div>

      {/* Captured Snapshots Ribbon */}
      {capturedImages.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
            <span>CAPTURED FRAMES ({capturedImages.length})</span>
            <button
              type="button"
              onClick={onClearImages}
              className="text-red-400 hover:underline flex items-center gap-0.5"
            >
              <Trash2 className="w-2.5 h-2.5" />
              Clear
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-cyan-700">
            {capturedImages.map((img) => (
              <div
                key={img.id}
                className="relative group shrink-0 w-24 h-16 rounded-md overflow-hidden border border-cyan-500/40 bg-black"
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with Quick Analyze Actions */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                  <button
                    type="button"
                    onClick={() =>
                      onSendVisionPrompt(
                        "Describe what you see in this snapshot in detail.",
                        img
                      )
                    }
                    className="px-1.5 py-0.5 rounded bg-cyan-600 text-[8px] font-mono text-white hover:bg-cyan-500 w-full truncate"
                  >
                    Analyze
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveCapturedImage(img.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
