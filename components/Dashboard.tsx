"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import BorderGlow from "./BorderGlow";
import LatticeLoader from "./LatticeLoader";
import ThemeToggle from "./ThemeToggle";
import { SidebarCaseItem } from "./SidebarCaseItem";
import { useCaseList } from "@/hooks/useCaseList";

const AiLoadingModal = dynamic(() => import("./AiLoadingModal"), { ssr: false });
const DeleteConfirmModal = dynamic(() => import("./DeleteConfirmModal"), { ssr: false });

interface DashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const router = useRouter();
  const [promptText, setPromptText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerMounted, setIsMobileDrawerMounted] = useState(false);
  const [isMobileDrawerAnimating, setIsMobileDrawerAnimating] = useState(false);
  const [desktopSidebarAnimClass, setDesktopSidebarAnimClass] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Case history management custom hook
  const {
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
  } = useCaseList();

  // Mobile drawer animated open/close
  const openMobileDrawer = () => {
    setIsMobileDrawerMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsMobileDrawerAnimating(true);
      });
    });
  };

  const closeMobileDrawer = () => {
    setIsMobileDrawerAnimating(false);
    setTimeout(() => {
      setIsMobileDrawerMounted(false);
    }, 320);
  };

  // Desktop sidebar content animation
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (isSidebarOpen) {
      t = setTimeout(() => setDesktopSidebarAnimClass("sidebar-content-visible"), 80);
    } else {
      t = setTimeout(() => setDesktopSidebarAnimClass(""), 0);
    }
    return () => clearTimeout(t);
  }, [isSidebarOpen]);

  const handleChipClick = useCallback((text: string) => {
    setPromptText(text);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

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
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Analysis error:", err);
      setErrorMessage(err.message || "Something went wrong. Please try again.");
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
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] font-sans text-slate-800 dark:text-slate-100 antialiased min-h-screen pb-20 md:pb-0 w-full max-w-full overflow-x-hidden">
      {/* Error Toast */}
      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full px-4 animate-fade-in">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs font-medium">
            <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0" aria-hidden="true">error</span>
            <span className="flex-1">{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} aria-label="Close error notification" className="text-red-400 hover:text-red-700 shrink-0">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] max-w-md w-full px-4 animate-fade-in">
          <div className="bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-medium border border-emerald-700/60">
            <span className="material-symbols-outlined text-[18px] text-emerald-400 shrink-0" aria-hidden="true">check_circle</span>
            <span className="flex-1">{successToast}</span>
            <button type="button" onClick={() => setSuccessToast(null)} aria-label="Close success notification" className="text-emerald-300 hover:text-white shrink-0">
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
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
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/60 dark:border-slate-800 w-full max-w-full">
        <div className="h-16 w-full max-w-full px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Left Actions & Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            {/* Mobile Menu Drawer Toggle Button */}
            <button
              type="button"
              onClick={openMobileDrawer}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Open Mobile Menu"
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">menu</span>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[18px] text-white" aria-hidden="true">balance</span>
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0F172A] dark:text-slate-100">
                JurisAI
              </span>
            </Link>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="User Profile Menu"
                className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center ring-2 ring-indigo-200 dark:ring-indigo-900 overflow-hidden shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 shrink-0"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    sizes="32px"
                  />
                ) : (
                  <span className="text-xs font-bold">{user.name?.charAt(0) || "U"}</span>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-bold text-[#0F172A] dark:text-slate-100 truncate">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]" aria-hidden="true">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OVER SIDEBAR DRAWER */}
      {isMobileDrawerMounted && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            onClick={closeMobileDrawer}
            className="fixed inset-0 backdrop-blur-sm transition-all duration-300 ease-out"
            style={{
              backgroundColor: isMobileDrawerAnimating ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0)',
            }}
          />

          {/* Drawer Panel */}
          <aside
            className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              transform: isMobileDrawerAnimating ? 'translateX(0)' : 'translateX(-100%)',
              opacity: isMobileDrawerAnimating ? 1 : 0.5,
            }}
          >
            <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[20px] text-white" aria-hidden="true">balance</span>
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
                onClick={closeMobileDrawer}
                aria-label="Close Mobile Menu"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">close</span>
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 text-xs transition-all duration-300 ease-out"
              style={{
                opacity: isMobileDrawerAnimating ? 1 : 0,
                transform: isMobileDrawerAnimating ? 'translateX(0)' : 'translateX(-12px)',
                transitionDelay: isMobileDrawerAnimating ? '120ms' : '0ms',
              }}
            >
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
                    <span className="material-symbols-outlined text-[20px] animate-spin text-indigo-500" aria-hidden="true">refresh</span>
                    <span>Loading history...</span>
                  </div>
                ) : historyCases.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 text-xs">
                    No previous consultations yet. Upload a document to begin!
                  </div>
                ) : (
                  historyCases.map((c, idx) => (
                    <div
                      key={c._id}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-start justify-between gap-2 transition-all group"
                      style={{
                        opacity: isMobileDrawerAnimating ? 1 : 0,
                        transform: isMobileDrawerAnimating ? 'translateY(0)' : 'translateY(8px)',
                        transition: `opacity 280ms ease-out ${160 + idx * 60}ms, transform 280ms ease-out ${160 + idx * 60}ms`,
                      }}
                    >
                      <Link
                        href={`/case/${c._id}`}
                        onClick={closeMobileDrawer}
                        className="flex items-start gap-3 min-w-0 flex-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
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
                        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
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
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <div
              className="p-4 border-t border-slate-200/60 bg-slate-50 transition-all duration-200 ease-out"
              style={{
                opacity: isMobileDrawerAnimating ? 1 : 0,
                transform: isMobileDrawerAnimating ? 'translateY(0)' : 'translateY(6px)',
                transitionDelay: isMobileDrawerAnimating ? '200ms' : '0ms',
              }}
            >
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
        className={`fixed left-0 top-16 bottom-0 w-72 bg-white z-40 flex flex-col justify-between border-r border-slate-200/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)] hidden md:flex transition-all duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isSidebarOpen ? "translate-x-0 opacity-100" : "-translate-x-[268px] opacity-95"
        }`}
      >
        {/* Toggle Button on the right edge */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          className="absolute -right-3.5 top-5 w-7 h-7 rounded-full bg-white border border-slate-200/90 shadow-md text-slate-600 hover:text-indigo-600 hover:bg-slate-50 flex items-center justify-center z-50 transition-all cursor-pointer hover:scale-110 active:scale-95"
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            {isSidebarOpen ? "chevron_left" : "chevron_right"}
          </span>
        </button>

        <div className={`p-4 flex flex-col gap-4 overflow-hidden h-full sidebar-content ${desktopSidebarAnimClass}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#0F172A]">History</span>
            <div className="flex items-center gap-1">
              <button
                className="flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                type="button"
                aria-label="Filter history"
                title="Filter history"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">filter_list</span>
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
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
            <span className="truncate">New Legal Consultation</span>
          </button>

          {/* History list */}
          <nav className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {isLoadingHistory ? (
              <div className="p-4 text-center text-slate-600 dark:text-slate-300 text-xs flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[20px] animate-spin text-indigo-600 dark:text-indigo-400" aria-hidden="true">refresh</span>
                <span>Loading history...</span>
              </div>
            ) : historyCases.length === 0 ? (
              <div className="p-4 text-center text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                No previous consultations yet. Upload a document to start!
              </div>
            ) : (
              <>
                {groupedHistory.today.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
                      Today
                    </span>
                    <div className="space-y-1">
                      {groupedHistory.today.map((c) => (
                        <SidebarCaseItem
                          key={c._id}
                          item={c}
                          iconColorClass="text-indigo-600 dark:text-indigo-400"
                          onDelete={setCaseToDelete}
                          getDocIcon={getDocIcon}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {groupedHistory.yesterday.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
                      Yesterday
                    </span>
                    <div className="space-y-1">
                      {groupedHistory.yesterday.map((c) => (
                        <SidebarCaseItem
                          key={c._id}
                          item={c}
                          iconColorClass="text-blue-600 dark:text-blue-400"
                          onDelete={setCaseToDelete}
                          getDocIcon={getDocIcon}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {groupedHistory.past7Days.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
                      Past 7 Days
                    </span>
                    <div className="space-y-1">
                      {groupedHistory.past7Days.map((c) => (
                        <SidebarCaseItem
                          key={c._id}
                          item={c}
                          iconColorClass="text-slate-600 dark:text-slate-400"
                          onDelete={setCaseToDelete}
                          getDocIcon={getDocIcon}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {groupedHistory.older.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 px-1">
                      Older
                    </span>
                    <div className="space-y-1">
                      {groupedHistory.older.map((c) => (
                        <SidebarCaseItem
                          key={c._id}
                          item={c}
                          iconColorClass="text-slate-600 dark:text-slate-400"
                          onDelete={setCaseToDelete}
                          getDocIcon={getDocIcon}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <div
        className={`pt-16 min-h-screen transition-all duration-300 ease-in-out w-full max-w-full overflow-x-hidden ${
          isSidebarOpen ? "md:pl-72" : "md:pl-6"
        }`}
      >
        <main className="w-full max-w-full bg-[#F8FAFC] dark:bg-[#0F172A] min-h-[calc(100vh-4rem)] p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-x-hidden">
          {/* Subtle Ambient Glow for Mobile */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-indigo-500/10 via-slate-100 dark:via-slate-900/20 to-transparent rounded-full blur-3xl pointer-events-none sm:hidden" />

          <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center my-auto py-4 sm:py-8 text-center relative z-10">
            {/* Welcome Emblem & Title */}
            <div className="flex flex-col items-center text-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-12 sm:h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-md sm:shadow-sm ring-1 ring-indigo-200/50 dark:ring-indigo-500/30 transition-transform hover:scale-105">
                <span className="material-symbols-outlined text-[30px] sm:text-[26px]" aria-hidden="true">
                  balance
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                Good afternoon, {userName}
              </p>
              <h1 className="text-2xl sm:text-4xl text-[#0F172A] dark:text-slate-100 tracking-tight font-extrabold leading-tight max-w-[340px] sm:max-w-none">
                How can I assist your legal matter today?
              </h1>
            </div>

            {/* Conversational AI Input Card with React Bits BorderGlow */}
            <BorderGlow
              className="w-full max-w-2xl mb-6"
              edgeSensitivity={35}
              glowColor="240 85 65"
              backgroundColor="var(--border-glow-bg)"
              borderRadius={20}
              glowRadius={45}
              glowIntensity={2.0}
              coneSpread={36}
              animated={true}
              colors={["#4f46e5", "#00ff37ff", "#10b981"]}
            >
              <div className="w-full bg-white dark:bg-slate-800/95 p-3.5 sm:p-4 text-left rounded-2xl border border-transparent dark:border-slate-700/50">
                {/* Attached File Preview Chip */}
                {attachedFile && (
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700/60 border border-transparent dark:border-slate-600/50 px-3 py-1.5 rounded-lg mb-2 text-xs text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-[18px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
                        description
                      </span>
                      <span className="truncate font-medium">{attachedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      aria-label="Remove attached file"
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 ml-2 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-md"
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
                    </button>
                  </div>
                )}

                <label htmlFor="legal-input-box" className="sr-only">
                  Ask a legal question, describe your situation, or attach documents for analysis
                </label>
                <textarea
                  id="legal-input-box"
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Ask a legal question, describe your situation, or attach documents for analysis"
                  className="w-full bg-transparent text-[#0F172A] dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm p-2 resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                  placeholder="Ask a legal question, describe your situation, or attach documents for analysis..."
                />

                {/* Bottom Toolbar */}
                <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-100 dark:border-slate-700/60 mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Attach Document"
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors border border-transparent dark:border-slate-600/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <span className="material-symbols-outlined text-[20px] text-indigo-600 dark:text-indigo-400" aria-hidden="true">
                        attach_file
                      </span>
                      <span className="hidden sm:inline ml-1">
                        {attachedFile ? attachedFile.name : "Attach Document"}
                      </span>
                    </button>
                    <label htmlFor="dashboard-file-input" className="sr-only">
                      Upload legal document file
                    </label>
                    <input
                      type="file"
                      id="dashboard-file-input"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                      aria-label="Upload legal document file"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className={`min-h-[40px] px-5 rounded-xl text-white flex items-center justify-center gap-2 shadow-md transition-all text-xs font-semibold flex-shrink-0 disabled:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
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
                        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                    handleChipClick(
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
                    handleChipClick("Verify non-compete and severance clause enforceability")
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
                    handleChipClick(
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
                    handleChipClick(
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
                    handleChipClick(
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
                    handleChipClick("Verify non-compete and severance clause enforceability")
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
                    handleChipClick(
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

            {/* Legal Disclaimer & Shortcuts */}
            <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 text-xs text-center max-w-lg">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-transparent dark:border-slate-700 text-[10px] font-mono">
                    Enter
                  </kbd>{" "}
                  to submit
                </span>
                <span>•</span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-transparent dark:border-slate-700 text-[10px] font-mono">
                    Shift + Enter
                  </kbd>{" "}
                  for new line
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
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
            aria-label="Home"
            className={`flex flex-col items-center justify-center min-w-[64px] h-11 transition-colors ${
              activeTab === "home" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">gavel</span>
            <span className="text-[10px] mt-0.5 font-semibold">Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            aria-label="Profile"
            className={`flex flex-col items-center justify-center min-w-[64px] h-11 transition-colors ${
              activeTab === "profile" ? "text-indigo-600 font-bold" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">account_circle</span>
            <span className="text-[10px] mt-0.5 font-semibold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
