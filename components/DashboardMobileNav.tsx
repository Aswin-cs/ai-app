"use client";

import React from "react";

interface DashboardMobileNavProps {
  activeTab: "home" | "profile";
  setActiveTab: (tab: "home" | "profile") => void;
}

export const DashboardMobileNav = React.memo(function DashboardMobileNav({
  activeTab,
  setActiveTab,
}: DashboardMobileNavProps) {
  return (
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
  );
});
