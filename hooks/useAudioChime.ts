"use client";

import { useState, useEffect, useCallback } from "react";
import { logger } from "@/lib/logger";

export interface UseAudioChimeResult {
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  handleToggleSound: () => void;
  playCompletionSound: () => void;
}

export function useAudioChime(): UseAudioChimeResult {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Sync sound preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jurisai_sound_enabled");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    } catch (e: unknown) {
      logger.warn("Could not read sound preference from localStorage:", e);
    }
  }, []);

  // Web Audio API Synthesized Completion Chime (C5 -> E5 -> G5)
  const playCompletionSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e: unknown) {
      logger.warn("Could not play completion sound:", e);
    }
  }, []);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jurisai_sound_enabled", String(next));
      } catch (e: unknown) {
        logger.warn("Could not write sound preference to localStorage:", e);
      }
      if (next) {
        playCompletionSound();
      }
      return next;
    });
  }, [playCompletionSound]);

  return {
    soundEnabled,
    setSoundEnabled,
    handleToggleSound,
    playCompletionSound,
  };
}
