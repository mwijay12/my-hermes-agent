/**
 * useJarvisVision — Multimodal Vision Intelligence Hook for Hermes / JARVIS.
 *
 * Provides:
 * 1. Live WebRTC Webcam streaming with active video track management.
 * 2. Screen & Window Share streaming for live code / browser inspection.
 * 3. Snapshot frame grabbing to Base64 data URL for instant vision analysis.
 * 4. Image file upload, clipboard paste, and drag-and-drop ingestion.
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface CapturedImage {
  id: string;
  dataUrl: string;
  source: "webcam" | "screen" | "upload" | "paste";
  timestamp: Date;
  name?: string;
}

export function useJarvisVision() {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isScreenActive, setIsScreenActive] = useState(false);
  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);
  const [streamSource, setStreamSource] = useState<"camera" | "screen" | null>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop active media stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActiveStream(null);
    setIsCameraActive(false);
    setIsScreenActive(false);
    setStreamSource(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start Webcam
  const startCamera = useCallback(async () => {
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;
      setActiveStream(stream);
      setIsCameraActive(true);
      setStreamSource("camera");
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setError(`Camera access denied or unavailable: ${err.message || err}`);
    }
  }, [stopStream]);

  // Start Screen Share
  const startScreenShare = useCallback(async () => {
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "monitor" } as any,
        audio: false,
      });

      streamRef.current = stream;
      setActiveStream(stream);
      setIsScreenActive(true);
      setStreamSource("screen");
      setError(null);

      // Handle user ending screen share from browser chrome
      stream.getVideoTracks()[0].onended = () => {
        stopStream();
      };

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error("Screen share error:", err);
      setError(`Screen share cancelled or unavailable: ${err.message || err}`);
    }
  }, [stopStream]);

  // Capture a snapshot frame from video stream
  const captureSnapshot = useCallback((): CapturedImage | null => {
    if (!videoRef.current || !streamRef.current) {
      setError("No active video feed to capture.");
      return null;
    }

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Video feed is not ready yet.");
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

    const newCapture: CapturedImage = {
      id: `snap-${Date.now()}`,
      dataUrl,
      source: streamSource === "camera" ? "webcam" : "screen",
      timestamp: new Date(),
      name: `${streamSource === "camera" ? "Webcam" : "Screen"} Snapshot ${new Date().toLocaleTimeString()}`,
    };

    setCapturedImages((prev) => [newCapture, ...prev]);
    return newCapture;
  }, [streamSource]);

  // Add an uploaded or pasted image
  const addImageFile = useCallback((file: File, source: "upload" | "paste" = "upload") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const newImg: CapturedImage = {
          id: `img-${Date.now()}`,
          dataUrl,
          source,
          timestamp: new Date(),
          name: file.name || `Pasted Image ${new Date().toLocaleTimeString()}`,
        };
        setCapturedImages((prev) => [newImg, ...prev]);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  // Remove a captured image
  const removeCapturedImage = useCallback((id: string) => {
    setCapturedImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  // Clear all images
  const clearImages = useCallback(() => {
    setCapturedImages([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isCameraActive,
    isScreenActive,
    activeStream,
    streamSource,
    capturedImages,
    error,
    videoRef,
    startCamera,
    startScreenShare,
    stopStream,
    captureSnapshot,
    addImageFile,
    removeCapturedImage,
    clearImages,
  };
}
