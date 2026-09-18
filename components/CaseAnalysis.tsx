"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import BorderGlow from "./BorderGlow";
import WhatIfMap from "./WhatIfMap";
import type { CaseDocument, RiskItem as RiskItemType } from "@/types/case.types";

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
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [documentSearch, setDocumentSearch] = useState<string>("");
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);

  const docViewportRef = useRef<HTMLDivElement>(null);

  // Fetch case data from API on mount
  useEffect(() => {
    async function fetchCase() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/case/${caseId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load case data.");
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

  const handleExecutePrompt = () => {
    if (!promptText.trim()) return;
    setIsAnalyzing(true);
    const query = promptText;
    setPromptText("JurisAI is analyzing...");

    setTimeout(() => {
      setIsAnalyzing(false);
      setPromptText("");
      setAiMessage(
        `Legal Analysis Generated for: "${query}"\n\nThis is a follow-up analysis based on the current document context. For complete statutory analysis, please consult a licensed attorney.`
      );
    }, 1200);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

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

  const documentTitle = analysis?.documentTitle || caseData?.fileName || "Document Analysis";
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

      {/* AI Response Toast */}
      {aiMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4">
          <div className="bg-[#0F172A] text-white p-5 rounded-2xl shadow-2xl border border-indigo-500/30 backdrop-blur-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[20px]">auto_awesome</span>
                <span className="font-semibold text-sm text-indigo-200">JurisAI Response</span>
              </div>
              <button onClick={() => setAiMessage(null)} className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">{aiMessage}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setAiMessage(null)} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors">
                Dismiss
              </button>
            </div>
          </div>
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

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowWhatIf(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-all shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">account_tree</span>
                <span>What-If Map</span>
              </button>
              <button
                onClick={() => alert("Downloading Case Report PDF...")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">ios_share</span>
                <span className="hidden sm:inline">Export</span>
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
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="text-xs text-indigo-600 font-medium bg-transparent border-none focus:outline-none cursor-pointer hover:underline"
                >
                  <option value="All">All Risks</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="note">Notes</option>
                </select>
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

                  {/* Original Document Text */}
                  {caseData?.fileSummary && !caseData.fileSummary.startsWith("[Binary file:") && (
                    <div className="mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 px-2 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[13px]">article</span>
                          Source Document
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                      <div className="text-[12px] leading-[1.8] text-slate-600 whitespace-pre-wrap font-serif max-h-[500px] overflow-y-auto bg-[#FAFBFC] p-5 rounded-xl border border-slate-100 shadow-inner">
                        {caseData.fileSummary.substring(0, 8000)}
                        {caseData.fileSummary.length > 8000 && (
                          <span className="text-slate-400 italic block mt-3 text-[11px] font-sans">— Document content truncated for display —</span>
                        )}
                      </div>
                    </div>
                  )}

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

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
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
            <div className="w-full bg-white hover:bg-slate-50/80 border border-slate-300 hover:border-indigo-400 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-500/15 rounded-full px-4 py-2.5 flex items-center gap-3 transition-all shadow-xs">
              <input
                className="flex-1 bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none"
                id="legal-prompt-input"
                placeholder="Ask JurisAI a follow-up question about this analysis..."
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExecutePrompt();
                }}
              />
            </div>
          </BorderGlow>

          {/* EXECUTE BUTTON */}
          <button
            onClick={handleExecutePrompt}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-full font-semibold text-xs transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            <span>{isAnalyzing ? "Analyzing..." : "Ask"}</span>
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
