"use client";

import { useState, useEffect, useCallback, RefObject } from "react";
import { logger } from "@/lib/logger";

export interface AiFollowupResponse {
  answer: string;
  keyPoints: string[];
  confidence: "high" | "medium" | "low";
  relatedClauses: string[];
  disclaimer: boolean;
}

export interface ConversationMessage {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface UseCaseFollowupProps {
  caseId: string;
  soundEnabled: boolean;
  playCompletionSound: () => void;
  aiResponseSectionRef?: RefObject<HTMLDivElement | null>;
}

export interface UseCaseFollowupResult {
  conversationMessages: ConversationMessage[];
  setConversationMessages: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;
  latestAiResponse: AiFollowupResponse | null;
  setLatestAiResponse: React.Dispatch<React.SetStateAction<AiFollowupResponse | null>>;
  followupError: string | null;
  setFollowupError: (msg: string | null) => void;
  promptText: string;
  setPromptText: (text: string) => void;
  isAnalyzing: boolean;
  handleExecutePrompt: () => Promise<void>;
}

export function useCaseFollowup({
  caseId,
  soundEnabled,
  playCompletionSound,
  aiResponseSectionRef,
}: UseCaseFollowupProps): UseCaseFollowupResult {
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [latestAiResponse, setLatestAiResponse] = useState<AiFollowupResponse | null>(null);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Fetch conversation history on mount
  useEffect(() => {
    if (!caseId.match(/^[0-9a-fA-F]{24}$/)) return;
    async function loadConversation() {
      try {
        const res = await fetch(`/api/case/${caseId}/followup`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setConversationMessages(data.messages);
          }
        }
      } catch (err: unknown) {
        logger.warn("Could not load conversation history:", err);
      }
    }
    loadConversation();
  }, [caseId]);

  const handleExecutePrompt = useCallback(async () => {
    if (!promptText.trim() || isAnalyzing) return;

    const question = promptText.trim();
    setIsAnalyzing(true);
    setPromptText("");
    setFollowupError(null);
    setLatestAiResponse(null);

    // Add user message to conversation history
    const userMsg: ConversationMessage = {
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setConversationMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch(`/api/case/${caseId}/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response.");
      }

      if (data.success && data.response) {
        const aiResponse: AiFollowupResponse = data.response;
        setLatestAiResponse(aiResponse);

        // Add assistant message to conversation
        const assistantMsg: ConversationMessage = {
          role: "assistant",
          content: JSON.stringify(aiResponse),
          timestamp: new Date().toISOString(),
        };
        setConversationMessages((prev) => [...prev, assistantMsg]);

        // Play completion audio chime
        if (soundEnabled) {
          playCompletionSound();
        }

        // Scroll AI response section into view
        setTimeout(() => {
          aiResponseSectionRef?.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      logger.error("Follow-up error:", err);
      setFollowupError(errMessage || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [promptText, isAnalyzing, caseId, soundEnabled, playCompletionSound, aiResponseSectionRef]);

  return {
    conversationMessages,
    setConversationMessages,
    latestAiResponse,
    setLatestAiResponse,
    followupError,
    setFollowupError,
    promptText,
    setPromptText,
    isAnalyzing,
    handleExecutePrompt,
  };
}
