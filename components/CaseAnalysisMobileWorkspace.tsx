"use client";

import React from "react";
import MemeVibeCheck from "./MemeVibeCheck";
import type { CaseDocument, RiskItem } from "@/types/case.types";
import type { ConversationMessage } from "@/hooks/useCaseFollowup";

interface CaseAnalysisMobileWorkspaceProps {
  mobileTab: "overview" | "document";
  setMobileTab: (tab: "overview" | "document") => void;
  showExecBox: boolean;
  overallRiskScore: number;
  riskStyles: { label: string; textClass: string };
  risks: RiskItem[];
  showMeme: boolean;
  handleToggleMeme: () => void;
  confidenceScore: number;
  analysis?: CaseDocument["analysis"];
  caseData: CaseDocument | null;
  isSummaryExpanded: boolean;
  setIsSummaryExpanded: (val: boolean) => void;
  setShowCriticalModal: (val: boolean) => void;
  conversationMessages: ConversationMessage[];
  documentTitle: string;
  zoomLevel: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
}

export const CaseAnalysisMobileWorkspace = React.memo(
  function CaseAnalysisMobileWorkspace({
    mobileTab,
    setMobileTab,
    showExecBox,
    overallRiskScore,
    riskStyles,
    risks,
    showMeme,
    handleToggleMeme,
    confidenceScore,
    analysis,
    caseData,
    isSummaryExpanded,
    setIsSummaryExpanded,
    setShowCriticalModal,
    conversationMessages,
    documentTitle,
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
  }: CaseAnalysisMobileWorkspaceProps) {
    return (
      <div className="lg:hidden flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-28">
        <div className="flex items-center justify-center p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setMobileTab("overview")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "overview"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              overview
            </span>
            <span>Overview &amp; Vibe Check</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("document")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "document"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              description
            </span>
            <span>Full Document View</span>
          </button>
        </div>

        {mobileTab === "overview" ? (
          <>
            {showExecBox && (
              <div
                className={`rounded-2xl border p-4 transition-all duration-300 relative overflow-hidden ${
                  overallRiskScore >= 70
                    ? "bg-gradient-to-br from-red-500/15 via-rose-500/10 to-amber-500/15 border-red-200 dark:border-red-900/80"
                    : overallRiskScore >= 40
                      ? "bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-yellow-500/15 border-amber-200 dark:border-amber-900/80"
                      : "bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-indigo-500/15 border-emerald-200 dark:border-emerald-900/80"
                }`}
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 text-[20px]" aria-hidden="true">
                      analytics
                    </span>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Executive Risk Assessment
                    </h2>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      overallRiskScore >= 70
                        ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300"
                        : overallRiskScore >= 40
                          ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                    }`}
                  >
                    Score: {overallRiskScore}/100
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-white/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                        Critical Threat Index
                      </div>
                      <div className={`text-3xl font-extrabold tracking-tight ${riskStyles.textClass}`}>
                        {overallRiskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          overallRiskScore >= 70
                            ? "bg-red-50 text-red-700 border-red-200"
                            : overallRiskScore >= 40
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {riskStyles.label}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {risks.length} Risks Flagged
                      </div>
                    </div>
                  </div>

                  <MemeVibeCheck
                    riskScore={overallRiskScore}
                    criticalCount={risks.filter((r) => r.severity === "critical").length}
                    isVisible={showMeme}
                    onToggleVisible={handleToggleMeme}
                    layout="compact"
                  />
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[20px]" aria-hidden="true">
                    auto_awesome
                  </span>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    AI Synthesis &amp; Document Summary
                  </h2>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {confidenceScore}% Confidence
                </span>
              </div>

              {analysis?.summary && (
                <div className="relative pl-3 border-l-2 border-indigo-500">
                  <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-[Inter]">
                    {analysis.summary}
                  </p>
                </div>
              )}

              {caseData?.fileSummary && !caseData.fileSummary.startsWith("[Binary file:") && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Source Text Context
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                    >
                      <span>{isSummaryExpanded ? "Show Less" : "Expand Summary"}</span>
                      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                        {isSummaryExpanded ? "expand_less" : "expand_more"}
                      </span>
                    </button>
                  </div>
                  <div
                    className={`text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/70 dark:border-slate-700/60 font-serif ${
                      isSummaryExpanded ? "" : "line-clamp-4"
                    }`}
                  >
                    {caseData.fileSummary}
                  </div>
                </div>
              )}

              {analysis?.extractedTerms && analysis.extractedTerms.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-2">
                    Extracted Key Terms
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {analysis.extractedTerms.map((term, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="text-[9px] text-slate-500">{term.label}</div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {term.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCriticalModal(true)}
              className="w-full p-4 rounded-2xl bg-gradient-to-br from-red-500/15 via-amber-500/10 to-indigo-500/15 dark:from-red-950/50 dark:via-amber-950/40 dark:to-indigo-950/50 border-2 border-red-300/80 dark:border-red-800/80 shadow-md flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-md shrink-0">
                  <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                    gavel
                  </span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Critical Points &amp; Flagged Risks
                    <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/90 text-red-700 dark:text-red-300 font-mono text-[11px] font-bold border border-red-200 dark:border-red-800">
                      {risks.length} Items
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Tap to inspect statutory flags, excerpts &amp; explanations in popup
                  </p>
                </div>
              </div>
              <span
                className="material-symbols-outlined text-slate-400 text-[24px] shrink-0"
                aria-hidden="true"
              >
                open_in_new
              </span>
            </button>

            {conversationMessages.length > 0 && (
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600 text-[18px]" aria-hidden="true">
                      forum
                    </span>
                    <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Conversation History
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold">
                    {conversationMessages.filter((m) => m.role === "user").length} Questions
                  </span>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {conversationMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs ${
                        msg.role === "user"
                          ? "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ml-4"
                          : "bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 mr-4"
                      }`}
                    >
                      <div className="font-bold text-[10px] text-slate-500 mb-1">
                        {msg.role === "user" ? "You" : "JurisAI"}
                      </div>
                      <div className="leading-relaxed font-medium">
                        {msg.role === "user" ? (
                          msg.content
                        ) : (
                          <div>
                            {(() => {
                              try {
                                const parsed = JSON.parse(msg.content);
                                return parsed.answer || msg.content;
                              } catch {
                                return msg.content;
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {documentTitle}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={handleZoomOut} className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    remove
                  </span>
                </button>
                <span className="font-mono text-xs">{zoomLevel}%</span>
                <button onClick={handleZoomIn} className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                    add
                  </span>
                </button>
              </div>
            </div>
            <div className="text-xs leading-relaxed font-serif text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[60vh] overflow-y-auto p-2">
              {caseData?.fileSummary || "No document text preview available."}
            </div>
          </div>
        )}
      </div>
    );
  }
);
