"use client";

import React from "react";
import type { RiskItem as RiskItemType } from "@/types/case.types";
import { getSeverityStyles } from "@/lib/severityStyles";

export interface RiskLedgerCardProps {
  item: RiskItemType;
  isActive: boolean;
  onJump: (id: string) => void;
}

export const RiskLedgerCard = React.memo(function RiskLedgerCard({
  item,
  isActive,
  onJump,
}: RiskLedgerCardProps) {
  const styles = getSeverityStyles(item.severity);

  return (
    <div
      onClick={() => onJump(item.id)}
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
        isActive
          ? "bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800/80 shadow-xs"
          : "bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
      }`}
    >
      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${styles.dotBgClass}`}></span>
      <div className="min-w-0 flex-1">
        <div
          className={`text-xs font-medium leading-snug transition-colors ${
            isActive
              ? "text-indigo-900 dark:text-indigo-200 font-semibold"
              : "text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
          }`}
        >
          {item.title}
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono flex-wrap">
          <span className={`font-semibold capitalize ${styles.textClass}`}>
            {item.severity}
          </span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
            {item.clause}
          </span>
          {item.statuteReference && (
            <>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span
                className="text-indigo-600 dark:text-indigo-400 text-[10px] truncate max-w-[130px]"
                title={item.statuteReference}
              >
                {item.statuteReference}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default RiskLedgerCard;
