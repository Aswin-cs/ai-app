"use client";

import React, { useState, useRef } from "react";
import { signOut } from "next-auth/react";

interface DashboardProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Dashboard({ user }: DashboardProps) {
  const [promptText, setPromptText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "profile">("home");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChipClick = (text: string) => {
    setPromptText(text);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!promptText.trim() && !attachedFile) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setPromptText("");
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const userName = user.name ? user.name.split(" ")[0] : "there";

  return (
    <div className="bg-[#F8FAFC] font-sans text-slate-800 antialiased min-h-screen">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-slate-200/60">
        <div className="h-16 w-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-[#0F172A] text-amber-400 border border-slate-800">
              <span className="material-symbols-outlined text-[20px]">balance</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#0F172A]">
              JurisAI
            </span>
          </div>

          {/* Navigation Links */}
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
          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
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

      {/* ASIDE SIDEBAR */}
      <aside className="fixed left-0 top-16 bottom-0 w-72 bg-white z-40 flex flex-col justify-between border-r border-slate-200/60 shadow-[0_1px_8px_rgba(0,0,0,0.03)] hidden md:flex">
        <div className="p-4 flex flex-col gap-4 overflow-hidden h-full">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[#0F172A]">History</span>
            <button
              className="flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
            </button>
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
            <span>New Legal Consultation</span>
          </button>

          {/* History list */}
          <nav className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Today
              </span>
              <div className="space-y-1">
                <a
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">
                    description
                  </span>
                  <span className="truncate">Residential Lease Termination</span>
                </a>
                <a
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[16px] text-indigo-600">
                    gavel
                  </span>
                  <span className="truncate">Notice to Vacate Guidance</span>
                </a>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Yesterday
              </span>
              <div className="space-y-1">
                <a
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-600">
                    assignment_turned_in
                  </span>
                  <span className="truncate">Employment Severance Clause</span>
                </a>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Past 7 Days
              </span>
              <div className="space-y-1">
                <a
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    article
                  </span>
                  <span className="truncate">NDA Plain-Language Translation</span>
                </a>
                <a
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  href="#"
                >
                  <span className="material-symbols-outlined text-[16px] text-slate-500">
                    calculate
                  </span>
                  <span className="truncate">Statutory Damage Calculator</span>
                </a>
              </div>
            </div>
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
      <div className="md:pl-72 pt-16 min-h-screen">
        <main className="w-full bg-[#F8FAFC] min-h-[calc(100vh-4rem)] p-6 sm:p-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center my-auto py-8 text-center">
            {/* Welcome Emblem & Title */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm ring-1 ring-indigo-200/50">
                <span className="material-symbols-outlined text-[26px]">balance</span>
              </div>

              <h1 className="text-3xl sm:text-4xl text-[#0F172A] tracking-tight font-extrabold leading-tight">
                Good afternoon, {userName}.<br />
                <span className="text-[#4f46e5]">How can I assist your legal matter today?</span>
              </h1>
            </div>

            {/* Conversational AI Input Card */}
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 p-3 mb-6 text-left transition-all focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400">
              <textarea
                id="legal-input-box"
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-[#0F172A] placeholder:text-slate-400 text-sm p-3 resize-none focus:outline-none"
                placeholder="Ask a legal question, describe your situation, or attach documents for analysis..."
              />

              {/* Bottom Toolbar */}
              <div className="flex items-center justify-between pt-2 px-1 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px] text-indigo-600">
                      attach_file
                    </span>
                    <span className="truncate max-w-[150px]">
                      {attachedFile ? attachedFile.name : "Attach Document"}
                    </span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.txt,.png,.jpg"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="h-9 px-4 rounded-xl bg-[#4f46e5] hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all text-xs font-semibold flex-shrink-0 disabled:opacity-75"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        refresh
                      </span>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze</span>
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_upward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl mx-auto mb-8">
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
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm hidden sm:flex"
              >
                <span className="material-symbols-outlined text-[15px] text-indigo-600">
                  calculate
                </span>
                <span>Small claims guidance</span>
              </button>
            </div>

            {/* Legal Disclaimer & Shortcuts */}
            <div className="flex flex-col items-center gap-1 text-slate-400 text-xs text-center max-w-lg">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
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
    </div>
  );
}
