"use client";

import React from "react";
import type { RiskItem as RiskItemType } from "@/types/case.types";
import ModalRiskItemCard from "./ModalRiskItemCard";
import GlideSelect from "./GlideSelect";

export interface CriticalPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  risks: RiskItemType[];
  filteredRisks: RiskItemType[];
  modalSearchFilteredRisks: RiskItemType[];
  modalSearch: string;
  setModalSearch: (query: string) => void;
  filterSeverity: string;
  setFilterSeverity: (val: string) => void;
}

export const CriticalPointsModal = React.memo(function CriticalPointsModal({
  isOpen,
  onClose,
  risks,
  filteredRisks,
  modalSearchFilteredRisks,
  modalSearch,
  setModalSearch,
  filterSeverity,
  setFilterSeverity,
}: CriticalPointsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Critical Points and Flagged Risks"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">gavel</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                Critical Points &amp; Flagged Risks
                <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/90 text-red-700 dark:text-red-300 font-mono text-[11px] font-bold border border-red-200 dark:border-red-800">
                  {risks.length} Items
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {filteredRisks.length} flagged statutory items &amp; compliance risks
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close Critical Points popup"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Modal Filter & Search Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <input
              type="text"
              placeholder="Search critical points..."
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <GlideSelect
            options={[
              { value: "All", label: "All Risks", tag: `${risks.length}` },
              { value: "critical", label: "Critical", tag: `${risks.filter((r) => r.severity === "critical").length}` },
              { value: "warning", label: "Warning", tag: `${risks.filter((r) => r.severity === "warning").length}` },
              { value: "note", label: "Notes", tag: `${risks.filter((r) => r.severity !== "critical" && r.severity !== "warning").length}` },
            ]}
            value={filterSeverity}
            onChange={(val) => setFilterSeverity(val)}
            ariaLabel="Filter risks by severity"
            showTags={true}
            accentColor="#4f46e5"
            surfaceColor="#ffffff"
            highlightColor="#e0e7ff"
            textColor="#4338ca"
            size="sm"
            radius={10}
            menuWidth={150}
            placement="bottom"
            align="right"
          />
        </div>

        {/* Modal Risk Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {modalSearchFilteredRisks.map((risk) => (
            <ModalRiskItemCard key={risk.id} risk={risk} />
          ))}

          {modalSearchFilteredRisks.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              No critical points found matching the criteria.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});

export default CriticalPointsModal;
