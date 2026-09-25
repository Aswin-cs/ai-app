"use client";

import React, { useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import type { RiskItem } from "@/types/case.types";

interface WhatIfMapProps {
  documentTitle: string;
  risks: RiskItem[];
  onClose: () => void;
}

export type DecisionScenarioKey = "as_is" | "negotiate" | "decline";

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

// ==========================================
// CUSTOM NODE COMPONENTS (LIGHT PREMIUM DESIGN)
// ==========================================

/**
 * 1. Center Decision Node ("What If I Make This Decision?")
 */
const CenterDecisionNode = ({ data }: { data: CenterNodeData }) => {
  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-indigo-600 shadow-[0_12px_36px_rgba(79,70,229,0.18)] rounded-2xl p-5 w-80 text-slate-900 dark:text-slate-100 font-sans relative transition-all duration-300 hover:shadow-[0_16px_48px_rgba(79,70,229,0.24)]">
      {/* Handles: Left for Cons, Right for Pros */}
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

      {/* Header Tag */}
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] font-bold tracking-wide uppercase">
          <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
          Central Decision Node
        </span>
        <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
          Core Focus
        </span>
      </div>

      {/* Main Title */}
      <h3 className="font-[Plus_Jakarta_Sans] text-base font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
        {data.title || "What if I make this decision?"}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed font-[Inter]">
        {data.description || "Simulates the direct risks (Cons) and legal protections (Pros) resulting from this contractual agreement."}
      </p>

      {/* Scenario Indicator Box */}
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
const ConNode = ({ data }: { data: ConNodeData }) => {
  const isCritical = data.severity === "critical";

  return (
    <div className={`bg-white dark:bg-slate-800 border-2 ${isCritical ? "border-rose-400 bg-rose-50/20 dark:bg-rose-950/40" : "border-amber-400 bg-amber-50/20 dark:bg-amber-950/40"} shadow-[0_4px_20px_rgba(244,63,94,0.08)] rounded-2xl p-4 w-72 text-slate-900 dark:text-slate-100 font-sans relative transition-all duration-300 hover:scale-[1.02]`}>
      {/* Target handle connecting from Center Decision Node (Right side of Con Node) */}
      <Handle
        type="target"
        position={Position.Right}
        id="con-target-right"
        className="!bg-rose-500 !w-3 !h-3 !-right-1.5 border-2 border-white dark:border-slate-800 shadow-xs"
      />
      {/* Source handle connecting to Far-Left Impact Node (Left side of Con Node) */}
      <Handle
        type="source"
        position={Position.Left}
        id="con-source-left"
        className="!bg-rose-600 !w-3 !h-3 !-left-1.5 border-2 border-white dark:border-slate-800 shadow-xs"
      />

      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800/60">
          <span className="material-symbols-outlined text-[13px]">warning</span>
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
          <span className="material-symbols-outlined text-[13px] shrink-0">gavel</span>
          <span className="truncate">{data.statute}</span>
        </div>
      )}
    </div>
  );
};

/**
 * 3. Far-Left Impact / Financial Exposure Node
 */
const ConImpactNode = ({ data }: { data: ConImpactNodeData }) => (
  <div className="bg-rose-50/95 dark:bg-rose-950/90 border-2 border-rose-200 dark:border-rose-800/80 shadow-md rounded-xl p-3.5 w-64 text-slate-900 dark:text-slate-100 font-sans relative">
    <Handle
      type="target"
      position={Position.Right}
      id="impact-target-right"
      className="!bg-rose-500 !w-3 !h-3 !-right-1.5 border-2 border-white dark:border-slate-800"
    />
    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
      <span className="material-symbols-outlined text-[14px]">gavel</span>
      <span>Financial & Legal Exposure</span>
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
const ProNode = ({ data }: { data: ProNodeData }) => {
  return (
    <div className="bg-white dark:bg-slate-800 border-2 border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/40 shadow-[0_4px_20px_rgba(16,185,129,0.08)] rounded-2xl p-4 w-72 text-slate-900 dark:text-slate-100 font-sans relative transition-all duration-300 hover:scale-[1.02]">
      {/* Target handle connecting from Center Decision Node (Left side of Pro Node) */}
      <Handle
        type="target"
        position={Position.Left}
        id="pro-target-left"
        className="!bg-emerald-500 !w-3 !h-3 !-left-1.5 border-2 border-white dark:border-slate-800 shadow-xs"
      />
      {/* Source handle connecting to Far-Right Benefit Node (Right side of Pro Node) */}
      <Handle
        type="source"
        position={Position.Right}
        id="pro-source-right"
        className="!bg-emerald-600 !w-3 !h-3 !-right-1.5 border-2 border-white dark:border-slate-800 shadow-xs"
      />

      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
          <span className="material-symbols-outlined text-[13px]">verified</span>
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
          <span className="material-symbols-outlined text-[13px] shrink-0">shield</span>
          <span className="truncate">{data.benefit}</span>
        </div>
      )}
    </div>
  );
};

/**
 * 5. Far-Right Strategic Gain / Benefit Node
 */
const ProBenefitNode = ({ data }: { data: ProBenefitNodeData }) => (
  <div className="bg-emerald-50/95 dark:bg-emerald-950/90 border-2 border-emerald-200 dark:border-emerald-800/80 shadow-md rounded-xl p-3.5 w-64 text-slate-900 dark:text-slate-100 font-sans relative">
    <Handle
      type="target"
      position={Position.Left}
      id="benefit-target-left"
      className="!bg-emerald-500 !w-3 !h-3 !-left-1.5 border-2 border-white dark:border-slate-800"
    />
    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
      <span className="material-symbols-outlined text-[14px]">stars</span>
      <span>Strategic Gain & Protection</span>
    </div>
    <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100 font-[Plus_Jakarta_Sans] leading-snug">
      {data.title}
    </div>
    <div className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1 leading-snug font-[Inter]">
      {data.description}
    </div>
  </div>
);

// Node type registry
const nodeTypes = {
  centerDecision: CenterDecisionNode,
  conNode: ConNode,
  conImpactNode: ConImpactNode,
  proNode: ProNode,
  proBenefitNode: ProBenefitNode,
};

// Default Pros to populate if document has few positive annotations
const DEFAULT_PROS = [
  {
    id: "pro-default-1",
    title: "Statutory 30-Day Written Cure Period",
    clause: "Section 8.1 - Default & Remedies",
    explanation: "Requires formal written notification prior to any default declaration, protecting against sudden eviction or forfeiture.",
    badge: "Key Protection",
    benefit: "Guaranteed Remediation Window",
    impactTitle: "Operational Security Shield",
    impactDesc: "Tenant/Party cannot be locked out without minimum 30 days statutory opportunity to remedy."
  },
  {
    id: "pro-default-2",
    title: "Capped Security Deposit Refund Guarantee",
    clause: "Section 3.4 - Escrow Terms",
    explanation: "Statutory limit on deposit retention with strict requirement for itemized accounting within 21 business days.",
    badge: "Financial Guardrail",
    benefit: "Strict Escrow Accounting",
    impactTitle: "Liquid Deposit Return Protection",
    impactDesc: "Landlord/Licensor faces double damages penalty if deposit itemization is delayed."
  },
  {
    id: "pro-default-3",
    title: "Quiet Enjoyment & Exclusivity Grant",
    clause: "Section 12.0 - Covenant of Quiet Use",
    explanation: "Grants undisturbed possession and exclusive operational rights for the designated premises during agreement tenure.",
    badge: "Operational Right",
    benefit: "Exclusive Usage Guarantee",
    impactTitle: "Zero Landlord Interference Shield",
    impactDesc: "Ensures business continuity without unauthorized entry or competing sub-leases."
  }
];

export default function WhatIfMap({ documentTitle, risks, onClose }: WhatIfMapProps) {
  const [activeScenario, setActiveScenario] = useState<DecisionScenarioKey>("as_is");
  const [filterMode, setFilterMode] = useState<"all" | "cons_only" | "pros_only">("all");

  // Construct dynamic ReactFlow nodes & edges centered around "What If I Make This Decision?"
  const { nodes, edges, prosCount, consCount } = useMemo(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Decision Title & Details based on scenario
    let decisionTitle = "What if I sign this agreement as proposed?";
    let scenarioLabel = "As-Is Signature";
    let centerDesc = "Analyzes immediate contractual risks (Cons on Left) vs statutory protections (Pros on Right).";

    if (activeScenario === "negotiate") {
      decisionTitle = "What if I negotiate core critical clauses?";
      scenarioLabel = "Negotiated Addendum";
      centerDesc = "Simulates amended contract terms where critical liability caps and cure periods are negotiated.";
    } else if (activeScenario === "decline") {
      decisionTitle = "What if I decline and exit this agreement?";
      scenarioLabel = "Decline & Exit";
      centerDesc = "Simulates zero legal liability vs lost operational opportunity costs.";
    }

    // Position Center Node at (500, 250)
    const centerX = 500;
    const centerY = 250;

    initialNodes.push({
      id: "center-decision-node",
      type: "centerDecision",
      position: { x: centerX, y: centerY },
      data: {
        title: decisionTitle,
        scenarioLabel,
        description: centerDesc,
      },
    });

    // Derive Cons (Left Side) based on risks
    const consData = activeScenario === "decline" 
      ? [
          {
            id: "con-dec-1",
            title: "Lost Commercial / Housing Opportunity",
            clause: "Exit Consequence",
            severity: "warning" as const,
            explanation: "Forfeits the specific property location, contract deal terms, or commercial partnership opportunity.",
            statute: "Opportunity Cost Analysis",
            impactTitle: "Re-Sourcing Cost",
            impactDesc: "Will require spending 2-4 weeks evaluating alternative lease contracts."
          },
          {
            id: "con-dec-2",
            title: "Application & legal Review Fee Sunk Cost",
            clause: "Sunk Expenses",
            severity: "note" as const,
            explanation: "Non-refundable legal vetting fees and application background check fees.",
            statute: "Financial Expenditure",
            impactTitle: "Direct Financial Loss",
            impactDesc: "Unrecoverable administrative costs spent on contract evaluation."
          }
        ]
      : risks.length > 0 
        ? risks.map((r, i) => ({
            id: r.id || `risk-${i}`,
            title: r.title,
            clause: r.clause,
            severity: activeScenario === "negotiate" && r.severity === "critical" ? ("warning" as const) : r.severity,
            explanation: activeScenario === "negotiate" 
              ? `[Negotiated Mitigation] ${r.explanation.substring(0, 100)}... Liability capped at 2x monthly rent.`
              : r.explanation,
            statute: r.statuteReference,
            impactTitle: r.severity === "critical" 
              ? "High Civil & Statutory Liability Risk" 
              : "Dispute / Invalid Provision Potential",
            impactDesc: `Failure to comply could result in court enforcement under ${r.statuteReference || "local common law"}.`
          }))
        : [
            {
              id: "con-default-1",
              title: "Uncapped Indemnity Exposure",
              clause: "Section 14.2 - Indemnification",
              severity: "critical" as const,
              explanation: "Requires party to indemnify against all third-party legal claims without damage ceiling.",
              statute: "Civil Code §1717",
              impactTitle: "Uncapped Financial Risk",
              impactDesc: "Exposes assets to unlimited attorney fees during third-party disputes."
            }
          ];

    // Derive Pros (Right Side)
    const prosData = activeScenario === "decline"
      ? [
          {
            id: "pro-dec-1",
            title: "Zero Legal & Statutory Exposure",
            clause: "Full Risk Mitigation",
            badge: "Absolute Safety",
            explanation: "Completely eliminates potential dispute lawsuits, uncapped indemnities, and penalty fees.",
            benefit: "100% Risk Shield",
            impactTitle: "Complete Asset Protection",
            impactDesc: "No contractual obligation binding company or personal liability."
          },
          {
            id: "pro-dec-2",
            title: "Capital Liquidity Preservation",
            clause: "Financial Reserve",
            badge: "Capital Freedom",
            explanation: "Retains full security deposit funds and monthly rent payments for alternative ventures.",
            benefit: "Fluid Working Capital",
            impactTitle: "Financial Flexibility",
            impactDesc: "Funds remain available for higher-return or lower-risk opportunities."
          }
        ]
      : DEFAULT_PROS;

    const shouldShowCons = filterMode !== "pros_only";
    const shouldShowPros = filterMode !== "cons_only";

    // ----------------------------------------------------
    // BUILD LEFT SIDE NODES & EDGES (CONS)
    // ----------------------------------------------------
    if (shouldShowCons) {
      const totalCons = consData.length;
      const consSpacingY = 220;
      const consStartY = centerY - ((totalCons - 1) * consSpacingY) / 2;

      consData.forEach((con, idx) => {
        const conNodeId = `con-node-${idx}`;
        const impactNodeId = `impact-node-${idx}`;
        const conY = consStartY + idx * consSpacingY;

        // Column 1 Left: Con Node (x: 100)
        initialNodes.push({
          id: conNodeId,
          type: "conNode",
          position: { x: 100, y: conY },
          data: {
            title: con.title,
            clause: con.clause,
            severity: con.severity,
            explanation: con.explanation,
            statute: con.statute,
          },
        });

        // Edge: Center Decision Node -> Con Node
        initialEdges.push({
          id: `edge-center-to-${conNodeId}`,
          source: "center-decision-node",
          sourceHandle: "center-cons-out",
          target: conNodeId,
          targetHandle: "con-target-right",
          animated: true,
          style: {
            stroke: con.severity === "critical" ? "#F43F5E" : "#F59E0B",
            strokeWidth: con.severity === "critical" ? 3 : 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: con.severity === "critical" ? "#F43F5E" : "#F59E0B",
          },
        });

        // Column 0 Far Left: Impact Node (x: -240)
        initialNodes.push({
          id: impactNodeId,
          type: "conImpactNode",
          position: { x: -240, y: conY + 15 },
          data: {
            title: con.impactTitle,
            description: con.impactDesc,
          },
        });

        // Edge: Con Node -> Impact Node
        initialEdges.push({
          id: `edge-${conNodeId}-to-impact`,
          source: conNodeId,
          sourceHandle: "con-source-left",
          target: impactNodeId,
          targetHandle: "impact-target-right",
          style: { stroke: "#FB7185", strokeWidth: 1.5, strokeDasharray: "4 4" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#FB7185" },
        });
      });
    }

    // ----------------------------------------------------
    // BUILD RIGHT SIDE NODES & EDGES (PROS)
    // ----------------------------------------------------
    if (shouldShowPros) {
      const totalPros = prosData.length;
      const prosSpacingY = 220;
      const prosStartY = centerY - ((totalPros - 1) * prosSpacingY) / 2;

      prosData.forEach((pro, idx) => {
        const proNodeId = `pro-node-${idx}`;
        const benefitNodeId = `benefit-node-${idx}`;
        const proY = prosStartY + idx * prosSpacingY;

        // Column 1 Right: Pro Node (x: 940)
        initialNodes.push({
          id: proNodeId,
          type: "proNode",
          position: { x: 940, y: proY },
          data: {
            title: pro.title,
            clause: pro.clause,
            badge: pro.badge,
            explanation: pro.explanation,
            benefit: pro.benefit,
          },
        });

        // Edge: Center Decision Node -> Pro Node
        initialEdges.push({
          id: `edge-center-to-${proNodeId}`,
          source: "center-decision-node",
          sourceHandle: "center-pros-out",
          target: proNodeId,
          targetHandle: "pro-target-left",
          animated: true,
          style: { stroke: "#10B981", strokeWidth: 2.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#10B981" },
        });

        // Column 0 Far Right: Strategic Benefit Node (x: 1280)
        initialNodes.push({
          id: benefitNodeId,
          type: "proBenefitNode",
          position: { x: 1280, y: proY + 15 },
          data: {
            title: pro.impactTitle,
            description: pro.impactDesc,
          },
        });

        // Edge: Pro Node -> Benefit Node
        initialEdges.push({
          id: `edge-${proNodeId}-to-benefit`,
          source: proNodeId,
          sourceHandle: "pro-source-right",
          target: benefitNodeId,
          targetHandle: "benefit-target-left",
          style: { stroke: "#34D399", strokeWidth: 1.5, strokeDasharray: "4 4" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#34D399" },
        });
      });
    }

    return {
      nodes: initialNodes,
      edges: initialEdges,
      prosCount: prosData.length,
      consCount: consData.length,
    };
  }, [activeScenario, filterMode, risks]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xl flex flex-col font-sans animate-fade-in text-slate-900 dark:text-slate-100">
      {/* TOP HEADER BAR */}
      <header className="h-16 px-6 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/90 dark:border-slate-800 flex items-center justify-between gap-4 text-slate-900 dark:text-slate-100 shadow-xs backdrop-blur-md">
        {/* Title & Document Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-semibold group cursor-pointer"
            title="Back to Case Analysis"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-0.5">arrow_back</span>
            <span>Back</span>
          </button>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[22px]">alt_route</span>
          </div>
          <div>
            <h2 className="font-[Plus_Jakarta_Sans] font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              What-If Decision Map
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                Interactive Map
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md font-[Inter]">{documentTitle}</p>
          </div>
        </div>

        {/* Center Scenario Switcher Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-medium">
          <button
            onClick={() => setActiveScenario("as_is")}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-semibold ${
              activeScenario === "as_is"
                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-slate-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Option A: Sign As-Is
          </button>
          <button
            onClick={() => setActiveScenario("negotiate")}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-semibold ${
              activeScenario === "negotiate"
                ? "bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-slate-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Option B: Negotiate Terms
          </button>
          <button
            onClick={() => setActiveScenario("decline")}
            className={`px-3.5 py-1.5 rounded-xl transition-all font-semibold ${
              activeScenario === "decline"
                ? "bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-300 shadow-sm border border-slate-200 dark:border-slate-600"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            }`}
          >
            Option C: Decline Agreement
          </button>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* View Filter Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterMode === "all" ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode("cons_only")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterMode === "cons_only" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
              }`}
            >
              Cons Only
            </button>
            <button
              onClick={() => setFilterMode("pros_only")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterMode === "pros_only" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              Pros Only
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
            title="Close What-If Map"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </header>

      {/* MAIN FLOW CANVAS */}
      <div className="flex-1 w-full h-full relative bg-[#F8F9FA] dark:bg-[#0B1120]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.25 }}
          minZoom={0.2}
          maxZoom={1.5}
        >
          {/* Dot Pattern Canvas */}
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#CBD5E1" />
          
          <Controls className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl overflow-hidden shadow-lg fill-slate-800 dark:fill-slate-200" />
          
          <MiniMap
            nodeColor={(node) => {
              if (node.type === "centerDecision") return "#4F46E5";
              if (node.type === "conNode" || node.type === "conImpactNode") return "#F43F5E";
              if (node.type === "proNode" || node.type === "proBenefitNode") return "#10B981";
              return "#64748B";
            }}
            maskColor="rgba(15, 23, 42, 0.7)"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-md"
          />

          {/* Top-Left Visual Guide Panel */}
          <Panel position="top-left" className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 p-3.5 rounded-2xl backdrop-blur-md shadow-lg text-xs space-y-1.5 max-w-xs">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-[Plus_Jakarta_Sans]">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping" />
              What-If Agreement Analysis
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-[Inter]">
              The central decision node connects <strong>Cons (Risks &amp; Disadvantages)</strong> on the left side with <strong>Pros (Protections &amp; Value)</strong> on the right side.
            </p>
            <div className="pt-2 flex items-center gap-3 text-[10px] font-mono font-bold">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Cons (Left)
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Pros (Right)
              </span>
            </div>
          </Panel>

          {/* Floating Bottom Net Balance Summary Bar */}
          <Panel position="bottom-center" className="mb-4">
            <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 backdrop-blur-xl px-6 py-3 rounded-full shadow-xl flex items-center gap-6 text-xs font-medium text-slate-900 dark:text-slate-100 border-t-2 border-t-indigo-600">
              <div className="flex items-center gap-2 font-[Plus_Jakarta_Sans]">
                <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-mono">Decision Balance:</span>
                <span className="font-extrabold text-sm text-indigo-700 dark:text-indigo-300">
                  {activeScenario === "as_is" ? "Sign Agreement As-Is" : activeScenario === "negotiate" ? "Negotiated Terms" : "Decline Agreement"}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/60">
                  <span className="material-symbols-outlined text-[16px]">warning</span>
                  {consCount} Cons Identified
                </span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  {prosCount} Pros Highlighted
                </span>
              </div>

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Net Risk Rating:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold uppercase ${
                  consCount > prosCount ? "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60" : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                }`}>
                  {consCount > prosCount ? "Higher Risk Exposure" : "Balanced / Favorable"}
                </span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

