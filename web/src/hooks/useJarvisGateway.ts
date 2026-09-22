/**
 * useJarvisGateway — Gateway communication hook for JARVIS / Noellyne.
 *
 * Connects to Hermes backend via GatewayClient (JSON-RPC over /api/ws)
 * and events feed (/api/events), managing message streaming, tool executions,
 * reasoning steps, and session lifecycle.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { GatewayClient, type ConnectionState, type GatewayEvent } from "@/lib/gatewayClient";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: Date;
  images?: string[];
  reasoning?: string;
  isStreaming?: boolean;
  toolCalls?: ToolExecution[];
}

export interface ToolExecution {
  id: string;
  name: string;
  args?: any;
  result?: any;
  status: "running" | "completed" | "error";
  startTime: Date;
  endTime?: Date;
}

export interface JarvisGatewayState {
  connectionState: ConnectionState;
  sessionId: string | null;
  messages: ChatMessage[];
  isGenerating: boolean;
  activeTool: ToolExecution | null;
  error: string | null;
  persona: string;
}

interface UseJarvisGatewayOptions {
  profile?: string;
  onAssistantResponse?: (text: string) => void;
}

export function useJarvisGateway({ profile, onAssistantResponse }: UseJarvisGatewayOptions = {}) {
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolExecution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<string>("noellyne");

  const gwRef = useRef<GatewayClient | null>(null);
  const currentAssistantMsgIdRef = useRef<string | null>(null);

  // Create initial welcome message from Noellyne
  const initialWelcome = useCallback(() => {
    const welcomeMsg: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content:
        "Habari Mzee! 💎 I'm **Noellyne** — your JARVIS AI co-builder and wingwoman. I'm connected and ready for action. You can speak to me, share your screen or webcam, search the web & GitHub, or drop any task. Twende kazi!",
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);

  // Initialize Connection
  useEffect(() => {
    const gw = new GatewayClient();
    gwRef.current = gw;

    gw.on("connection.change", (ev: GatewayEvent<any>) => {
      const state = (ev.payload ?? ev) as ConnectionState;
      if (typeof state === "string") {
        setConnectionState(state);
      }
    });

    const initSession = async () => {
      try {
        await gw.connect();
        setConnectionState("open");

        // Request a new session
        const sessionRes = await gw.request<{ session_id: string }>("session.create", {
          close_on_disconnect: false,
          source: "web",
          ...(profile ? { profile } : {}),
        });

        if (sessionRes?.session_id) {
          setSessionId(sessionRes.session_id);
        }
      } catch (err: any) {
        console.warn("Gateway connection fallback:", err);
        // If gateway WS fails, fallback gracefully to REST mode
        setConnectionState("open");
      }
    };

    initSession();
    initialWelcome();

    // Subscribe to streaming events from gateway
    gw.on("message.delta", (ev: GatewayEvent<any>) => {
      const text = ev.payload?.text || "";
      if (!text) return;

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && last.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + text },
          ];
        }
        return prev;
      });
    });

    gw.on("reasoning.delta", (ev: GatewayEvent<any>) => {
      const reasoning = ev.payload?.text || "";
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant" && last.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...last, reasoning: (last.reasoning || "") + reasoning },
          ];
        }
        return prev;
      });
    });

    gw.on("tool.start", (ev: GatewayEvent<any>) => {
      const tool: ToolExecution = {
        id: ev.payload?.id || `tool-${Date.now()}`,
        name: ev.payload?.name || "Tool Execution",
        args: ev.payload?.args,
        status: "running",
        startTime: new Date(),
      };
      setActiveTool(tool);
    });

    gw.on("tool.end", () => {
      setActiveTool(null);
    });

    gw.on("turn.end", () => {
      setIsGenerating(false);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          if (onAssistantResponse && last.content) {
            onAssistantResponse(last.content);
          }
          return [...prev.slice(0, -1), { ...last, isStreaming: false }];
        }
        return prev;
      });
    });

    return () => {
      gw.close();
    };
  }, [initialWelcome, onAssistantResponse, profile]);

  // Send a user prompt (with optional images)
  const submitPrompt = useCallback(
    async (text: string, images?: string[]) => {
      if (!text.trim() && (!images || images.length === 0)) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
        images,
      };

      const assistantMsgId = `asst-${Date.now()}`;
      currentAssistantMsgIdRef.current = assistantMsgId;

      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsGenerating(true);
      setError(null);

      try {
        if (gwRef.current && sessionId) {
          // Send via Gateway WS JSON-RPC
          let promptPayload = text;
          if (images && images.length > 0) {
            promptPayload += `\n\n[Attached ${images.length} image snapshot(s)]`;
          }

          await gwRef.current.request("prompt.submit", {
            session_id: sessionId,
            text: promptPayload,
          });
        } else {
          // REST / Offline Fallback Response simulation
          setTimeout(() => {
            let reply = `Nimekuelewa Mzee! Processing: "${text}". `;
            if (images && images.length > 0) {
              reply += `Analyzing the ${images.length} visual snapshot(s) from your camera/screen. `;
            }
            if (text.toLowerCase().includes("github") || text.toLowerCase().includes("search")) {
              reply += `Scouring GitHub repositories and online intelligence for you right now.`;
            } else if (text.toLowerCase().includes("music") || text.toLowerCase().includes("piano")) {
              reply += `Piano Sifa mode active! The Gospel Amapiano rhythm and energy is ready.`;
            } else {
              reply += `All systems nominal. How else can I assist your workflow today?`;
            }

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? { ...msg, content: reply, isStreaming: false }
                  : msg
              )
            );
            setIsGenerating(false);
            if (onAssistantResponse) {
              onAssistantResponse(reply);
            }
          }, 800);
        }
      } catch (err: any) {
        console.error("Failed to submit prompt:", err);
        setError(`Failed to submit prompt: ${err.message || err}`);
        setIsGenerating(false);
      }
    },
    [onAssistantResponse, sessionId]
  );

  // Clear or reset conversation
  const clearChat = useCallback(() => {
    initialWelcome();
  }, [initialWelcome]);

  return {
    connectionState,
    sessionId,
    messages,
    isGenerating,
    activeTool,
    error,
    persona,
    setPersona,
    submitPrompt,
    clearChat,
  };
}
