"use client";

import React from "react";
import type { RiskItem as RiskItemType } from "@/types/case.types";
import { getSeverityStyles } from "@/lib/severityStyles";

export interface ModalRiskItemCardProps {
  risk: RiskItemType;
}

export const ModalRiskItemCard = React.memo(function ModalRiskItemCard({
  risk,
}: ModalRiskItemCardProps) {
  const styles = getSeverityStyles(risk.severity);

  return (
    <div className={`rounded-2xl border p-4 transition-all ${styles.cardBgClass} ${styles.cardBorderClass}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-md truncate max-w-[260px]">
          {risk.clause}
        </span>
        <span
          className={`font-mono text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            styles.severity === "critical"
              ? "bg-red-600 text-white"
              : styles.severity === "warning"
              ? "bg-amber-500 text-white"
              : "bg-slate-600 text-white"
          }`}
        >
          {risk.severity}
        </span>
      </div>

      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2">
        {risk.title}
      </h4>

      {risk.statuteReference && (
        <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mb-3">
          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">gavel</span>
          <span>{risk.statuteReference}</span>
        </div>
      )}

      {/* Excerpt */}
      <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 mb-3 text-xs italic font-serif text-slate-700 dark:text-slate-300">
        &ldquo;{risk.sourceText}&rdquo;
      </div>

      {/* Explanation */}
      <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-slate-700 dark:text-slate-300">
        <div className="text-[10px] font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 mb-1">
          Statutory Explanation
        </div>
        <p>{risk.explanation}</p>
      </div>
    </div>
  );
});

export default ModalRiskItemCard;
