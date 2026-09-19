"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import BorderGlow from "./BorderGlow";
import AiLoadingModal from "./AiLoadingModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import LatticeLoader from "./LatticeLoader";

interface DashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface CaseHistoryItem {
  _id: string;
  fileName: string;
  documentTitle: string;
  documentType: string;
  overallRiskScore: number;
  status: string;
  createdAt: string;
  risksCount: number;
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [promptText, setPromptText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState("");

  const [historyCases, setHistoryCases] = useState<CaseHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  const [caseToDelete, setCaseToDelete] = useState<CaseHistoryItem | null>(null);
  const [isDeletingCase, setIsDeletingCase] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteCaseConfirm = async () => {
    if (!caseToDelete) return;
    setIsDeletingCase(true);
    try {
      const res = await fetch(`/api/case/${caseToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setHistoryCases((prev) => prev.filter((item) => item._id !== caseToDelete._id));
        setSuccessToast(`Deleted "${caseToDelete.documentTitle || caseToDelete.fileName}"`);
        setTimeout(() => setSuccessToast(null), 4000);
        setCaseToDelete(null);
      } else {
        throw new Error(data.error || "Failed to delete case.");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      setErrorMessage(err.message || "Failed to delete case. Please try again.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsDeletingCase(false);
    }
  };

  // Fetch case history on mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        setIsLoadingHistory(true);
        const res = await fetch("/api/cases");
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          if (res.ok && data.cases) {
            setHistoryCases(data.cases);
          }
        } else {
          console.warn(`[/api/cases] Server returned non-JSON response (${res.status})`);
        }
      } catch (err) {
        console.error("Failed to fetch case history:", err);
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

  const getDocIcon = (type?: string) => {
    const lower = (type || "").toLowerCase();
    if (lower.includes("lease") || lower.includes("rent")) return "description";
    if (lower.includes("notice") || lower.includes("dispute")) return "gavel";
    if (lower.includes("severance") || lower.includes("employment")) return "assignment_turned_in";
    if (lower.includes("nda") || lower.includes("agreement")) return "article";
    return "description";
  };

  const handleChipClick = (text: string) => {
    setPromptText(text);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!promptText.trim() && !attachedFile) return;

    if (!attachedFile) {
      setErrorMessage("Please attach a document to analyze.");
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisProgress("Uploading document...");

    try {
      const formData = new FormData();
      formData.append("file", attachedFile);
      if (promptText.trim()) {
        formData.append("prompt", promptText.trim());
      }

      setAnalysisProgress("Analyzing document with AI...");

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed. Please try again.");
      }

      if (data.success && data.caseId) {
        setAnalysisProgress("Analysis complete! Redirecting...");
        setPromptText("");
        setAttachedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        router.push(`/case/${data.caseId}`);
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      setTimeout(() => setErrorMessage(null), 6000);
      setIsAnalyzing(false);
      setAnalysisProgress("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const userName = user.name ? user.name.split(" ")[0] : "there";

  return (
    <div className="bg-[#F8FAFC] font-sans text-slate-800 antialiased min-h-screen pb-20 md:pb-0">
      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full px-4 animate-fade-in">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs font-medium">
            <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0">error</span>
            <span className="flex-1">{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700 shrink-0">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full px-4 animate-fade-in">
          <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-medium border border-emerald-700/60">
            <span className="material-symbols-outlined text-[18px] text-emerald-400 shrink-0">check_circle</span>
            <span className="flex-1">{successToast}</span>
            <button type="button" onClick={() => setSuccessToast(null)} className="text-emerald-300 hover:text-white shrink-0">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Warning Modal */}
      <DeleteConfirmModal
        isOpen={!!caseToDelete}
        itemTitle={caseToDelete?.documentTitle || caseToDelete?.fileName}
        isDeleting={isDeletingCase}
        onConfirm={handleDeleteCaseConfirm}
        onCancel={() => setCaseToDelete(null)}
      />

      {/* AI Analysis Loading Modal Overlay */}
      <AiLoadingModal
        isOpen={isAnalyzing}
        fileName={attachedFile?.name}
        userPrompt={promptText}
        progressMessage={analysisProgress}
      />

      {/* HEADER (DESKTOP & MOBILE RESPONSIVE) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/60">
        <div className="h-16 w-full px-4 sm:px-6 flex items-center justify-between">
          {/* Left Actions & Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open Mobile Menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-[#0F172A] text-amber-400 border border-slate-800">
                <span className="material-symbols-outlined text-[20px]">balance</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">
                JurisAI
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={`px-4 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                activeTab === "home"
                  ? "bg-[#4f46e5] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-1.5 rounded-lg transition-all text-xs font-semibold ${
                activeTab === "profile"
                  ? "bg-[#4f46e5] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              Profile
            </button>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              aria-label="Notifications"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-2 ring-indigo-200 overflow-hidden shadow-sm focus:outline-none"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold">{user.name?.charAt(0) || "U"}</span>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-[#0F172A] truncate">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER SIDEBAR DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Panel */}
          <aside className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 transition-transform duration-300">
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-amber-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">balance</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-[#0F172A]">JurisAI</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Legal Assistant
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  Consultation History
                </span>
                <span className="text-indigo-600 font-semibold text-[11px]">
                  {historyCases.length} Total
                </span>
              </div>

              <div className="space-y-2">
                {isLoadingHistory ? (
                  <div className="p-4 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] animate-spin text-indigo-500">refresh</span>
                    <span>Loading history...</span>
                  </div>
                ) : historyCases.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No previous consultations yet. Upload a document to begin!
                  </div>
                ) : (
                  historyCases.map((c) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-start justify-between gap-2 transition-colors group"
                    >
                      <Link
                        href={`/case/${c._id}`}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className="flex items-start gap-3 min-w-0 flex-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]">
                            {getDocIcon(c.documentType || c.fileName)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-[#0F172A] group-hover:text-indigo-600 transition-colors truncate">
                            {c.documentTitle || c.fileName}
                          </p>
                          <p className="text-slate-500 truncate text-[11px]">
                            {c.risksCount} Flagged Items • {c.documentType}
                          </p>
                          <span className="text-[10px] text-indigo-600 font-medium mt-1 block">View Case Analysis →</span>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCaseToDelete(c);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                        title="Delete consultation"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Actions &amp; Settings
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200/60 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  {userName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-xs text-[#0F172A]">{user.name}</p>
                  <p className="text-[11px] text-slate-500">Pro Bono Plan</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP ASIDE SIDEBAR */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-72 bg-white z-40 flex flex-col justify-between border-r border-slate-200/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-transform duration-300 ease-in-out hidden md:flex ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-[268px]"
        }`}
      >
        {/* Toggle Button on the right edge */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-white border border-slate-200/90 shadow-md text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center justify-center z-50 transition-all cursor-pointer hover:scale-110 active:scale-95"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSidebarOpen ? "chevron_left" : "chevron_right"}
          </span>
        </button>

        <div className="p-4 flex flex-col gap-4 overflow-hidden h-full">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#0F172A]">History</span>
            <div className="flex items-center gap-1">
              <button
                className="flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                type="button"
                title="Filter history"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPromptText("");
              setAttachedFile(null);
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shadow-indigo-500/10 active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span className="truncate">New Legal Consultation</span>
          </button>

          {/* History list */}
          <nav className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {isLoadingHistory ? (
              <div className="p-4 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[20px] animate-spin text-indigo-500">refresh</span>
                <span>Loading history...</span>
              </div>
            ) : historyCases.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs leading-relaxed">
                No previous consultations yet. Upload a document to start!
              </div>
            ) : (
              <>
                {groupedHistory.today.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Today
                    </span>
                    <div className="space-y-1">
                      {groupedHistory.today.map((c) => (
                        <div
                          key={c._id}
                          className="flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                        >
                          <Link
                            className="flex items-center gap-2.5 min-w-0 flex-1"
                            href={`/case/${c._id}`}
                          >
                            <span className="material-symbols-outlined text-[16px] text-indigo-600 shrink-0">
                              {getDocIcon(c.documentType || c.fileName)}
                            </span>
                            <span className="truncate font-medium">{c.documentTitle || c.fileName}</span>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCaseToDelete(c);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition-all shrink-0"
                            title="Delete consultation"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {groupedHistory.yesterday.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Yesterday
                    </span>
                    <div className="space-y-1">
                      {groupedHistory.yesterday.map((c) => (
                        <div
                          key={c._id}
                          className="flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                        >
                          <Link
                            className="flex items-center gap-2.5 min-w-0 flex-1"
                            href={`/case/${c._id}`}
                          >
                            <span className="material-symbols-outlined text-[16px] text-blue-600 shrink-0">
                              {getDocIcon(c.documentType || c.fileName)}
                            </span>
                            <span className="truncate font-medium">{c.documentTitle || c.fileName}</span>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCaseToDelete(c);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition-all shrink-0"
                            title="Delete consultation"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {groupedHistory.past7Days.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Past 7 Days
                    </span>
                    <div className="space-y-1">
                      {groupedHistory.past7Days.map((c) => (
                        <div
                          key={c._id}
                          className="flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                        >
                          <Link
                            className="flex items-center gap-2.5 min-w-0 flex-1"
                            href={`/case/${c._id}`}
                          >
                            <span className="material-symbols-outlined text-[16px] text-slate-500 shrink-0">
                              {getDocIcon(c.documentType || c.fileName)}
                            </span>
                            <span className="truncate font-medium">{c.documentTitle || c.fileName}</span>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCaseToDelete(c);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition-all shrink-0"
                            title="Delete consultation"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {groupedHistory.older.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                      Older
                    </span>
                    <div className="space-y-1">
                      {groupedHistory.older.map((c) => (
                        <div
                          key={c._id}
                          className="flex items-center justify-between gap-1 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                        >
                          <Link
                            className="flex items-center gap-2.5 min-w-0 flex-1"
                            href={`/case/${c._id}`}
                          >
                            <span className="material-symbols-outlined text-[16px] text-slate-500 shrink-0">
                              {getDocIcon(c.documentType || c.fileName)}
                            </span>
                            <span className="truncate font-medium">{c.documentTitle || c.fileName}</span>
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setCaseToDelete(c);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-100/70 transition-all shrink-0"
                            title="Delete consultation"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Legal Aid Tier Card */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/60 rounded-b-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A]">Legal Aid Tier: Pro Bono</span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">
              verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            24 / 50 AI consultations utilized this billing period.
          </p>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#4f46e5] rounded-full w-[48%]" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div
        className={`pt-16 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:pl-72" : "md:pl-6"
        }`}
      >
        <main className="w-full bg-[#F8FAFC] min-h-[calc(100vh-4rem)] p-4 sm:p-8 flex flex-col items-center justify-center relative">
          {/* Subtle Ambient Glow for Mobile */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-indigo-500/10 via-slate-100 to-transparent rounded-full blur-3xl pointer-events-none sm:hidden" />

          <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center my-auto py-4 sm:py-8 text-center relative z-10">
            {/* Welcome Emblem & Title */}
            <div className="flex flex-col items-center text-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-md sm:shadow-sm ring-1 ring-indigo-200/50 transition-transform hover:scale-105">
                <span className="material-symbols-outlined text-[30px] sm:text-[26px]">
                  balance
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide uppercase">
                Good afternoon, {userName}
              </p>
              <h1 className="text-2xl sm:text-4xl text-[#0F172A] tracking-tight font-extrabold leading-tight max-w-[340px] sm:max-w-none">
                How can I assist your legal matter today?
              </h1>
            </div>

            {/* Conversational AI Input Card with React Bits BorderGlow */}
            <BorderGlow
              className="w-full max-w-2xl mb-6"
              edgeSensitivity={35}
              glowColor="240 85 65"
              backgroundColor="#ffffff"
              borderRadius={20}
              glowRadius={45}
              glowIntensity={2.0}
              coneSpread={36}
              animated={true}
              colors={["#4f46e5", "#00ff37ff", "#10b981"]}
            >
              <div className="w-full bg-white p-3.5 sm:p-4 text-left rounded-2xl">
                {/* Attached File Preview Chip */}
                {attachedFile && (
                  <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg mb-2 text-xs text-slate-700">
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[18px] text-indigo-600">
                        description
                      </span>
                      <span className="truncate font-medium">{attachedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-slate-400 hover:text-rose-600 ml-2 flex items-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                )}

                <textarea
                  id="legal-input-box"
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-[#0F172A] placeholder:text-slate-400 text-sm p-2 resize-none focus:outline-none"
                  placeholder="Ask a legal question, describe your situation, or attach documents for analysis..."
                />

                {/* Bottom Toolbar */}
                <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-100 mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-indigo-600">
                        attach_file
                      </span>
                      <span className="hidden sm:inline ml-1">
                        {attachedFile ? attachedFile.name : "Attach Document"}
                      </span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`min-h-[40px] px-5 rounded-xl text-white flex items-center justify-center gap-2 shadow-md transition-all text-xs font-semibold flex-shrink-0 disabled:opacity-90 active:scale-95 ${
                      isAnalyzing
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 shadow-indigo-500/30 animate-ai-shimmer"
                        : "bg-[#4f46e5] hover:bg-indigo-700 shadow-indigo-500/20"
                    }`}
                  >
                    {isAnalyzing ? (
                      <LatticeLoader
                        status="working"
                        label="Analyzing"
                        pattern="orbit"
                        grid={3}
                        shape="round"
                        color="#ffffff"
                        cellSize={4}
                        gap={1.5}
                        fontSize={12}
                        step={80}
                        showTimer={false}
                      />
                    ) : (
                      <>
                        <span>Analyze</span>
                        <span className="material-symbols-outlined text-[16px]">
                          north
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </BorderGlow>

            {/* Quick Legal Chips (Mobile 2x2 Grid + Desktop Pills) */}
            <div className="w-full max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-2 px-1 text-left sm:hidden">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recommended Inquiries
                </span>
              </div>

              {/* Mobile 2x2 Grid Pills */}
              <div className="grid grid-cols-2 gap-2.5 sm:hidden">
                <button
                  type="button"
                  onClick={() =>
                    handleChipClick(
                      "Review residential lease agreement for early termination penalties under California law"
                    )
                  }
                  className="text-left p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[76px] group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="material-symbols-outlined text-[18px] text-indigo-600">
                      home_work
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      arrow_forward
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A] truncate w-full">
                    Review lease agreement
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleChipClick(
                      "How do I dispute an improper 30-day notice to vacate without just cause?"
                    )
                  }
                  className="text-left p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[76px] group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="material-symbols-outlined text-[18px] text-indigo-600">
                      report_problem
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      arrow_forward
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A] truncate w-full">
                    Dispute notice to vacate
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleChipClick("Verify non-compete and severance clause enforceability")
                  }
                  className="text-left p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[76px] group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="material-symbols-outlined text-[18px] text-indigo-600">
                      badge
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      arrow_forward
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A] truncate w-full">
                    Severance clause check
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleChipClick(
                      "What are the statutory limits and steps to file in Small Claims court?"
                    )
                  }
                  className="text-left p-3 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-[76px] group active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="material-symbols-outlined text-[18px] text-indigo-600">
                      account_balance
                    </span>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      arrow_forward
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#0F172A] truncate w-full">
                    Small claims guidance
                  </span>
                </button>
              </div>

              {/* Desktop Horizontal Chips */}
              <div className="hidden sm:flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    handleChipClick(
                      "Review residential lease agreement for early termination penalties under California law"
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px] text-indigo-600">
                    description
                  </span>
                  <span>Review residential lease</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleChipClick(
                      "How do I dispute an improper 30-day notice to vacate without just cause?"
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px] text-indigo-600">
                    gavel
                  </span>
                  <span>Dispute notice to vacate</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleChipClick("Verify non-compete and severance clause enforceability")
                  }
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px] text-indigo-600">
                    assignment_turned_in
                  </span>
                  <span>Severance clause check</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleChipClick(
                      "What are the statutory limits and steps to file in Small Claims court?"
                    )
                  }
                  className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px] text-indigo-600">
                    calculate
                  </span>
                  <span>Small claims guidance</span>
                </button>
              </div>
            </div>

            {/* Legal Disclaimer & Shortcuts */}
            <div className="flex flex-col items-center gap-1 text-slate-400 text-xs text-center max-w-lg">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono">
                    Enter
                  </kbd>{" "}
                  to submit
                </span>
                <span>•</span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono">
                    Shift + Enter
                  </kbd>{" "}
                  for new line
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">
                JurisAI provides automated legal aid &amp; synthesized research. Not an attorney-client relationship or a formal legal representation substitute.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200/70 shadow-[0_-1px_12px_rgba(0,0,0,0.05)] md:hidden">
        <div className="flex justify-around items-center h-16 px-4">
          <button
            type="button"
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center min-w-[64px] h-11 transition-colors ${
              activeTab === "home" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">gavel</span>
            <span className="text-[10px] mt-0.5 font-semibold">Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center min-w-[64px] h-11 transition-colors ${
              activeTab === "profile" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">account_circle</span>
            <span className="text-[10px] mt-0.5 font-semibold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
