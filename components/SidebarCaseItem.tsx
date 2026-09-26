"use client";

import React from "react";
import Link from "next/link";
import { CaseHistoryItem } from "@/hooks/useCaseList";

export interface SidebarCaseItemProps {
  item: CaseHistoryItem;
  iconColorClass: string;
  onDelete: (item: CaseHistoryItem) => void;
  getDocIcon: (type?: string) => string;
}

export const SidebarCaseItem = React.memo(function SidebarCaseItem({
  item,
  iconColorClass,
  onDelete,
  getDocIcon,
}: SidebarCaseItemProps) {
  return (
    <div className="flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/70 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group">
      <Link
        className="flex items-center gap-2.5 min-w-0 flex-1"
        href={`/case/${item._id}`}
      >
        <span className={`material-symbols-outlined text-[16px] shrink-0 ${iconColorClass}`}>
          {getDocIcon(item.documentType || item.fileName)}
        </span>
        <span className="truncate font-medium">{item.documentTitle || item.fileName}</span>
      </Link>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDelete(item);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition-all shrink-0"
        title="Delete consultation"
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">delete</span>
      </button>
    </div>
  );
});

export default SidebarCaseItem;
