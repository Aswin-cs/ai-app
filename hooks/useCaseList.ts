"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { logger } from "@/lib/logger";

export interface CaseHistoryItem {
  _id: string;
  fileName: string;
  documentTitle: string;
  documentType: string;
  overallRiskScore: number;
  status: string;
  createdAt: string;
  risksCount: number;
}

export interface UseCaseListResult {
  historyCases: CaseHistoryItem[];
  isLoadingHistory: boolean;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  successToast: string | null;
  setSuccessToast: (msg: string | null) => void;
  caseToDelete: CaseHistoryItem | null;
  setCaseToDelete: (item: CaseHistoryItem | null) => void;
  isDeletingCase: boolean;
  handleDeleteCaseConfirm: () => Promise<void>;
  groupedHistory: {
    today: CaseHistoryItem[];
    yesterday: CaseHistoryItem[];
    past7Days: CaseHistoryItem[];
    older: CaseHistoryItem[];
  };
  getDocIcon: (type?: string) => string;
}

export function useCaseList(): UseCaseListResult {
  const [historyCases, setHistoryCases] = useState<CaseHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<CaseHistoryItem | null>(null);
  const [isDeletingCase, setIsDeletingCase] = useState<boolean>(false);

  // Fetch consultation history from /api/cases
  useEffect(() => {
    async function fetchHistory() {
      try {
        setIsLoadingHistory(true);
        const res = await fetch("/api/cases");
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success && Array.isArray(data.cases)) {
            setHistoryCases(data.cases);
          }
        } else {
          logger.warn(`[/api/cases] Server returned non-JSON response (${res.status})`);
        }
      } catch (err: unknown) {
        logger.error("Failed to fetch case history:", err);
      } finally {
        setIsLoadingHistory(false);
      }
    }

    fetchHistory();
  }, []);

  // Group cases into timeframe buckets
  const groupedHistory = useMemo(() => {
    const today: CaseHistoryItem[] = [];
    const yesterday: CaseHistoryItem[] = [];
    const past7Days: CaseHistoryItem[] = [];
    const older: CaseHistoryItem[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOf7Days = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    historyCases.forEach((item) => {
      const itemDate = new Date(item.createdAt);
      if (itemDate >= startOfToday) {
        today.push(item);
      } else if (itemDate >= startOfYesterday) {
        yesterday.push(item);
      } else if (itemDate >= startOf7Days) {
        past7Days.push(item);
      } else {
        older.push(item);
      }
    });

    return { today, yesterday, past7Days, older };
  }, [historyCases]);

  const getDocIcon = useCallback((type?: string) => {
    const lower = (type || "").toLowerCase();
    if (lower.includes("lease") || lower.includes("rent")) return "description";
    if (lower.includes("notice") || lower.includes("dispute")) return "gavel";
    if (lower.includes("severance") || lower.includes("employment")) return "assignment_turned_in";
    if (lower.includes("nda") || lower.includes("agreement")) return "article";
    return "description";
  }, []);

  const handleDeleteCaseConfirm = useCallback(async () => {
    if (!caseToDelete) return;

    setIsDeletingCase(true);
    try {
      const res = await fetch(`/api/case/${caseToDelete._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete case.");
      }

      setHistoryCases((prev) => prev.filter((item) => item._id !== caseToDelete._id));

      const title = caseToDelete.documentTitle || caseToDelete.fileName;
      setSuccessToast(`"${title}" has been deleted.`);
      setTimeout(() => setSuccessToast(null), 4000);

      setCaseToDelete(null);
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      logger.error("Delete error:", err);
      setErrorMessage(errMessage || "Failed to delete consultation.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsDeletingCase(false);
    }
  }, [caseToDelete]);

  return {
    historyCases,
    isLoadingHistory,
    errorMessage,
    setErrorMessage,
    successToast,
    setSuccessToast,
    caseToDelete,
    setCaseToDelete,
    isDeletingCase,
    handleDeleteCaseConfirm,
    groupedHistory,
    getDocIcon,
  };
}
