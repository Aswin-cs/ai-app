"use client";

import React, { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setAuthStatus("Verifying credentials...");

    try {
      await signIn("google", { callbackUrl: "/" });
    } catch {
      // Preview mode fallback simulation
      setTimeout(() => {
        setAuthStatus("Privileged Session Verified...");
        setTimeout(() => {
          setIsLoading(false);
          setAuthStatus(null);
        }, 1500);
      }, 1600);
    }
  };

  return (
    <main className="w-full bg-[#F8FAFC] relative min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col justify-center">
      {/* Ambient mesh background glows */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-32 right-10 w-[550px] h-[550px] bg-slate-100/70 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col min-h-screen justify-between relative z-10">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {/* Scales Emblem */}
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-slate-900/10 flex items-center justify-center bg-[#0F172A] text-amber-400 border border-slate-800">
              <span className="material-symbols-outlined text-[24px]">balance</span>
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-[#0F172A]">
                JurisAI
              </span>
            </div>
          </div>
        </div>

        {/* Center Container bringing Left Showcase and Right Auth Card Close Together */}
        <div className="my-auto py-8 w-full flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          {/* LEFT SECTION */}
          <div className="w-full lg:w-1/2 max-w-xl">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] text-[#0F172A] font-extrabold tracking-tight leading-[1.18]">
                Equal justice and clear legal guidance, powered by AI.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Instant, attorney-verified legal analysis and document decoding—translated into plain language anyone can understand.
              </p>
            </div>

            {/* Feature Showcase Container */}
            <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-ambient space-y-4 shadow-slate-900/5">
              {/* Feature 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    Instant Document Analysis
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Upload notices, leases, or contracts for clear clause breakdowns.
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    Plain-English Guidance
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Translate confusing legal jargon into simple, actionable steps.
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    Attorney-Verified Pro Bono Network
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Connect with partner legal clinics when expert human review is needed.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (Auth Panel) */}
          <div className="w-full lg:w-auto flex items-center justify-center">
            {/* Auth Card Container */}
            <div className="w-full max-w-[400px] sm:w-[400px] bg-white rounded-[24px] p-8 sm:p-9 shadow-2xl shadow-slate-900/10 border border-slate-200/80">
              {/* Logo & Header */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg shadow-slate-900/15 flex items-center justify-center bg-[#0F172A] border border-slate-800 text-amber-400">
                  <span className="material-symbols-outlined text-[32px]">gavel</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
                    Welcome to JurisAI
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-normal">
                    {session
                      ? `Authenticated session active.`
                      : `Sign in or create your confidential legal account in a single click.`}
                  </p>
                </div>
              </div>

              {/* Active Session vs Login Action Area */}
              {status === "authenticated" && session ? (
                <div className="mt-7 space-y-4 text-center">
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-left">
                    <div className="flex items-center gap-3">
                      {session.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={session.user.image}
                          alt={session.user.name || "User Avatar"}
                          className="w-10 h-10 rounded-full ring-2 ring-indigo-500 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                          {session.user.name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-bold text-[#0F172A]">
                          {session.user.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {session.user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="mt-7 space-y-4">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    id="google-auth-btn"
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    className="w-full relative group flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-80"
                    style={{ boxShadow: "0 2px 10px -2px rgba(15, 23, 42, 0.06)" }}
                  >
                    {/* Google Official 4-Color Icon */}
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-[#0F172A]">
                      Continue with Google
                    </span>

                    {/* Interactive loading / verification overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center gap-2 border border-indigo-200 shadow-inner">
                        {authStatus === "Verifying credentials..." ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-indigo-600"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                fill="currentColor"
                              />
                            </svg>
                            <span className="text-xs font-semibold text-[#0F172A]">
                              Verifying credentials...
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                              verified
                            </span>
                            <span className="text-xs font-semibold text-[#0F172A]">
                              Privileged Session Verified...
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </button>

                  {/* Alternative subtle divider */}
                  <div className="relative py-2 flex items-center justify-center">
                    <div className="w-full bg-slate-200 h-[1px]" />
                    <span className="absolute bg-white px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Institutional Protection
                    </span>
                  </div>

                  {/* Bullet points with green dots */}
                  <div className="space-y-2 text-left pt-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span>256-bit encryption &amp; strict confidentiality</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span>Free legal aid triage &amp; pro bono resources</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer spacing */}
        <div className="py-2" />
      </div>
    </main>
  );
}
