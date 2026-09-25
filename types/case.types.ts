/**
 * Structured response schema for Gemini legal document analysis.
 * Every field maps to what the AI returns in JSON format.
 */

export interface CaseParty {
  role: string;
  name: string;
}

export interface ExtractedTerm {
  label: string;
  value: string;
}

export interface RiskItem {
  id: string;
  title: string;
  severity: "critical" | "warning" | "note";
  clause: string;
  sourceText: string;
  explanation: string;
  statuteReference?: string;
}

export interface CaseAnalysisResult {
  documentTitle: string;
  documentType: string;
  jurisdiction: string;
  parties: CaseParty[];
  effectiveDate: string;
  summary: string;
  extractedTerms: ExtractedTerm[];
  risks: RiskItem[];
  recommendations: string[];
  overallRiskScore: number;
  confidenceScore: number;
}

/**
 * Full Case document shape returned from the API (includes MongoDB metadata)
 */
export interface CaseDocument {
  _id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileSummary?: string;
  prompt?: string;
  status: "processing" | "completed" | "failed";
  analysis: CaseAnalysisResult | null;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * JSON schema description passed to Gemini's responseMimeType config
 * to enforce structured JSON output.
 */
export const GEMINI_RESPONSE_SCHEMA = {
  type: "object" as const,
  properties: {
    documentTitle: { type: "string" as const, description: "Title or heading of the document" },
    documentType: { type: "string" as const, description: "Type of legal document (e.g., Residential Lease Agreement, NDA, Employment Contract)" },
    jurisdiction: { type: "string" as const, description: "Jurisdiction or state the document pertains to" },
    parties: {
      type: "array" as const,
      maxItems: 5,
      description: "Parties involved in agreement (maximum 5 items)",
      items: {
        type: "object" as const,
        properties: {
          role: { type: "string" as const, description: "Role of the party (e.g., Landlord, Tenant, Employer)" },
          name: { type: "string" as const, description: "Name of the party" },
        },
        required: ["role", "name"],
      },
    },
    effectiveDate: { type: "string" as const, description: "Effective date of the agreement" },
    summary: { type: "string" as const, description: "Plain-language summary of the document's purpose and key obligations (2-3 sentences max)" },
    extractedTerms: {
      type: "array" as const,
      maxItems: 10,
      description: "Key extracted terms (maximum 10 items)",
      items: {
        type: "object" as const,
        properties: {
          label: { type: "string" as const, description: "Term label (e.g., Monthly Rent, Security Deposit, Term Length)" },
          value: { type: "string" as const, description: "Extracted value" },
        },
        required: ["label", "value"],
      },
    },
    risks: {
      type: "array" as const,
      maxItems: 15,
      description: "Array of flagged risk items (maximum 15 key items)",
      items: {
        type: "object" as const,
        properties: {
          id: { type: "string" as const, description: "Unique identifier for the risk item (e.g., risk-1)" },
          title: { type: "string" as const, description: "Short descriptive title of the risk" },
          severity: { type: "string" as const, enum: ["critical", "warning", "note"], description: "Severity classification" },
          clause: { type: "string" as const, description: "Clause or section reference in the document" },
          sourceText: { type: "string" as const, description: "Short clause locator or excerpt (heading/clause section + first ~10-15 words). Do not include full verbatim paragraphs." },
          explanation: { type: "string" as const, description: "Explanation of why this is flagged and what it means (2-3 sentences max)" },
          statuteReference: { type: "string" as const, description: "Applicable statute or code section, if confidently known" },
        },
        required: ["id", "title", "severity", "clause", "sourceText", "explanation"],
      },
    },
    recommendations: {
      type: "array" as const,
      maxItems: 5,
      items: { type: "string" as const },
      description: "List of recommended actions or considerations for the user (maximum 5 items)",
    },
    overallRiskScore: { type: "number" as const, description: "Overall risk score from 0 (safe) to 100 (very risky)" },
    confidenceScore: { type: "number" as const, description: "AI confidence in the analysis from 0 to 100" },
  },
  required: [
    "documentTitle", "documentType", "jurisdiction", "parties",
    "effectiveDate", "summary", "extractedTerms", "risks",
    "recommendations", "overallRiskScore", "confidenceScore",
  ],
};
