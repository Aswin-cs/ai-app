"use client";

import React from "react";
import MemeVibeCheck from "./MemeVibeCheck";
import type { RiskItem } from "@/types/case.types";

interface CaseAnalysisExecSummaryProps {
  overallRiskScore: number;
  riskStyles: { label: string; textClass: string };
  showExecBox: boolean;
  handleToggleExecBox: () => void;
  risks: RiskItem[];
  showMeme: boolean;
  handleToggleMeme: () => void;
}

export const CaseAnalysisExecSummary = React.memo(
  function CaseAnalysisExecSummary({
    overallRiskScore,
    riskStyles,
    showExecBox,
    handleToggleExecBox,
    risks,
    showMeme,
    handleToggleMeme,
  }: CaseAnalysisExecSummaryProps) {
    const theme =
      overallRiskScore >= 70
        ? {
            container:
              "bg-gradient-to-br from-red-500/20 via-rose-500/15 to-amber-500/20 dark:from-red-950/85 dark:via-rose-950/70 dark:to-amber-950/80 border-2 border-red-300 dark:border-red-700/80 shadow-[0_10px_35px_rgba(239,68,68,0.2)]",
            iconBg: "bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-500/20",
            badge: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/90 dark:text-red-300 dark:border-red-800",
            innerCard:
              "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/80 dark:border-slate-800",
          }
        : overallRiskScore >= 40
          ? {
              container:
                "bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/20 dark:from-amber-950/85 dark:via-orange-950/70 dark:to-yellow-950/80 border-2 border-amber-300 dark:border-amber-700/80 shadow-[0_10px_35px_rgba(245,158,11,0.2)]",
              iconBg: "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20",
              badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-800",
              innerCard:
                "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/80 dark:border-slate-800",
            }
          : {
              container:
                "bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-indigo-500/20 dark:from-emerald-950/85 dark:via-teal-950/70 dark:to-indigo-950/80 border-2 border-emerald-300 dark:border-emerald-700/80 shadow-[0_10px_35px_rgba(16,185,129,0.2)]",
              iconBg: "bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20",
              badge: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-800",
              innerCard:
                "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/80 dark:border-slate-800",
            };

    if (!showExecBox) {
      return (
        <div
          className={`mb-8 rounded-2xl border p-4 transition-all duration-500 relative overflow-hidden flex items-center justify-between gap-4 ${theme.container}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${theme.iconBg}`}>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                analytics
              </span>
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Executive Risk Assessment &amp; Vibe Check
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  Hidden
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Critical Threat Score: <strong className={riskStyles.textClass}>{overallRiskScore}/100</strong> (
                {riskStyles.label})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleExecBox}
            aria-label="Show Executive Risk Assessment and Vibe Check section"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              visibility
            </span>
            <span>Show Executive Assessment</span>
          </button>
        </div>
      );
    }

    return (
      <div
        className={`mb-8 rounded-2xl border p-4 sm:p-6 transition-all duration-500 relative overflow-hidden ${theme.container}`}
      >
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            overallRiskScore >= 70
              ? "bg-gradient-to-r from-red-500 via-rose-500 to-amber-500"
              : overallRiskScore >= 40
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500"
                : "bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"
          }`}
        />

        <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${theme.iconBg}`}>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                analytics
              </span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Executive Risk Assessment &amp; Vibe Check
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AI-calculated critical threat index &amp; contextual legal vibe check
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono px-3 py-1 rounded-full border font-bold ${theme.badge}`}>
              Critical Level: <strong className={riskStyles.textClass}>{overallRiskScore}/100</strong>
            </span>

            <button
              type="button"
              onClick={handleToggleExecBox}
              aria-label="Hide Executive Risk Assessment and Vibe Check section"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-colors flex items-center gap-1 text-[11px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Hide Executive Risk Assessment & Vibe Check section"
            >
              <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                visibility_off
              </span>
              <span className="hidden sm:inline">Hide Box</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className={`lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl shadow-2xs ${theme.innerCard}`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                  Critical Threat Level
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                    overallRiskScore >= 70
                      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800/60"
                      : overallRiskScore >= 40
                        ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/60"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/60"
                  }`}
                >
                  {riskStyles.label}
                </span>
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${riskStyles.textClass}`}>
                  {overallRiskScore}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                  / 100 Risk Index
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-100/90 dark:bg-slate-800/90 rounded-full overflow-hidden mt-3 mb-4 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    overallRiskScore >= 70
                      ? "bg-red-500"
                      : overallRiskScore >= 40
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(4, overallRiskScore)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 text-center">
              <div className="p-2 rounded-xl bg-red-50/70 dark:bg-red-950/50 border border-red-100 dark:border-red-900/40">
                <div className="text-base font-bold text-red-600 dark:text-red-400">
                  {risks.filter((r) => r.severity === "critical").length}
                </div>
                <div className="text-[9px] font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider font-mono">
                  Critical
                </div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40">
                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {risks.filter((r) => r.severity === "warning").length}
                </div>
                <div className="text-[9px] font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider font-mono">
                  Warnings
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
                <div className="text-base font-bold text-slate-700 dark:text-slate-300">
                  {risks.filter((r) => r.severity !== "critical" && r.severity !== "warning").length}
                </div>
                <div className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Notes
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <MemeVibeCheck
              riskScore={overallRiskScore}
              criticalCount={risks.filter((r) => r.severity === "critical").length}
              isVisible={showMeme}
              onToggleVisible={handleToggleMeme}
              layout="wide"
            />
          </div>
        </div>
      </div>
    );
  }
);
