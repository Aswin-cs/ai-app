"use client";

import React, { useState } from "react";

interface MemeVibeCheckProps {
  riskScore: number;
  criticalCount?: number;
  isVisible: boolean;
  onToggleVisible: () => void;
  layout?: "compact" | "wide";
}

const PHASE_DETAILS = [
  {
    phase: 1,
    title: "Phase 1: Smooth Sailing",
    subtitle: "Minimal risks detected. Terms appear standard and reasonable.",
    image: "/memes/phase_1.webp",
    badgeBg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    meterGradient: "from-emerald-400 to-teal-500",
    vibeText: "Vibe: Rest Easy ☕",
  },
  {
    phase: 2,
    title: "Phase 2: Minor Eyebrow Raise",
    subtitle: "Low risk detected. A few clauses worth double-checking.",
    image: "/memes/phase_2.webp",
    badgeBg: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800",
    meterGradient: "from-teal-400 to-emerald-500",
    vibeText: "Vibe: Standard Review 📄",
  },
  {
    phase: 3,
    title: "Phase 3: Raising Eyebrows",
    subtitle: "Moderate risk. Pay close attention to notice & penalty terms.",
    image: "/memes/phase_3.webp",
    badgeBg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800",
    meterGradient: "from-amber-400 to-yellow-500",
    vibeText: "Vibe: Proceed With Caution ⚠️",
  },
  {
    phase: 4,
    title: "Phase 4: Entering Danger Zone",
    subtitle: "Elevated risk. Substantial obligations and strict liabilities flagged.",
    image: "/memes/phase_4.webp",
    badgeBg: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800",
    meterGradient: "from-amber-500 to-orange-500",
    vibeText: "Vibe: Read The Fine Print 🧐",
  },
  {
    phase: 5,
    title: "Phase 5: High Risk Alert",
    subtitle: "High risk! Unfavorable clauses and potentially costly terms.",
    image: "/memes/phase_5.webp",
    badgeBg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800",
    meterGradient: "from-orange-500 to-rose-500",
    vibeText: "Vibe: Red Flags Incoming 🚩",
  },
  {
    phase: 6,
    title: "Phase 6: Code Red Emergency",
    subtitle: "Severe risk! Heavy penalties, restrictive covenants, or vague indemnity.",
    image: "/memes/phase_6.webp",
    badgeBg: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-400 dark:border-red-800",
    meterGradient: "from-rose-500 to-red-600",
    vibeText: "Vibe: Panic Stations 🚨",
  },
  {
    phase: 7,
    title: "Phase 7: Maximum Catastrophe",
    subtitle: "Critical danger level! Highly unconscionable or predatory terms.",
    image: "/memes/phase_7.webp",
    badgeBg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-400 dark:border-purple-800",
    meterGradient: "from-red-600 via-rose-600 to-purple-600",
    vibeText: "Vibe: Do NOT Sign This! ☠️",
  },
];

export function getMemePhase(score: number): typeof PHASE_DETAILS[number] {
  const safeScore = Math.max(0, Math.min(100, score));
  if (safeScore <= 14) return PHASE_DETAILS[0];
  if (safeScore <= 28) return PHASE_DETAILS[1];
  if (safeScore <= 42) return PHASE_DETAILS[2];
  if (safeScore <= 57) return PHASE_DETAILS[3];
  if (safeScore <= 71) return PHASE_DETAILS[4];
  if (safeScore <= 85) return PHASE_DETAILS[5];
  return PHASE_DETAILS[6];
}

export default function MemeVibeCheck({
  riskScore,
  criticalCount = 0,
  isVisible,
  onToggleVisible,
  layout = "wide",
}: MemeVibeCheckProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null);

  const activeScore = simulatedScore !== null ? simulatedScore : riskScore;
  const currentPhase = getMemePhase(activeScore);

  if (!isVisible) {
    return (
      <div className="bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
            ✨
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block">Legal Vibe Check</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Meme section is hidden</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleVisible}
          className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/60 rounded-lg transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">visibility</span>
          <span>Show</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`h-full flex flex-col justify-between rounded-2xl border transition-all duration-300 group ${
        layout === "wide"
          ? "bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-white/80 dark:border-slate-800 shadow-2xs"
          : "bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-900 border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_rgba(15,23,42,0.04)]"
      } overflow-hidden`}>
        {/* Card Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[16px]">sentiment_very_satisfied</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                Legal Vibe Check
                {simulatedScore !== null ? (
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800/60 animate-pulse">
                    Simulator Mode
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/60">
                    AI Meme
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Simulator Toggle Button */}
            <button
              type="button"
              onClick={() => setShowSimulator(!showSimulator)}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-all flex items-center gap-1 ${
                showSimulator || simulatedScore !== null
                  ? "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800/60 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700"
              }`}
              title="Toggle Score Simulator"
            >
              <span className="material-symbols-outlined text-[13px]">tune</span>
              <span>Test Slider</span>
            </button>

            <button
              type="button"
              onClick={onToggleVisible}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px] font-medium"
              title="Hide Meme Section"
            >
              <span className="material-symbols-outlined text-[16px]">visibility_off</span>
            </button>
          </div>
        </div>

        {/* Simulator Control Drawer */}
        {showSimulator && (
          <div className="bg-amber-50/90 dark:bg-amber-950/90 border-b border-amber-200/80 dark:border-amber-800/80 p-3.5 space-y-2.5 text-xs animate-fade-in shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-[11px] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[15px] text-amber-600 dark:text-amber-400">science</span>
                <span>Critical Score Test Simulator</span>
              </div>
              {simulatedScore !== null && (
                <button
                  type="button"
                  onClick={() => setSimulatedScore(null)}
                  className="text-[10px] text-amber-800 dark:text-amber-300 underline hover:text-amber-950 font-medium"
                >
                  Reset to Actual ({riskScore})
                </button>
              )}
            </div>

            {/* Range Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-amber-800 dark:text-amber-300">Adjust Score:</span>
                <span className="font-extrabold text-amber-950 dark:text-amber-100 bg-amber-200/70 dark:bg-amber-900/80 px-2 py-0.5 rounded">
                  {activeScore} / 100 ({currentPhase.title.split(":")[0]})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={activeScore}
                onChange={(e) => setSimulatedScore(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 dark:bg-amber-900 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
              />
            </div>

            {/* Quick Phase Presets */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                { phase: 1, score: 10 },
                { phase: 2, score: 25 },
                { phase: 3, score: 38 },
                { phase: 4, score: 50 },
                { phase: 5, score: 65 },
                { phase: 6, score: 80 },
                { phase: 7, score: 95 },
              ].map((p) => (
                <button
                  key={p.phase}
                  type="button"
                  onClick={() => setSimulatedScore(p.score)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                    currentPhase.phase === p.phase
                      ? "bg-amber-700 text-white border-amber-800 font-bold"
                      : "bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/60"
                  }`}
                >
                  P{p.phase} ({p.score})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card Content - Responsive Wide vs Compact Layout */}
        <div className="p-4 flex-1 flex flex-col justify-center">
          {layout === "wide" ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Meme Image Frame (5 cols) */}
              <div
                className="sm:col-span-5 relative rounded-xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 shadow-xs bg-slate-900 group/img cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => setIsLightboxOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPhase.image}
                  alt={currentPhase.title}
                  className="w-full h-40 sm:h-44 object-cover object-center group-hover/img:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2.5 pointer-events-none">
                  <span className="text-[11px] font-bold text-white drop-shadow-md">
                    {currentPhase.vibeText}
                  </span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-slate-900/80 text-white p-1 rounded-md backdrop-blur-md">
                  <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                </div>
              </div>

              {/* Phase Info & Progress Meter (7 cols) */}
              <div className="sm:col-span-7 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentPhase.badgeBg}`}>
                      {currentPhase.title}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      Score: {activeScore}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentPhase.subtitle}
                  </p>
                </div>

                {/* Phase Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Phase {currentPhase.phase} of 7</span>
                    <span>Score Index: {activeScore}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${currentPhase.meterGradient} transition-all duration-700 shadow-xs`}
                      style={{ width: `${Math.max(5, (currentPhase.phase / 7) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Phase Banner */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentPhase.badgeBg} inline-block mb-1`}>
                    {currentPhase.title}
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug line-clamp-2">
                    {currentPhase.subtitle}
                  </p>
                </div>
              </div>

              {/* Meme Image Frame */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 shadow-xs bg-slate-900 group/img cursor-pointer transition-transform hover:scale-[1.01]" onClick={() => setIsLightboxOpen(true)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentPhase.image}
                  alt={currentPhase.title}
                  className="w-full h-48 sm:h-52 object-cover object-center group-hover/img:scale-105 transition-transform duration-500 ease-out"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white drop-shadow-md">
                      {currentPhase.vibeText}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-200 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-white/20">
                      Critical Score: {activeScore}/100
                    </span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-slate-900/80 text-white p-1.5 rounded-lg backdrop-blur-md">
                  <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                </div>
              </div>

              {/* Phase Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Phase {currentPhase.phase} of 7</span>
                  <span>Score Index: {activeScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${currentPhase.meterGradient} transition-all duration-700 shadow-xs`}
                    style={{ width: `${Math.max(5, (currentPhase.phase / 7) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-sm text-[#0F172A]">{currentPhase.title}</h3>
                <p className="text-xs text-slate-500">{currentPhase.vibeText}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-4 bg-slate-900 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentPhase.image}
                alt={currentPhase.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>

            <div className="p-4 bg-white flex items-center justify-between text-xs text-slate-600">
              <span>Critical Score: <strong className="text-indigo-600 font-mono">{activeScore}/100</strong></span>
              {criticalCount > 0 && <span>Flagged Critical Clauses: <strong className="text-rose-600">{criticalCount}</strong></span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
