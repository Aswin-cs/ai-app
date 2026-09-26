/**
 * JurisAI Centralized Severity & Color Styling Source of Truth
 * Provides unified color mappings, badge styles, dot colors, border colors,
 * and text classes for risk items and overall risk scores across components.
 */

export type SeverityLevel = "critical" | "warning" | "note" | "low" | string;

export interface SeverityStyles {
  severity: SeverityLevel;
  dotBgClass: string;
  textClass: string;
  badgeBgClass: string;
  badgeClass: string;
  cardBorderClass: string;
  cardBgClass: string;
  gradientClass: string;
}

/**
 * Returns unified Tailwind styling tokens for a given risk severity level.
 * Maps severity strings ("critical", "high", "warning", "medium", "note", "low") to design system tokens.
 *
 * @param {SeverityLevel} severity Raw severity string from analysis payload.
 * @returns {SeverityStyles} Style tokens object containing dot bg, text color, badge background/border, card border, card background, and gradient classes.
 */
export function getSeverityStyles(severity: SeverityLevel): SeverityStyles {
  const norm = (severity || "").toLowerCase().trim();

  if (norm === "critical" || norm === "high") {
    const badge = "bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    return {
      severity: "critical",
      dotBgClass: "bg-red-500",
      textClass: "text-red-600 dark:text-red-400",
      badgeBgClass: badge,
      badgeClass: badge,
      cardBorderClass: "border-red-200 dark:border-red-900/60",
      cardBgClass: "bg-red-50/40 dark:bg-red-950/30",
      gradientClass: "from-red-500 to-rose-600",
    };
  }

  if (norm === "warning" || norm === "medium" || norm === "moderate") {
    const badge = "bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
    return {
      severity: "warning",
      dotBgClass: "bg-amber-500",
      textClass: "text-amber-600 dark:text-amber-400",
      badgeBgClass: badge,
      badgeClass: badge,
      cardBorderClass: "border-amber-200 dark:border-amber-900/60",
      cardBgClass: "bg-amber-50/40 dark:bg-amber-950/30",
      gradientClass: "from-amber-400 to-orange-500",
    };
  }

  // Low / Note / Standard default
  const badge = "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
  return {
    severity: "note",
    dotBgClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    badgeBgClass: badge,
    badgeClass: badge,
    cardBorderClass: "border-slate-200 dark:border-slate-800",
    cardBgClass: "bg-slate-50/50 dark:bg-slate-800/40",
    gradientClass: "from-emerald-400 to-teal-500",
  };
}

/**
 * Returns unified Tailwind styling tokens and human-readable risk labels based on a 0-100 overall risk score.
 * Clamps input score between 0 and 100 automatically.
 *
 * @param {number} score Numeric risk score (0 to 100).
 * @returns {{ score: number, level: string, label: string, badgeClass: string, dotClass: string, textClass: string }} Styling object with clamped score, level identifier, human-readable label, and CSS utility classes.
 */
export function getRiskScoreStyles(score: number) {
  const safeScore = Math.max(0, Math.min(100, score || 0));

  if (safeScore >= 70) {
    return {
      score: safeScore,
      level: "critical",
      label: "High Risk",
      badgeClass: "bg-red-50 dark:bg-red-950/70 border-red-200/60 dark:border-red-800/60",
      dotClass: "bg-red-500",
      textClass: "text-red-600 dark:text-red-400 font-bold",
    };
  }

  if (safeScore >= 40) {
    return {
      score: safeScore,
      level: "warning",
      label: "Moderate Risk",
      badgeClass: "bg-amber-50 dark:bg-amber-950/70 border-amber-200/60 dark:border-amber-800/60",
      dotClass: "bg-amber-500 animate-pulse",
      textClass: "text-amber-600 dark:text-amber-400 font-bold",
    };
  }

  return {
    score: safeScore,
    level: "note",
    label: "Low Risk",
    badgeClass: "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200/60 dark:border-emerald-800/60",
    dotClass: "bg-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400 font-bold",
  };
}

