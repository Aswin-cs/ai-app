"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { getRiskScoreStyles } from "@/lib/severityStyles";

export interface CaseAnalysisHeaderProps {
  documentTitle: string;
  overallRiskScore: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showExecBox: boolean;
  onToggleExecBox: () => void;
  showMeme: boolean;
  onToggleMeme: () => void;
  onOpenWhatIf: () => void;
  isExporting: boolean;
  onExportPDF: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (val: boolean) => void;
}

export const CaseAnalysisHeader = React.memo(function CaseAnalysisHeader({
  documentTitle,
  overallRiskScore,
  soundEnabled,
  onToggleSound,
  showExecBox,
  onToggleExecBox,
  showMeme,
  onToggleMeme,
  onOpenWhatIf,
  isExporting,
  onExportPDF,
  user,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: CaseAnalysisHeaderProps) {
  const riskStyles = getRiskScoreStyles(overallRiskScore);

  return (
    <header className="fixed top-0 w-full z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              J
            </div>
            <span className="font-bold text-lg tracking-tight text-[#0F172A] dark:text-slate-100">
              JurisAI
            </span>
          </Link>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

          <nav aria-label="Breadcrumbs" className="hidden md:flex items-center gap-1.5 text-slate-500 text-xs font-medium">
            <Link href="/" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded">
              Dashboard
            </Link>
            <span className="material-symbols-outlined text-slate-400 text-[14px]" aria-hidden="true">
              chevron_right
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[240px]">
              {documentTitle}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Risk Score Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${riskStyles.badgeClass}`}>
            <span className={`w-2 h-2 rounded-full ${riskStyles.dotClass}`}></span>
            <span className={`text-[11px] ${riskStyles.textClass}`}>
              Risk: {overallRiskScore}/100
            </span>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-1.5 flex-wrap">
            {/* Sound Toggle Button */}
            <button
              onClick={onToggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                soundEnabled
                  ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80"
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
              type="button"
              title={soundEnabled ? "Completion sound enabled (Click to mute)" : "Completion sound muted (Click to enable)"}
              aria-label={soundEnabled ? "Mute completion sound" : "Enable completion sound"}
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                {soundEnabled ? "volume_up" : "volume_off"}
              </span>
              <span>{soundEnabled ? "Sound On" : "Muted"}</span>
            </button>

            {/* Executive Box Toggle Button */}
            <button
              onClick={onToggleExecBox}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                showExecBox
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/60 dark:to-purple-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
              type="button"
              title={showExecBox ? "Hide Executive Risk Assessment & Vibe Check box" : "Show Executive Risk Assessment & Vibe Check box"}
              aria-label={showExecBox ? "Hide Executive Risk Assessment box" : "Show Executive Risk Assessment box"}
            >
              <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
                {showExecBox ? "visibility" : "visibility_off"}
              </span>
              <span>Exec Box</span>
            </button>

            {/* Meme Toggle Button */}
            <button
              onClick={onToggleMeme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                showMeme
                  ? "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/60 dark:to-indigo-950/60 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
              type="button"
              title={showMeme ? "Hide Legal Vibe Check meme" : "Show Legal Vibe Check meme"}
              aria-label={showMeme ? "Hide Legal Vibe Check meme" : "Show Legal Vibe Check meme"}
            >
              <span className="material-symbols-outlined text-[16px] text-purple-600 dark:text-purple-400" aria-hidden="true">
                {showMeme ? "visibility" : "visibility_off"}
              </span>
              <span>Vibe Check</span>
            </button>

            <button
              onClick={onOpenWhatIf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-semibold transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">account_tree</span>
              <span>What-If Map</span>
            </button>
            <button
              onClick={onExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              type="button"
            >
              {isExporting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">download</span>
              )}
              <span>{isExporting ? "Exporting..." : "Export PDF"}</span>
            </button>
            <ThemeToggle />
          </div>

          {/* Desktop User Avatar */}
          <div className="hidden md:flex w-8 h-8 rounded-full bg-indigo-600 text-white items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
            {user?.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={32}
                height={32}
                className="w-full h-full object-cover"
                sizes="32px"
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || "U"
            )}
          </div>

          {/* Mobile Hamburger Navbar Toggle Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
});

export default CaseAnalysisHeader;
