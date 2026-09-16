"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import BorderGlow from "./BorderGlow";

interface CaseAnalysisProps {
  caseId: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface RiskItem {
  id: string;
  annId: string;
  title: string;
  severity: "Critical" | "Warning" | "Note";
  clause: string;
}

const riskLedgerData: RiskItem[] = [
  {
    id: "risk-1",
    annId: "ann-1",
    title: "3-day cure period violates CA Civil Code § 1946.2",
    severity: "Critical",
    clause: "Clause 8",
  },
  {
    id: "risk-2",
    annId: "ann-2",
    title: "Gross negligence waiver is legally unenforceable (§ 1953)",
    severity: "Critical",
    clause: "Clause 15",
  },
  {
    id: "risk-3",
    annId: "ann-3",
    title: "Mandatory non-refundable cleaning fee prohibited (§ 1950.5)",
    severity: "Warning",
    clause: "Clause 4",
  },
  {
    id: "risk-4",
    annId: "ann-4",
    title: "15% rent escalation bypasses AB 1482 statutory cap",
    severity: "Warning",
    clause: "Clause 12",
  },
  {
    id: "risk-5",
    annId: "ann-5",
    title: "Notice period for landlord entry lacks 24-hour statutory minimum",
    severity: "Note",
    clause: "Clause 6",
  },
];

export default function CaseAnalysis({ caseId, user }: CaseAnalysisProps) {
  const [activeAnnId, setActiveAnnId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("All");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [promptText, setPromptText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showWhatIf, setShowWhatIf] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [documentSearch, setDocumentSearch] = useState<string>("");
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);

  const docViewportRef = useRef<HTMLDivElement>(null);

  // Jump to specific clause in document with highlight animation
  const jumpToAnnotation = (annId: string) => {
    setActiveAnnId(annId);
    const el = document.getElementById(annId);
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
    setPromptText("JurisAI is analyzing document redlines & statutes...");

    setTimeout(() => {
      setIsAnalyzing(false);
      setPromptText("");
      setAiMessage(
        `Legal Analysis Generated for: "${query}"\n\n- Redline Recommendation: California AB 1482 limits annual rent increases to 5% + CPI (Max 10%). Clause 12 must be capped.\n- Citation: CA Civil Code § 1946.2 require a 30-day notice to cure material breaches before tenancy forfeiture.`
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

  const filteredRisks = riskLedgerData.filter((r) => {
    if (filterSeverity === "All") return true;
    return r.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#F8FAFC] text-[#0F172A] font-sans">
      {/* Toast Notification for AI Responses or Share */}
      {copiedShare && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-fade-in">
          <span className="material-symbols-outlined text-[16px] text-[#10B981]">
            check_circle
          </span>
          Case link copied to clipboard!
        </div>
      )}

      {aiMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-xl w-full px-4">
          <div className="bg-[#0F172A] text-white p-5 rounded-2xl shadow-2xl border border-indigo-500/30 backdrop-blur-xl animate-fade-in">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700/60 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[20px]">
                  auto_awesome
                </span>
                <span className="font-semibold text-sm text-indigo-200">
                  JurisAI Synthesis Response
                </span>
              </div>
              <button
                onClick={() => setAiMessage(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>
            <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-line">
              {aiMessage}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setAiMessage(null)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
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
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                J
              </div>
              <span className="font-bold text-lg tracking-tight text-[#0F172A]">
                JurisAI
              </span>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

            <nav
              aria-label="Breadcrumbs"
              className="hidden md:flex items-center gap-1.5 text-slate-500 text-xs font-medium"
            >
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Inquiries
              </Link>
              <span className="material-symbols-outlined text-slate-400 text-[14px]">
                chevron_right
              </span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">
                Residential Lease Review
              </span>
              <span className="material-symbols-outlined text-slate-400 text-[14px]">
                chevron_right
              </span>
              <span className="text-slate-900 font-semibold truncate max-w-[180px]">
                Case #{caseId} Analysis
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-semibold text-emerald-700">
                AI Active
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => alert("Downloading Case Report PDF...")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  ios_share
                </span>
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">
                  share
                </span>
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="w-full pt-16 flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden h-[calc(100vh-4rem)]">
        {/* 3-Column Workspace Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative h-[calc(100vh-7.5rem)] min-h-0">
          {/* LEFT COLUMN: Risk Ledger */}
          <aside className="lg:col-span-3 h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden">
            <div className="p-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-slate-900 tracking-tight">
                    Risk Ledger
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px] font-medium">
                    {filteredRisks.length} Items
                  </span>
                </div>

                {/* Filter Selector */}
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="text-xs text-indigo-600 font-medium bg-transparent border-none focus:outline-none cursor-pointer hover:underline"
                >
                  <option value="All">All Risks</option>
                  <option value="Critical">Critical</option>
                  <option value="Warning">Warning</option>
                  <option value="Note">Notes</option>
                </select>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-normal">
                Concise statutory flags &amp; non-compliance items
              </p>
            </div>

            {/* Risk Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {filteredRisks.map((item) => {
                const isActive = activeAnnId === item.annId;
                return (
                  <div
                    key={item.id}
                    onClick={() => jumpToAnnotation(item.annId)}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${isActive
                        ? "bg-indigo-50/80 border-indigo-300 shadow-xs"
                        : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${item.severity === "Critical"
                          ? "bg-red-500"
                          : item.severity === "Warning"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                        }`}
                    ></span>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-medium leading-snug transition-colors ${isActive
                            ? "text-indigo-900 font-semibold"
                            : "text-slate-800 group-hover:text-indigo-600"
                          }`}
                      >
                        {item.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono">
                        <span
                          className={`font-semibold ${item.severity === "Critical"
                              ? "text-red-600"
                              : item.severity === "Warning"
                                ? "text-amber-600"
                                : "text-slate-500"
                            }`}
                        >
                          {item.severity}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500">{item.clause}</span>
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
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage <= 1}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_left
                    </span>
                  </button>
                  <span className="font-mono text-slate-800 font-medium px-1">
                    Page {currentPage} of 4
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, 4))}
                    disabled={currentPage >= 4}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      chevron_right
                    </span>
                  </button>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex items-center gap-1 text-slate-600">
                  <button
                    onClick={handleZoomOut}
                    className="p-1 rounded hover:bg-slate-100 transition-colors"
                    title="Zoom Out"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      remove
                    </span>
                  </button>
                  <span className="font-mono text-[12px] px-1 text-slate-700 min-w-[36px] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-1 rounded hover:bg-slate-100 transition-colors"
                    title="Zoom In"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add
                    </span>
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
                    <button
                      onClick={() => setShowSearchBox(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        close
                      </span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSearchBox(true)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Search document"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      search
                    </span>
                  </button>
                )}

                <button
                  onClick={() => alert("Downloading document source...")}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Download Document"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Print"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    print
                  </span>
                </button>
              </div>
            </div>

            {/* Document Text Paper Viewport */}
            <div
              ref={docViewportRef}
              className="flex-1 overflow-y-scroll pdf-scrollbar p-6 lg:p-10 flex justify-center bg-slate-200/50 scroll-smooth pr-3 h-full min-h-0"
            >
              <article
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
                className="w-full max-w-[620px] bg-white min-h-[850px] p-8 lg:p-12 shadow-md rounded-xl text-slate-900 select-text border border-slate-200/80 transition-transform duration-200"
              >
                <div className="text-center pb-6 border-b border-slate-200 mb-6">
                  <div className="font-mono text-[11px] text-slate-400 tracking-wider uppercase mb-2">
                    State of California · Standard Tenancy Covenant
                  </div>
                  <h1 className="font-extrabold text-xl tracking-tight text-slate-900 uppercase">
                    Residential Lease Agreement
                  </h1>
                </div>

                <div className="text-xs leading-relaxed text-slate-800 space-y-6 font-serif">
                  <p className="text-justify leading-6">
                    THIS RESIDENTIAL LEASE COVENANT is entered into on this 1st
                    day of November, 2024, between{" "}
                    <strong className="font-semibold text-slate-900">
                      Bayline Properties LLC
                    </strong>{" "}
                    (&quot;Landlord&quot;), and{" "}
                    <strong className="font-semibold text-slate-900">
                      Marcus Vance &amp; Eleanor Vance
                    </strong>{" "}
                    (&quot;Tenant&quot;).
                  </p>

                  <div>
                    <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider mb-1">
                      1. Premises &amp; Occupancy
                    </h4>
                    <p className="text-justify leading-6">
                      Premises situated in Alameda County, California:{" "}
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">
                        Suite 404, 1842 Oakwood Terrace, Berkeley, CA 94709
                      </span>
                      , leased strictly for private residential domicile
                      purposes.
                    </p>
                  </div>

                  {/* Clause 4 (ann-3) */}
                  <div
                    id="ann-3"
                    className={`p-3 rounded-xl transition-all duration-500 ${activeAnnId === "ann-3"
                        ? "bg-amber-100/80 ring-2 ring-amber-400 shadow-sm"
                        : "bg-amber-50/40 hover:bg-amber-50"
                      }`}
                  >
                    <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>4. Security Deposit &amp; Fees</span>
                      <span className="font-mono text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                        Warning · § 1950.5
                      </span>
                    </h4>
                    <p className="text-justify leading-6">
                      Tenant shall deposit $4,000.00 prior to occupancy.
                      Furthermore,{" "}
                      <mark className="bg-amber-200/70 text-slate-900 underline decoration-amber-500 underline-offset-2 px-1 rounded font-medium">
                        a non-refundable sanitation assessment fee of $650.00
                        will be retained upon move-out regardless of premise
                        condition
                      </mark>{" "}
                      for routine turnover remediation.
                    </p>
                  </div>

                  {/* Clause 8 (ann-1) */}
                  <div
                    id="ann-1"
                    className={`p-3 rounded-xl transition-all duration-500 ${activeAnnId === "ann-1"
                        ? "bg-red-100/90 ring-2 ring-red-400 shadow-sm"
                        : "bg-red-50/40 hover:bg-red-50"
                      }`}
                  >
                    <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>8. Default &amp; Summary Termination</span>
                      <span className="font-mono text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full">
                        Critical · § 1946.2
                      </span>
                    </h4>
                    <p className="text-justify leading-6">
                      If Tenant breaches any covenants including quiet enjoyment,{" "}
                      <mark className="bg-red-200/80 text-slate-900 underline decoration-red-600 underline-offset-2 px-1 rounded font-medium">
                        Tenant shall forfeit tenancy within seventy-two (72)
                        hours of notice without right of cure, and Landlord
                        shall immediately retake peaceful possession
                      </mark>{" "}
                      without judicial process.
                    </p>
                  </div>

                  {/* Clause 12 (ann-4) */}
                  <div
                    id="ann-4"
                    className={`p-3 rounded-xl transition-all duration-500 ${activeAnnId === "ann-4"
                        ? "bg-amber-100/80 ring-2 ring-amber-400 shadow-sm"
                        : "bg-amber-50/40 hover:bg-amber-50"
                      }`}
                  >
                    <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>12. Rent Adjustment</span>
                      <span className="font-mono text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                        Warning · AB 1482
                      </span>
                    </h4>
                    <p className="text-justify leading-6">
                      Base monthly rent is set at $3,200.00. However,{" "}
                      <mark className="bg-amber-200/70 text-slate-900 underline decoration-amber-500 underline-offset-2 px-1 rounded font-medium">
                        Landlord reserves authority to revise base monthly rent
                        upon thirty (30) days written notice up to fifteen
                        percent (15%) per annum
                      </mark>{" "}
                      at landlord discretion.
                    </p>
                  </div>

                  {/* Clause 15 (ann-2) */}
                  <div
                    id="ann-2"
                    className={`p-3 rounded-xl transition-all duration-500 ${activeAnnId === "ann-2"
                        ? "bg-red-100/90 ring-2 ring-red-400 shadow-sm"
                        : "bg-red-50/40 hover:bg-red-50"
                      }`}
                  >
                    <h4 className="font-sans font-bold text-xs text-slate-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>15. Indemnity &amp; Liability Release</span>
                      <span className="font-mono text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded-full">
                        Critical · § 1953
                      </span>
                    </h4>
                    <p className="text-justify leading-6">
                      To the maximum extent permissible,{" "}
                      <mark className="bg-red-200/80 text-slate-900 underline decoration-red-600 underline-offset-2 px-1 rounded font-medium">
                        Tenant hereby holds Landlord harmless from all damages,
                        negligence, or property destruction howsoever caused,
                        including structural omissions
                      </mark>{" "}
                      across common facilities.
                    </p>
                  </div>

                  <div className="pt-6 flex items-center justify-between font-mono text-[10px] text-slate-400 border-t border-slate-200 mt-6">
                    <span>Initials: [_____]</span>
                    <span>Page {currentPage} of 4</span>
                    <span>Initials: [_____]</span>
                  </div>
                </div>
              </article>
            </div>
          </section>

          {/* RIGHT COLUMN: Summary & Extracted Terms */}
          <aside className="lg:col-span-3 h-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">
            <div className="p-5 pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-semibold text-sm text-slate-900 tracking-tight">
                  Summary
                </h2>
                <span className="font-mono text-xs text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                  98% Match
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">
                Residential_Lease_v2.pdf
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Synthesis */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Synthesis
                </h3>
                <p className="text-xs leading-relaxed text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  The agreement contains multiple provisions contrary to
                  California tenant protection statutes, specifically regarding
                  notice periods, liability indemnification, and deposit withholding.
                </p>
              </section>

              {/* Extracted Terms */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Extracted Terms
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500">Term</div>
                    <div className="font-semibold text-xs text-slate-900 mt-0.5">
                      12 Months
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500">Monthly Rent</div>
                    <div className="font-semibold text-xs text-indigo-600 mt-0.5">
                      $3,200
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500">
                      Security Deposit
                    </div>
                    <div className="font-semibold text-xs text-slate-900 mt-0.5">
                      $4,000
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-[10px] text-slate-500">Jurisdiction</div>
                    <div className="font-semibold text-xs text-slate-900 mt-0.5">
                      California
                    </div>
                  </div>
                </div>
              </section>

              {/* Key Recommendations */}
              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Key Recommendations
                </h3>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600 mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <span>Strike Clause 8(b) for statutory 30-day notice</span>
                  </li>
                  <li className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600 mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <span>Reclassify $650 fee as fully refundable</span>
                  </li>
                  <li className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
                    <span className="material-symbols-outlined text-[16px] text-indigo-600 mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <span>Enforce AB 1482 annual rent escalation cap</span>
                  </li>
                </ul>
              </section>
            </div>
          </aside>
        </div>
      </main>

      {/* FOOTER CONTROL BAR */}
      <footer className="w-full bg-white border-t border-slate-200 px-6 py-3 sticky bottom-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3 relative">
          {/* AI Input Box with High-Contrast BorderGlow */}
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
              <button
                type="button"
                onClick={() => alert("Upload annex or contract file...")}
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 rounded-full transition-all flex items-center justify-center shrink-0"
                title="Attach File"
              >
                <span className="material-symbols-outlined text-[20px]">
                  attach_file
                </span>
              </button>
              <input
                className="flex-1 bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none"
                id="legal-prompt-input"
                placeholder="Ask JurisAI to draft a dispute letter, review clauses, or revise redlines..."
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExecutePrompt();
                }}
              />
              <button
                type="button"
                onClick={() => alert("Listening for prompt voice input...")}
                className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-1 rounded-full transition-all flex items-center justify-center shrink-0"
                title="Voice Input"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
          </BorderGlow>

          {/* WHAT IF SCENARIO MAP TRIGGER & POPOVER */}
          <div className="relative">
            <button
              onClick={() => setShowWhatIf((prev) => !prev)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all border shadow-xs ${showWhatIf
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 hover:text-indigo-600"
                }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-indigo-500">
                account_tree
              </span>
              <span>What If?</span>
            </button>

            {/* WHAT IF POPOVER DRAWER */}
            {showWhatIf && (
              <div className="absolute bottom-full right-0 mb-3 w-[360px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in text-slate-900">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                      schema
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      What If Scenario Map
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono text-[10px] font-semibold">
                    Accept As-Is
                  </span>
                </div>

                <div className="mb-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-medium">
                    Branch Hypothesis
                  </div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5">
                    Option: Accept Lease Without Redlines
                  </div>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {/* Pros */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                      Pros &amp; Advantages
                    </div>
                    <div className="space-y-1 pl-2">
                      <div className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600 mt-0.5 shrink-0">
                          check
                        </span>
                        <span>
                          Fast move-in approval with zero counter-negotiation delay.
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600 mt-0.5 shrink-0">
                          check
                        </span>
                        <span>Secures current agreed rental rate ($3,200/mo).</span>
                      </div>
                    </div>
                  </div>

                  {/* Cons */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{" "}
                      Cons &amp; Statutory Exposure
                    </div>
                    <div className="space-y-1 pl-2">
                      <div className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                        <span className="material-symbols-outlined text-[14px] text-red-500 mt-0.5 shrink-0">
                          close
                        </span>
                        <span>
                          Forfeit $650 mandatory sanitation fee upon move-out
                          (Unrecoverable).
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                        <span className="material-symbols-outlined text-[14px] text-red-500 mt-0.5 shrink-0">
                          close
                        </span>
                        <span>
                          Exposure to unlawful 72-hour expedited eviction without
                          CA Civil Code § 1946.2 cure notice.
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5 text-xs text-slate-700 leading-snug">
                        <span className="material-symbols-outlined text-[14px] text-red-500 mt-0.5 shrink-0">
                          close
                        </span>
                        <span>
                          Forfeiture of landlord gross negligence claims under void
                          § 1953 waiver.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between bg-red-50/50 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span className="font-mono text-[11px] font-semibold text-red-700">
                      Risk Impact: High Legal Vulnerability
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowWhatIf(false);
                      setPromptText("Draft formal redline revision request for California AB 1482 & § 1946.2 statutory compliance.");
                    }}
                    className="font-mono text-[10px] text-indigo-600 font-bold hover:underline"
                  >
                    Recommend Redline
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* EXECUTE BUTTON */}
          <button
            onClick={handleExecutePrompt}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-full font-semibold text-xs transition-colors shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">
              auto_awesome
            </span>
            <span>{isAnalyzing ? "Analyzing..." : "Execute"}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
