"use client";

import React from "react";
import LatticeLoader from "./LatticeLoader";

interface AiLoadingModalProps {
  isOpen: boolean;
  fileName?: string;
  userPrompt?: string;
  progressMessage?: string;
}

export default function AiLoadingModal({
  isOpen,
  progressMessage,
}: AiLoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI Document Analysis Processing"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-[#0F172A] border border-indigo-500/30 rounded-2xl px-6 py-4 shadow-2xl flex items-center justify-center text-white">
        <LatticeLoader
          status="working"
          label={progressMessage || "Thinking"}
          doneLabel="Done in"
          errorLabel="Failed after"
          pattern="orbit"
          grid={3}
          shape="round"
          color="#818cf8"
          doneColor="#22c55e"
          errorColor="#ef4444"
          cellSize={8}
          gap={3}
          fontSize={15}
          step={90}
          idleOpacity={0.2}
          glow={true}
          glowColor="#6366f1"
          showTimer={true}
        />
      </div>
    </div>
  );
}
