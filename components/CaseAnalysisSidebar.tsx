"use client";

import React from "react";
import type { CaseDocument, RiskItem } from "@/types/case.types";
import { getRiskScoreStyles } from "@/lib/severityStyles";

interface CaseAnalysisSidebarProps {
  caseData: CaseDocument | null;
  overallRiskScore: number;
  confidenceScore: number;
  risks: RiskItem[];
  onOpenWhatIf: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
}

export const CaseAnalysisSidebar = React.memo(function CaseAnalysisSidebar({
  caseData,
  overallRiskScore,
  confidenceScore,
  risks,
  onOpenWhatIf,
  onExportPDF,
  isExporting,
}: CaseAnalysisSidebarProps) {
  const analysis = caseData?.analysis;
  const riskStyles = getRiskScoreStyles(overallRiskScore);

  return (
    <aside className="hidden lg:flex lg:col-span-3 h-full flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Summary</h2>
          <span className={`font-mono text-xs font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${confidenceScore >= 80
            ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200/60 dark:border-emerald-800/60"
            : confidenceScore >= 50
              ? "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border-amber-200/60 dark:border-amber-800/60"
              : "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/70 border-red-200/60 dark:border-red-800/60"
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${confidenceScore >= 80 ? 'bg-emerald-500' : confidenceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
            {confidenceScore}% Confidence
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{caseData?.fileName}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <section className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-800/90 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 font-mono flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">overview</span>
              Document Quick Stats
            </h3>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              overallRiskScore >= 70 ? 'bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300' : overallRiskScore >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
            }`}>
              {riskStyles.label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs mt-3">
            <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
              <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base">{risks.length}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Risks Flagged</div>
            </div>
            <div className="p-2 bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base">{confidenceScore}%</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Confidence</div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Synthesis</h3>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shadow-2xs font-[Inter]">
            {analysis?.summary || "No summary available."}
          </p>
        </section>

        {analysis?.extractedTerms && analysis.extractedTerms.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Extracted Terms</h3>
            <div className="grid grid-cols-2 gap-2.5">
              {analysis.extractedTerms.map((term, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{term.label}</div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 mt-0.5">{term.value}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {analysis?.recommendations && analysis.recommendations.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Key Recommendations</h3>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 bg-indigo-50/50 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/60">
                  <span className="material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" aria-hidden="true">check_circle</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="pt-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">Analysis Tools</h3>
          <div className="space-y-2">
            <button
              onClick={onOpenWhatIf}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-all shadow-2xs group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              type="button"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">account_tree</span>
                <span>Simulate What-If Scenarios</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-indigo-400 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">arrow_forward</span>
            </button>

            <button
              onClick={onExportPDF}
              disabled={isExporting}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-2xs disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              type="button"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-rose-500" aria-hidden="true">picture_as_pdf</span>
                <span>{isExporting ? "Exporting PDF Report..." : "Download Full PDF Report"}</span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400" aria-hidden="true">download</span>
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
});
