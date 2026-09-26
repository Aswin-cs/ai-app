"use client";

import React from "react";

interface QuickLegalChipsProps {
  onChipClick: (text: string) => void;
}

export const QuickLegalChips = React.memo(function QuickLegalChips({
  onChipClick,
}: QuickLegalChipsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-2 px-1 text-left sm:hidden">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Recommended Inquiries
        </span>
      </div>

      {/* Mobile 2x2 Grid Pills */}
      <div className="grid grid-cols-2 gap-2.5 sm:hidden">
        <button
          type="button"
          onClick={() =>
            onChipClick(
              "Review residential lease agreement for early termination penalties under California law"
            )
          }
          className="text-left p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:shadow-md dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between h-[76px] group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
              home_work
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500" aria-hidden="true">
              arrow_forward
            </span>
          </div>
          <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 truncate w-full">
            Review lease agreement
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChipClick(
              "How do I dispute an improper 30-day notice to vacate without just cause?"
            )
          }
          className="text-left p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:shadow-md dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between h-[76px] group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
              report_problem
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500" aria-hidden="true">
              arrow_forward
            </span>
          </div>
          <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 truncate w-full">
            Dispute notice to vacate
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChipClick("Verify non-compete and severance clause enforceability")
          }
          className="text-left p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:shadow-md dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between h-[76px] group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
              badge
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500" aria-hidden="true">
              arrow_forward
            </span>
          </div>
          <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 truncate w-full">
            Severance clause check
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChipClick(
              "What are the statutory limits and steps to file in Small Claims court?"
            )
          }
          className="text-left p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:shadow-md dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between h-[76px] group active:scale-[0.98]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
              account_balance
            </span>
            <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500" aria-hidden="true">
              arrow_forward
            </span>
          </div>
          <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 truncate w-full">
            Small claims guidance
          </span>
        </button>
      </div>

      {/* Desktop Horizontal Chips */}
      <div className="hidden sm:flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() =>
            onChipClick(
              "Review residential lease agreement for early termination penalties under California law"
            )
          }
          className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
            description
          </span>
          <span>Review residential lease</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChipClick(
              "How do I dispute an improper 30-day notice to vacate without just cause?"
            )
          }
          className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
            gavel
          </span>
          <span>Dispute notice to vacate</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChipClick("Verify non-compete and severance clause enforceability")
          }
          className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
            assignment_turned_in
          </span>
          <span>Severance clause check</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChipClick(
              "What are the statutory limits and steps to file in Small Claims court?"
            )
          }
          className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/70 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[15px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
            calculate
          </span>
          <span>Small claims guidance</span>
        </button>
      </div>
    </div>
  );
});
