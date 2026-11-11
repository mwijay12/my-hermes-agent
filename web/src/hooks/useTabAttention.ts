import { useEffect, useRef, useCallback } from "react";

interface AttentionOptions {
  title?: string;
  body?: string;
  icon?: string;
}

/**
 * useTabAttention
 * Flashes browser tab title and triggers browser notification when user attention
 * is required (task complete, clarify requested, or error) while the tab is hidden or unfocused.
 */
export function useTabAttention(originalTitle = "Hermes Agent") {
  const flashIntervalRef = useRef<number | null>(null);
  const isFlashingRef = useRef<boolean>(false);

  // Request browser notification permissions on demand
  const requestPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
  }, []);

  // Stop flashing title
  const clearAttention = useCallback(() => {
    if (flashIntervalRef.current) {
      clearInterval(flashIntervalRef.current);
      flashIntervalRef.current = null;
    }
    isFlashingRef.current = false;
    if (typeof document !== "undefined") {
      document.title = originalTitle;
    }
  }, [originalTitle]);

  // Trigger attention
  const triggerAttention = useCallback(
    (alertText = "⚠️ Attention Required", opts?: AttentionOptions) => {
      // If user is already active in the tab, do nothing
      if (typeof document !== "undefined" && !document.hidden && document.hasFocus()) {
        return;
      }

      // Show browser native notification if permitted
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          const notif = new Notification(opts?.title || "Hermes Agent", {
            body: opts?.body || alertText,
            icon: opts?.icon || "/favicon.ico",
          });
          notif.onclick = () => {
            window.focus();
            clearAttention();
          };
        } catch {
          // ignore notification errors
        }
      }

      // Start flashing tab title
      if (!isFlashingRef.current) {
        isFlashingRef.current = true;
        let toggle = false;
        flashIntervalRef.current = window.setInterval(() => {
          document.title = toggle ? `🔔 ${alertText}` : originalTitle;
          toggle = !toggle;
        }, 1000);
      }
    },
    [originalTitle, clearAttention]
  );

  useEffect(() => {
    const handleFocus = () => clearAttention();
    const handleVisibility = () => {
      if (!document.hidden) {
        clearAttention();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearAttention();
    };
  }, [clearAttention]);

  return { triggerAttention, clearAttention, requestPermission };
}
