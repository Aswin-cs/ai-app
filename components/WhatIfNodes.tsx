"use client";

import React from "react";
import { Handle, Position } from "reactflow";

export interface CenterNodeData {
  title?: string;
  description?: string;
  scenarioLabel: string;
}

export interface ConNodeData {
  title: string;
  clause?: string;
  severity: "critical" | "warning" | "note";
  explanation: string;
  statute?: string;
}

export interface ConImpactNodeData {
  title: string;
  description: string;
}

export interface ProNodeData {
  title: string;
  clause?: string;
  badge?: string;
  explanation: string;
  benefit?: string;
}

export interface ProBenefitNodeData {
  title: string;
  description: string;
}

/**
 * 1. Center Decision Node ("What If I Make This Decision?")
 */
export const CenterDecisionNode = ({ data }: { data: CenterNodeData }) => {
  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-indigo-600 shadow-[0_12px_36px_rgba(79,70,229,0.18)] rounded-2xl p-5 w-80 text-slate-900 dark:text-slate-100 font-sans relative transition-all duration-300 hover:shadow-[0_16px_48px_rgba(79,70,229,0.24)]">
      <Handle
        type="source"
        position={Position.Left}
        id="center-cons-out"
        className="!bg-rose-500 !w-3.5 !h-3.5 !-left-2 border-2 border-white dark:border-slate-800 shadow-md cursor-pointer"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="center-pros-out"
        className="!bg-emerald-500 !w-3.5 !h-3.5 !-right-2 border-2 border-white dark:border-slate-800 shadow-md cursor-pointer"
      />

      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" aria-hidden="true" />
          Central Decision Node
        </span>
        <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
          Core Focus
        </span>
      </div>

      <h3 className="font-[Plus_Jakarta_Sans] text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
        {data.title || "What if I make this decision?"}
      </h3>

      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-[Inter]">
        {data.description || "Simulates the direct risks (Cons) and legal protections (Pros) resulting from this contractual agreement."}
      </p>

      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Active Option:</span>
        <span className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-mono text-[11px] font-bold shadow-xs">
          {data.scenarioLabel}
        </span>
      </div>
    </div>
  );
};

/**
 * 2. Cons / Vulnerabilities Node (LEFT SIDE)
 */
export const ConNode = ({ data }: { data: ConNodeData }) => {
  const isCritical = data.severity === "critical";

  return (
    <div className={`bg-white dark:bg-slate-800 border-2 ${isCritical ? "border-rose-400 bg-rose-50/20 dark:bg-rose-950/40" : "border-amber-400 bg-amber-50/20 dark:bg-amber-950/40"} shadow-[0_4px_20px_rgba(244,63,94,0.08)] rounded-2xl p-4 w-72 text-slate-900 dark:text-slate-100 font-sans relative transition-all duration-300 hover:scale-[1.02]`}>
      <Handle
        type="target"
        position={Position.Right}
        id="con-target-right"
        className="!bg-rose-500 !w-3 !h-3 !-right-1.5 border-2 border-white dark:border-slate-800 shadow-xs"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="con-source-left"
        className="!bg-rose-600 !w-3 !h-3 !-left-1.5 border-2 border-white dark:border-slate-800 shadow-xs"
      />

      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60">
          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">warning</span>
          Con / Risk
        </span>
        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${isCritical ? "bg-rose-600 text-white" : "bg-amber-500 text-white"}`}>
          {data.severity || "warning"}
        </span>
      </div>

      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-[Plus_Jakarta_Sans] leading-snug">
        {data.title}
      </div>

      {data.clause && (
        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
          Ref: <span className="font-semibold text-slate-700 dark:text-slate-300">{data.clause}</span>
        </div>
      )}

      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-3 font-[Inter]">
        {data.explanation}
      </p>

      {data.statute && (
        <div className="mt-2.5 pt-2 border-t border-rose-100 dark:border-rose-900/40 flex items-center gap-1 text-[10px] font-mono text-rose-700 dark:text-rose-400">
          <span className="material-symbols-outlined text-[13px] shrink-0" aria-hidden="true">gavel</span>
          <span className="truncate">{data.statute}</span>
        </div>
      )}
    </div>
  );
};

/**
 * 3. Far-Left Impact / Financial Exposure Node
 */
export const ConImpactNode = ({ data }: { data: ConImpactNodeData }) => (
  <div className="bg-rose-50/95 dark:bg-rose-950/90 border-2 border-rose-200 dark:border-rose-800/80 shadow-md rounded-xl p-3.5 w-64 text-slate-900 dark:text-slate-100 font-sans relative">
    <Handle
      type="target"
      position={Position.Right}
      id="impact-target-right"
      className="!bg-rose-500 !w-3 !h-3 !-right-1.5 border-2 border-white dark:border-slate-800"
    />
    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">gavel</span>
      <span>Financial &amp; Legal Exposure</span>
    </div>
    <div className="text-xs font-bold text-rose-950 dark:text-rose-100 font-[Plus_Jakarta_Sans] leading-snug">
      {data.title}
    </div>
    <div className="text-[11px] text-rose-800 dark:text-rose-300 mt-1 leading-snug font-[Inter]">
      {data.description}
    </div>
  </div>
);

/**
 * 4. Pros / Advantages Node (RIGHT SIDE)
 */
export const ProNode = ({ data }: { data: ProNodeData }) => {
  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/40 shadow-[0_4px_20px_rgba(16,185,129,0.08)] rounded-2xl p-4 w-72 text-slate-900 dark:text-slate-100 font-sans relative transition-all duration-300 hover:scale-[1.02]">
      <Handle
        type="target"
        position={Position.Left}
        id="pro-target-left"
        className="!bg-emerald-500 !w-3 !h-3 !-left-1.5 border-2 border-white dark:border-slate-800 shadow-xs"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="pro-source-right"
        className="!bg-emerald-600 !w-3 !h-3 !-right-1.5 border-2 border-white dark:border-slate-800 shadow-xs"
      />

      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">verified</span>
          Pro / Advantage
        </span>
        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white">
          {data.badge || "Protection"}
        </span>
      </div>

      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-[Plus_Jakarta_Sans] leading-snug">
        {data.title}
      </div>

      {data.clause && (
        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
          Ref: <span className="font-semibold text-slate-700 dark:text-slate-300">{data.clause}</span>
        </div>
      )}

      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-3 font-[Inter]">
        {data.explanation}
      </p>

      {data.benefit && (
        <div className="mt-2.5 pt-2 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
          <span className="material-symbols-outlined text-[13px] shrink-0" aria-hidden="true">shield</span>
          <span className="truncate">{data.benefit}</span>
        </div>
      )}
    </div>
  );
};

/**
 * 5. Far-Right Strategic Gain / Benefit Node
 */
export const ProBenefitNode = ({ data }: { data: ProBenefitNodeData }) => (
  <div className="bg-emerald-50/95 dark:bg-emerald-950/90 border-2 border-emerald-200 dark:border-emerald-800/80 shadow-md rounded-xl p-3.5 w-64 text-slate-900 dark:text-slate-100 font-sans relative">
    <Handle
      type="target"
      position={Position.Left}
      id="benefit-target-left"
      className="!bg-emerald-500 !w-3 !h-3 !-left-1.5 border-2 border-white dark:border-slate-800"
    />
    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">stars</span>
      <span>Strategic Gain &amp; Protection</span>
    </div>
    <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100 font-[Plus_Jakarta_Sans] leading-snug">
      {data.title}
    </div>
    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1 leading-snug font-[Inter]">
      {data.description}
    </div>
  </div>
);

export const whatIfNodeTypes = {
  centerDecision: CenterDecisionNode,
  centerNode: CenterDecisionNode,
  conNode: ConNode,
  conImpactNode: ConImpactNode,
  proNode: ProNode,
  proBenefitNode: ProBenefitNode,
};
