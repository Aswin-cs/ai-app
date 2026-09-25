"use client";

import React, { useEffect, useRef } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemTitle?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  itemTitle,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus cancel button on modal open
    cancelBtnRef.current?.focus();

    // Escape key press listener to close modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200/80 text-left overflow-hidden">
        {/* Top Warning Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500" />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <span className="material-symbols-outlined text-[26px]" aria-hidden="true">
              warning
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="delete-modal-title" className="text-base font-bold text-[#0F172A] tracking-tight">
              Delete Legal Consultation?
            </h3>
            <p id="delete-modal-desc" className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-800 break-words">
                &quot;{itemTitle || "this document"}&quot;
              </span>
              ? All associated AI risk analyses and extracted clause summaries will be removed.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-md shadow-rose-500/20 flex items-center gap-1.5 disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1"
          >
            {isDeleting ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin" aria-hidden="true">
                  refresh
                </span>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                  delete
                </span>
                <span>Delete Consultation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
