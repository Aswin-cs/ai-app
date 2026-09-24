"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import BorderGlow from "./BorderGlow";
import WhatIfMap from "./WhatIfMap";
import GlideSelect from "./GlideSelect";
import MemeVibeCheck from "./MemeVibeCheck";
import type { CaseDocument, RiskItem as RiskItemType } from "@/types/case.types";

interface AiFollowupResponse {
  answer: string;
  keyPoints: string[];
  confidence: "high" | "medium" | "low";
  relatedClauses: string[];
  disclaimer: boolean;
}

interface ConversationMessage {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface CaseAnalysisProps {
  caseId: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function CaseAnalysis({ caseId, user }: CaseAnalysisProps) {
  const [caseData, setCaseData] = useState<CaseDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeRiskId, setActiveRiskId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [promptText, setPromptText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [documentSearch, setDocumentSearch] = useState<string>("");
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [showMeme, setShowMeme] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const prevCaseStatusRef = useRef<string | null>(null);

  // Web Audio API Synthesized Completion Chime (C5 -> E5 -> G5)
  const playCompletionSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch (e) {
      console.warn("Could not play completion sound:", e);
    }
  }, []);

  // Sync sound preference from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jurisai_sound_enabled");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    } catch (e) {}
  }, []);

  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jurisai_sound_enabled", String(next));
      } catch (e) {}
      if (next) {
        playCompletionSound();
      }
      return next;
    });
  };

  // Follow-up conversation state
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [latestAiResponse, setLatestAiResponse] = useState<AiFollowupResponse | null>(null);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState<boolean>(false);
  const aiResponseSectionRef = useRef<HTMLDivElement>(null);

  // Sync showMeme with localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jurisai_show_meme");
      if (saved !== null) {
        setShowMeme(saved === "true");
      }
    } catch (e) {
      console.warn("Could not read meme toggle preference from localStorage");
    }
  }, []);

  const handleToggleMeme = () => {
    setShowMeme((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jurisai_show_meme", String(next));
      } catch (e) {}
      return next;
    });
  };

  const docViewportRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLDivElement>(null);

  // Fetch case data from API on mount
  useEffect(() => {
    async function fetchCase() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/case/${caseId}`);
        const contentType = res.headers.get("content-type") || "";

        let data: any = null;
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          if (!res.ok) {
            throw new Error(`Server error (${res.status}): ${res.statusText || "Unable to load case"}`);
          }
          throw new Error("Received an invalid non-JSON response from server.");
        }

        if (!res.ok) {
          throw new Error(data?.error || "Failed to load case data.");
        }

        setCaseData(data.case);
      } catch (err: any) {
        setFetchError(err.message || "Failed to load case.");
      } finally {
        setIsLoading(false);
      }
    }

    // Only fetch if caseId looks like a MongoDB ObjectId
    if (caseId.match(/^[0-9a-fA-F]{24}$/)) {
      fetchCase();
    } else {
      setIsLoading(false);
      setFetchError(null);
    }
  }, [caseId]);

  const analysis = caseData?.analysis;
  const risks: RiskItemType[] = analysis?.risks || [];
  const documentTitle = analysis?.documentTitle || caseData?.fileName || "Document Analysis";

  const filteredRisks = risks.filter((r) => {
    if (filterSeverity === "All") return true;
    return r.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  const jumpToRisk = (riskId: string) => {
    setActiveRiskId(riskId);
    const el = document.getElementById(`risk-${riskId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 70));

  // Fetch conversation history on mount
  useEffect(() => {
    if (!caseId.match(/^[0-9a-fA-F]{24}$/)) return;
    async function loadConversation() {
      try {
        const res = await fetch(`/api/case/${caseId}/followup`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setConversationMessages(data.messages);
          }
        }
      } catch (err) {
        console.warn("Could not load conversation history:", err);
      }
    }
    loadConversation();
  }, [caseId]);

  // Play completion chime when case processing finishes
  useEffect(() => {
    if (caseData?.status === "completed" && prevCaseStatusRef.current && prevCaseStatusRef.current !== "completed") {
      if (soundEnabled) {
        playCompletionSound();
      }
    }
    if (caseData?.status) {
      prevCaseStatusRef.current = caseData.status;
    }
  }, [caseData?.status, soundEnabled, playCompletionSound]);

  const handleExecutePrompt = async () => {
    if (!promptText.trim() || isAnalyzing) return;

    const question = promptText.trim();
    setIsAnalyzing(true);
    setPromptText("");
    setFollowupError(null);
    setLatestAiResponse(null);

    // Optimistically add user message
    const userMsg: ConversationMessage = {
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };
    setConversationMessages((prev) => [...prev, userMsg]);

    // Scroll AI response section into view
    setTimeout(() => {
      aiResponseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    try {
      const res = await fetch(`/api/case/${caseId}/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get AI response.");
      }

      if (data.success && data.response) {
        const aiResponse: AiFollowupResponse = data.response;
        setLatestAiResponse(aiResponse);

        // Add assistant message to conversation
        const assistantMsg: ConversationMessage = {
          role: "assistant",
          content: JSON.stringify(aiResponse),
          timestamp: new Date().toISOString(),
        };
        setConversationMessages((prev) => [...prev, assistantMsg]);

        // Play completion audio chime
        if (soundEnabled) {
          playCompletionSound();
        }

        // Scroll AI response section into view
        setTimeout(() => {
          aiResponseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (err: any) {
      console.error("Follow-up error:", err);
      setFollowupError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Server-side PDF Export Handler via /api/export-pdf (Puppeteer)
  const handleExportPDF = useCallback(async () => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      const payload = {
        documentTitle,
        documentType: analysis?.documentType || "Legal Document",
        jurisdiction: analysis?.jurisdiction || "",
        effectiveDate: analysis?.effectiveDate || "",
        overallRiskScore: analysis?.overallRiskScore ?? 0,
        summary: analysis?.summary || "",
        parties: analysis?.parties || [],
        risks: risks || [],
        fileSummary: caseData?.fileSummary || "",
      };

      const res = await fetch("/api/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status}) generating PDF.`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const safeTitle = (documentTitle || "Lease_Analysis_Summary")
        .replace(/[^a-zA-Z0-9\s-]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 50);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle || "Lease_Analysis"}_Summary.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("PDF export error:", err);
      alert(err.message || "Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, documentTitle, analysis, risks, caseData]);

  // Severity color helpers
  const severityDotColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "warning": return "bg-amber-500";
      default: return "bg-slate-400";
    }
  };

  const severityTextColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600";
      case "warning": return "text-amber-600";
      default: return "text-slate-500";
    }
  };

  const severityBgColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-50/60";
      case "warning": return "bg-amber-50/60";
      default: return "bg-slate-50/60";
    }
  };

  const severityActiveBg = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100/90 ring-2 ring-red-400 shadow-sm";
      case "warning": return "bg-amber-100/80 ring-2 ring-amber-400 shadow-sm";
      default: return "bg-indigo-50/80 ring-2 ring-indigo-300 shadow-sm";
    }
  };

  const severityBadgeColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-700 bg-red-100";
      case "warning": return "text-amber-700 bg-amber-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  // Risk score color
  const riskScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-amber-600";
    return "text-emerald-600";
  };

  const riskScoreLabel = (score: number) => {
    if (score >= 70) return "High Risk";
    if (score >= 40) return "Moderate Risk";
    return "Low Risk";
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-[28px] text-indigo-600">balance</span>
          </div>
          <div className="text-sm font-semibold text-slate-700">Loading case analysis...</div>
          <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] font-sans">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px] text-red-600">error</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Unable to load case</h2>
          <p className="text-sm text-slate-600">{fetchError}</p>
          <Link href="/" className="px-5 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold transition-colors">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Processing state
  if (caseData?.status === "processing") {
    return (
      <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px] text-indigo-600 animate-spin">refresh</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Analyzing your document...</h2>
          <p className="text-sm text-slate-500 max-w-sm text-center">JurisAI is processing &quot;{caseData.fileName}&quot;. This may take a moment.</p>
          <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (caseData?.status === "failed") {
    return (
      <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[#F8FAFC] text-[#0F172A] font-sans">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px] text-red-600">warning</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">Analysis Failed</h2>
          <p className="text-sm text-slate-600">{caseData.errorMessage || "The AI analysis could not be completed. Please try uploading the document again."}</p>
          <Link href="/" className="px-5 py-2 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white text-xs font-semibold transition-colors">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  const overallRiskScore = analysis?.overallRiskScore ?? 0;
  const confidenceScore = analysis?.confidenceScore ?? 0;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Toast Notification for Share */}
      {copiedShare && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-[16px] text-[#10B981]">check_circle</span>
          Case link copied to clipboard!
        </div>
      )}



      {/* Header Bar */}
      <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <div className="h-16 w-full px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">J</div>
              <span className="font-bold text-lg tracking-tight text-[#0F172A]">JurisAI</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

            <nav aria-label="Breadcrumbs" className="hidden md:flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Link href="/" className="hover:text-slate-900 transition-colors">Dashboard</Link>
              <span className="material-symbols-outlined text-slate-400 text-[14px]">chevron_right</span>
              <span className="text-slate-900 font-semibold truncate max-w-[240px]">{documentTitle}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Risk Score Badge */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${overallRiskScore >= 70 ? 'bg-red-50 border-red-200/60' : overallRiskScore >= 40 ? 'bg-amber-50 border-amber-200/60' : 'bg-emerald-50 border-emerald-200/60'}`}>
              <span className={`w-2 h-2 rounded-full ${overallRiskScore >= 70 ? 'bg-red-500' : overallRiskScore >= 40 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
              <span className={`text-[11px] font-semibold ${riskScoreColor(overallRiskScore)}`}>
                Risk: {overallRiskScore}/100
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Sound Toggle Button */}
              <button
                onClick={handleToggleSound}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs ${
                  soundEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
                }`}
                type="button"
                title={soundEnabled ? "Completion sound enabled (Click to mute)" : "Completion sound muted (Click to enable)"}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {soundEnabled ? "volume_up" : "volume_off"}
                </span>
                <span className="hidden sm:inline">{soundEnabled ? "Sound On" : "Muted"}</span>
              </button>

              {/* Meme Toggle Button */}
              <button
                onClick={handleToggleMeme}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-xs ${
                  showMeme
                    ? "bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 border-purple-200/80 hover:border-purple-300"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                type="button"
                title={showMeme ? "Hide Legal Vibe Check meme" : "Show Legal Vibe Check meme"}
              >
                <span className="material-symbols-outlined text-[16px] text-purple-600">
                  {showMeme ? "visibility" : "visibility_off"}
                </span>
                <span className="hidden sm:inline">Vibe Check</span>
              </button>

              <button
                onClick={() => setShowWhatIf(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                <span>What-If Map</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {isExporting ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                )}
                <span className="hidden sm:inline">{isExporting ? "Exporting..." : "Export PDF"}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">share</span>
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="w-full pt-16 flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden h-[calc(100vh-4rem)]">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative h-[calc(100vh-7.5rem)] min-h-0">

          {/* LEFT COLUMN: Risk Ledger */}
          <aside className="lg:col-span-3 h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden">
            <div className="p-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-slate-900 tracking-tight">Risk Ledger</h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px] font-medium">
                    {filteredRisks.length} Items
                  </span>
                </div>
                <GlideSelect
                  options={[
                    { value: "All", label: "All Risks", tag: `${risks.length}` },
                    { value: "critical", label: "Critical", tag: `${risks.filter(r => r.severity === 'critical').length}` },
                    { value: "warning", label: "Warning", tag: `${risks.filter(r => r.severity === 'warning').length}` },
                    { value: "note", label: "Notes", tag: `${risks.filter(r => r.severity !== 'critical' && r.severity !== 'warning').length}` },
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
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                AI-identified statutory flags &amp; compliance items
              </p>
            </div>

            {/* Risk Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredRisks.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-[32px] mb-2 block">verified</span>
                  No risks found in this category.
                </div>
              )}
              {filteredRisks.map((item) => {
                const isActive = activeRiskId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => jumpToRisk(item.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${isActive
                      ? "bg-indigo-50/80 border-indigo-300 shadow-xs"
                      : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${severityDotColor(item.severity)}`}></span>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-medium leading-snug transition-colors ${isActive ? "text-indigo-900 font-semibold" : "text-slate-800 group-hover:text-indigo-600"}`}>
                        {item.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono flex-wrap">
                        <span className={`font-semibold capitalize ${severityTextColor(item.severity)}`}>
                          {item.severity}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 truncate max-w-[120px]">{item.clause}</span>
                        {item.statuteReference && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-indigo-600 text-[10px] truncate max-w-[130px]" title={item.statuteReference}>
                              {item.statuteReference}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* CENTER COLUMN: Document Viewer */}
          <section className="lg:col-span-6 h-full flex flex-col bg-slate-100/70 relative overflow-hidden">
            {/* Viewer Controls Toolbar */}
            <div className="w-full bg-white px-5 py-2 flex items-center justify-between border-b border-slate-200 select-none text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="font-mono text-slate-800 font-medium px-1">
                    {caseData?.fileName || "Document"}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex items-center gap-1 text-slate-600">
                  <button onClick={handleZoomOut} className="p-1 rounded hover:bg-slate-100 transition-colors" title="Zoom Out">
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="font-mono text-[12px] px-1 text-slate-700 min-w-[36px] text-center">{zoomLevel}%</span>
                  <button onClick={handleZoomIn} className="p-1 rounded hover:bg-slate-100 transition-colors" title="Zoom In">
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-500">
                {showSearchBox ? (
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-300">
                    <input
                      type="text"
                      placeholder="Search text..."
                      value={documentSearch}
                      onChange={(e) => setDocumentSearch(e.target.value)}
                      className="bg-transparent text-xs outline-none w-28 text-slate-800"
                    />
                    <button onClick={() => setShowSearchBox(false)} className="text-slate-400 hover:text-slate-600">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setShowSearchBox(true)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Search document">
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Content Viewport */}
            <div
              ref={docViewportRef}
              className="flex-1 overflow-y-scroll pdf-scrollbar p-4 sm:p-6 lg:p-8 flex justify-center bg-[#F1F5F9] scroll-smooth pr-3 h-full min-h-0"
            >
              <article
                ref={articleRef}
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
                className="w-full max-w-3xl lg:max-w-4xl bg-white min-h-full h-fit shadow-[0_4px_24px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.04)] rounded-2xl text-slate-900 select-text border border-slate-200/80 border-t-4 border-t-indigo-600 transition-transform duration-200 mb-12"
              >
                {/* Document Header — Title Block */}
                <div className="px-10 pt-10 pb-7 border-b border-slate-200/80">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="font-mono text-[10px] text-slate-400 tracking-[0.15em] uppercase shrink-0 px-3">
                      {analysis?.documentType || "Legal Document"}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <h1 className="font-extrabold text-[18px] tracking-tight text-[#0F172A] uppercase text-center leading-snug">
                    {documentTitle}
                  </h1>
                  <div className="flex items-center justify-center gap-3 mt-3 text-[11px] text-slate-500 font-mono">
                    {analysis?.jurisdiction && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">location_on</span>
                        {analysis.jurisdiction}
                      </span>
                    )}
                    {analysis?.effectiveDate && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-slate-400">calendar_today</span>
                          {analysis.effectiveDate}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="px-10 py-8 space-y-8">
                  {/* Parties Table */}
                  {analysis?.parties && analysis.parties.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">group</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Parties to the Agreement</span>
                      </div>
                      <div className="bg-slate-50/80 rounded-xl border border-slate-100 overflow-hidden">
                        {analysis.parties.map((p, i) => (
                          <div key={i} className={`flex items-center gap-4 px-4 py-2.5 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-20 shrink-0">{p.role}</span>
                            <span className="text-xs font-semibold text-[#0F172A]">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Synthesis Summary */}
                  {analysis?.summary && (
                    <div className="relative">
                      <div className="absolute -left-[1px] top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-indigo-500 to-indigo-300" />
                      <div className="pl-5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="material-symbols-outlined text-[15px] text-indigo-500">auto_awesome</span>
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-500">AI Synthesis</span>
                        </div>
                        <p className="text-[13px] leading-[1.75] text-slate-700 font-[Inter]">{analysis.summary}</p>
                      </div>
                    </div>
                  )}

                  {/* Section Divider */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 px-2">Flagged Clauses</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  {/* Risk Clause Cards */}
                  <div className="space-y-5">
                    {risks.map((risk) => {
                      const isActive = activeRiskId === risk.id;

                      const barColor =
                        risk.severity === "critical"
                          ? "bg-red-600"
                          : risk.severity === "warning"
                            ? "bg-amber-500"
                            : "bg-slate-400";

                      const cardBg = isActive
                        ? risk.severity === "critical"
                          ? "bg-red-50/70 border-red-300 shadow-md ring-2 ring-red-500/20"
                          : risk.severity === "warning"
                            ? "bg-amber-50/60 border-amber-300 shadow-md ring-2 ring-amber-500/20"
                            : "bg-indigo-50/60 border-indigo-300 shadow-md ring-2 ring-indigo-500/20"
                        : risk.severity === "critical"
                          ? "bg-red-50/30 border-slate-200/90 shadow-xs hover:border-red-300"
                          : risk.severity === "warning"
                            ? "bg-amber-50/20 border-slate-200/90 shadow-xs hover:border-amber-300"
                            : "bg-slate-50/50 border-slate-200/90 shadow-xs hover:border-slate-300";

                      const highlightColor =
                        risk.severity === "critical"
                          ? "bg-red-100/70 border-red-200/80 text-red-950"
                          : risk.severity === "warning"
                            ? "bg-amber-100/60 border-amber-200/80 text-amber-950"
                            : "bg-white border-slate-200/80 text-slate-900";

                      const badgeBg =
                        risk.severity === "critical"
                          ? "bg-red-600 text-white shadow-xs"
                          : risk.severity === "warning"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-slate-600 text-white shadow-xs";

                      return (
                        <div
                          key={risk.id}
                          id={`risk-${risk.id}`}
                          className={`flex rounded-xl border ${cardBg} transition-all duration-300 overflow-hidden`}
                        >
                          {/* Left Straight Severity Indicator Bar */}
                          <div className={`w-1.5 shrink-0 ${barColor}`} />

                          <div className="flex-1 min-w-0">
                            {/* Clause Card Header */}
                            <div className="px-5 pt-4 pb-3 border-b border-slate-100/80">
                              {/* Row 1: Clause indicator tag + Severity pill badge */}
                              <div className="flex items-center justify-between gap-3 mb-2">
                                <span className="font-mono text-[10px] font-bold text-slate-600 uppercase tracking-wider bg-slate-100 border border-slate-200/70 px-2.5 py-0.5 rounded-md truncate max-w-[360px]">
                                  {risk.clause}
                                </span>
                                <span
                                  className={`font-mono text-[9px] font-bold px-2.5 py-1 rounded-full leading-none uppercase tracking-wider shrink-0 ${badgeBg}`}
                                >
                                  {risk.severity}
                                </span>
                              </div>

                              {/* Row 2: Main Risk Title */}
                              <h4 className="font-[Plus_Jakarta_Sans] font-bold text-sm text-[#0F172A] leading-snug">
                                {risk.title}
                              </h4>

                              {/* Row 3: Statute Reference (if present) */}
                              {risk.statuteReference && (
                                <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-slate-600 bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-200/70 w-full sm:w-fit">
                                  <span className="material-symbols-outlined text-[15px] text-indigo-600 shrink-0">
                                    gavel
                                  </span>
                                  <span className="font-mono text-[10px] font-medium text-slate-700 leading-tight">
                                    {risk.statuteReference}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Source Text — Verbatim Quote */}
                            <div className="px-5 pt-3.5 pb-3">
                              <div className={`rounded-xl border px-4 py-3 ${highlightColor}`}>
                                <div className="flex items-start gap-2.5">
                                  <span className="material-symbols-outlined text-[16px] text-slate-400 mt-0.5 shrink-0 select-none">
                                    format_quote
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                                      Document Excerpt
                                    </span>
                                    <p className="text-[12px] leading-[1.7] font-serif font-medium italic">
                                      &ldquo;{risk.sourceText}&rdquo;
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Legal Analysis Explanation */}
                            <div className="px-5 pb-4">
                              <div className="flex items-start gap-2.5 bg-white/90 rounded-xl px-4 py-3 border border-slate-200/70">
                                <span className="material-symbols-outlined text-[16px] text-indigo-600 mt-0.5 shrink-0 select-none">
                                  info
                                </span>
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1 font-mono">
                                    Statutory Explanation
                                  </span>
                                  <p className="text-[12px] leading-[1.65] text-slate-700 font-[Inter]">
                                    {risk.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Original Document Text / Summary */}
                  {caseData?.fileSummary && !caseData.fileSummary.startsWith("[Binary file:") && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-indigo-600">article</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Source Document Summary
                          </span>
                        </div>
                        <button
                          onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-2xs"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isSummaryExpanded ? "unfold_less" : "unfold_more"}
                          </span>
                          <span>{isSummaryExpanded ? "Shrink Summary" : "Expand Summary"}</span>
                        </button>
                      </div>

                      <div className={`relative transition-all duration-300 ease-in-out ${isSummaryExpanded ? "max-h-none overflow-visible" : "max-h-[220px] overflow-hidden"}`}>
                        <div className="text-[12px] leading-[1.8] text-slate-700 whitespace-pre-wrap font-serif bg-[#FAFBFC] p-5 rounded-xl border border-slate-200/80 shadow-inner">
                          {caseData.fileSummary.substring(0, 8000)}
                          {caseData.fileSummary.length > 8000 && (
                            <span className="text-slate-400 italic block mt-3 text-[11px] font-sans">— Document content truncated for display —</span>
                          )}
                        </div>
                        {!isSummaryExpanded && (
                          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FAFBFC] via-[#FAFBFC]/90 to-transparent pointer-events-none rounded-b-xl flex items-end justify-center pb-2">
                            <span className="text-[11px] font-medium text-slate-500 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs">
                              Click &quot;Expand Summary&quot; to view full text
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* INLINE JURISAI FOLLOW-UP & AI RESPONSES SECTION */}
                  <div className="mt-8 pt-6 border-t-2 border-indigo-100/80" ref={aiResponseSectionRef}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                            JurisAI Legal Assistant
                            {conversationMessages.filter(m => m.role === "user").length > 0 && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 font-bold">
                                {conversationMessages.filter(m => m.role === "user").length} Question{conversationMessages.filter(m => m.role === "user").length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </h3>
                          <p className="text-[11px] text-slate-500">Ask follow-up questions or request clause clarifications below</p>
                        </div>
                      </div>
                    </div>

                    {/* Conversation Feed */}
                    <div className="space-y-4">
                      {/* Empty State */}
                      {conversationMessages.length === 0 && !isAnalyzing && (
                        <div className="p-6 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 text-center">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                            <span className="material-symbols-outlined text-[20px]">chat</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700">Have questions about this document?</p>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">Use the prompt bar at the bottom to ask JurisAI to analyze risk clauses, summarize key terms, or draft counter-proposals.</p>
                        </div>
                      )}

                      {/* Messages rendering loop */}
                      {conversationMessages.map((msg, idx) => {
                        if (msg.role === "user") {
                          return (
                            <div key={idx} className="bg-slate-100/80 border border-slate-200/70 rounded-xl p-3.5 flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {user?.name?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[11px] font-bold text-slate-800">You</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-800 font-medium leading-relaxed">{msg.content}</p>
                              </div>
                            </div>
                          );
                        }

                        // Assistant message
                        let aiData: AiFollowupResponse | null = null;
                        try {
                          aiData = JSON.parse(msg.content);
                        } catch (e) {}

                        const answerText = aiData ? aiData.answer : msg.content;
                        const keyPoints: string[] = aiData?.keyPoints || [];
                        const clauses: string[] = aiData?.relatedClauses || [];

                        return (
                          <div key={idx} className="bg-white border border-indigo-100/80 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-200">
                            {/* Header */}
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center text-[12px] shadow-xs">
                                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                </div>
                                <span className="font-bold text-xs text-slate-900">JurisAI Response</span>
                              </div>
                              {aiData?.confidence && (
                                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                                  aiData.confidence === "high"
                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                    : aiData.confidence === "medium"
                                      ? "text-amber-700 bg-amber-50 border-amber-200"
                                      : "text-rose-700 bg-rose-50 border-rose-200"
                                }`}>
                                  ● {aiData.confidence.toUpperCase()} CONFIDENCE
                                </span>
                              )}
                            </div>

                            {/* Answer Body */}
                            <div className="text-xs leading-[1.8] text-slate-700 space-y-2">
                              {answerText.split("\n").map((line, lIdx) => {
                                const trimmed = line.trim();
                                if (!trimmed) return <br key={lIdx} />;

                                if (trimmed.startsWith("## ")) {
                                  return (
                                    <h4 key={lIdx} className="text-xs font-bold text-slate-900 mt-3 mb-1 border-l-2 border-indigo-600 pl-2 flex items-center gap-1.5">
                                      {trimmed.replace(/^##\s*/, "")}
                                    </h4>
                                  );
                                }

                                if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
                                  return (
                                    <div key={lIdx} className="flex items-start gap-2 ml-1 my-0.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></span>
                                      <span
                                        className="text-xs text-slate-700"
                                        dangerouslySetInnerHTML={{
                                          __html: trimmed.replace(/^[-•]\s*/, "").replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
                                        }}
                                      />
                                    </div>
                                  );
                                }

                                if (/^\d+\.\s/.test(trimmed)) {
                                  const num = trimmed.match(/^(\d+)\./)?.[1];
                                  return (
                                    <div key={lIdx} className="flex items-start gap-2 ml-1 my-0.5">
                                      <span className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">
                                        {num}
                                      </span>
                                      <span
                                        className="text-xs text-slate-700"
                                        dangerouslySetInnerHTML={{
                                          __html: trimmed.replace(/^\d+\.\s*/, "").replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
                                        }}
                                      />
                                    </div>
                                  );
                                }

                                return (
                                  <p
                                    key={lIdx}
                                    className="text-xs leading-[1.8] text-slate-700 my-1"
                                    dangerouslySetInnerHTML={{
                                      __html: trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
                                    }}
                                  />
                                );
                              })}
                            </div>

                            {/* Key Takeaways */}
                            {keyPoints.length > 0 && (
                              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 mb-2">
                                  <span className="material-symbols-outlined text-[15px] text-emerald-600">task_alt</span>
                                  Key Takeaways
                                </div>
                                <ul className="space-y-1">
                                  {keyPoints.map((point: string, pIdx: number) => (
                                    <li key={pIdx} className="flex items-start gap-2 text-xs text-emerald-950">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                                      <span>{point}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Related Clauses */}
                            {clauses.length > 0 && (
                              <div className="mt-3 flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Referenced:</span>
                                {clauses.map((clause, cIdx) => (
                                  <span key={cIdx} className="text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                                    {clause}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Disclaimer & Actions */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px] text-amber-500">info</span>
                                AI legal analysis based on uploaded document context.
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(answerText);
                                }}
                                className="hover:text-indigo-600 flex items-center gap-1 transition-colors font-medium"
                                title="Copy response text"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[12px]">content_copy</span>
                                Copy Response
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Inline Loader when isAnalyzing */}
                      {isAnalyzing && (
                        <div className="p-5 rounded-2xl bg-white border border-indigo-200 shadow-xs flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                          </div>
                          <p className="text-xs font-semibold text-slate-700">JurisAI is analyzing document context...</p>
                        </div>
                      )}

                      {/* Error state */}
                      {followupError && (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                          <span className="material-symbols-outlined text-rose-600 text-[18px] mt-0.5 shrink-0">error</span>
                          <div>
                            <p className="text-xs font-bold text-rose-900">Analysis Error</p>
                            <p className="text-[11px] text-rose-700 mt-0.5">{followupError}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Footer */}
                  <div className="pt-6 mt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px] text-indigo-500">verified</span>
                      <span className="font-mono text-[10px] text-slate-400 tracking-wider">
                        Analyzed by JurisAI · {confidenceScore}% Confidence
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">
                      {risks.length} Clause{risks.length !== 1 ? 's' : ''} Flagged
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* RIGHT COLUMN: Summary & Extracted Terms */}
          <aside className="lg:col-span-3 h-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">
            <div className="p-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-sm text-slate-900 tracking-tight">Summary</h2>
                <span className={`font-mono text-xs font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${confidenceScore >= 80
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                  : confidenceScore >= 50
                    ? "text-amber-700 bg-amber-50 border-amber-200/60"
                    : "text-red-700 bg-red-50 border-red-200/60"
                  }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${confidenceScore >= 80 ? 'bg-emerald-500' : confidenceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                  {confidenceScore}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">{caseData?.fileName}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* MEME LEGAL VIBE CHECK SECTION */}
              <MemeVibeCheck
                riskScore={overallRiskScore}
                criticalCount={risks.filter((r) => r.severity === "critical").length}
                isVisible={showMeme}
                onToggleVisible={handleToggleMeme}
              />

              {/* Risk Score Card */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Overall Risk Assessment</h3>
                <div className={`p-4 rounded-xl border ${overallRiskScore >= 70 ? 'bg-red-50 border-red-200' : overallRiskScore >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-extrabold ${riskScoreColor(overallRiskScore)}`}>{overallRiskScore}</span>
                    <span className={`text-xs font-semibold ${riskScoreColor(overallRiskScore)}`}>{riskScoreLabel(overallRiskScore)}</span>
                  </div>
                  <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${overallRiskScore >= 70 ? 'bg-red-500' : overallRiskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${overallRiskScore}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 font-mono">
                    <span>{risks.filter(r => r.severity === 'critical').length} Critical</span>
                    <span>{risks.filter(r => r.severity === 'warning').length} Warnings</span>
                    <span>{risks.filter(r => r.severity === 'note').length} Notes</span>
                  </div>
                </div>
              </section>

              {/* Synthesis */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Synthesis</h3>
                <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {analysis?.summary || "No summary available."}
                </p>
              </section>

              {/* Extracted Terms */}
              {analysis?.extractedTerms && analysis.extractedTerms.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Extracted Terms</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {analysis.extractedTerms.map((term, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-500">{term.label}</div>
                        <div className="font-semibold text-xs text-slate-900 mt-0.5">{term.value}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Key Recommendations */}
              {analysis?.recommendations && analysis.recommendations.length > 0 && (
                <section>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Key Recommendations</h3>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                        <span className="material-symbols-outlined text-[16px] text-indigo-600 mt-0.5 shrink-0">check_circle</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER CONTROL BAR */}
      <footer className="w-full bg-white border-t border-slate-200 px-6 py-3 sticky bottom-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3 relative">
          {/* Conversation History Badge */}
          {conversationMessages.filter(m => m.role === "user").length > 0 && (
            <button
              onClick={() => aiResponseSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 transition-colors shrink-0"
              title="Jump to conversation history"
            >
              <span className="material-symbols-outlined text-[14px]">forum</span>
              <span className="text-[10px] font-bold">
                {conversationMessages.filter(m => m.role === "user").length}
              </span>
            </button>
          )}

          <BorderGlow
            className="flex-1 shadow-sm"
            borderRadius={9999}
            glowColor="245 80 60"
            backgroundColor="#ffffff"
            glowRadius={35}
            glowIntensity={1.3}
            edgeSensitivity={45}
            colors={["#4f46e5", "#6366f1", "#10b981", "#3b82f6"]}
          >
            <div className={`w-full bg-white hover:bg-slate-50/80 border hover:border-indigo-400 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-500/15 rounded-full px-4 py-2.5 flex items-center gap-3 transition-all shadow-xs ${isAnalyzing ? "border-indigo-400 animate-pulse" : "border-slate-300"}`}>
              <input
                className="flex-1 bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
                id="legal-prompt-input"
                placeholder={isAnalyzing ? "JurisAI is analyzing your question..." : "Ask JurisAI a follow-up question about this analysis..."}
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExecutePrompt();
                }}
                disabled={isAnalyzing}
              />
            </div>
          </BorderGlow>

          {/* EXECUTE BUTTON */}
          <button
            onClick={handleExecutePrompt}
            disabled={isAnalyzing || !promptText.trim()}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-full font-semibold text-xs transition-colors shadow-sm"
            type="button"
          >
            {isAnalyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* WHAT-IF SCENARIO MAP MODAL */}
      {showWhatIf && (
        <WhatIfMap
          documentTitle={documentTitle}
          risks={risks}
          onClose={() => setShowWhatIf(false)}
        />
      )}
    </div>
  );
}
