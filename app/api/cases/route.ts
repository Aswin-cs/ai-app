/**
 * JurisAI Case History API Route
 * 
 * [FEATURE: User Case History Listing & Executive Summaries]
 * [PERFORMANCE FEATURE: Database Query Projection & Payload Trimming]
 * [SECURITY FEATURE: Session Ownership Verification & Error Masking]
 */
import { NextRequest, NextResponse } from "next/server";
import Case from "@/models/case.model";
import { getAuthenticatedUser } from "@/lib/authUtils";
import { safeErrorMessage } from "@/lib/security";

export async function GET(_request: NextRequest) {
  try {
    // 1. Authenticate user
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse || !user) return errorResponse!;

    // 2. Fetch user's cases with projection (excluding heavy fileSummary string)
    const cases = await Case.find({ userId: user._id })
      .select("_id fileName status createdAt analysis.documentTitle analysis.documentType analysis.overallRiskScore analysis.risks")
      .sort({ createdAt: -1 })
      .lean();

    const formattedCases = cases.map((c: any) => ({
      _id: c._id.toString(),
      fileName: c.fileName,
      documentTitle: c.analysis?.documentTitle || c.fileName,
      documentType: c.analysis?.documentType || "Legal Document",
      overallRiskScore: c.analysis?.overallRiskScore ?? 0,
      status: c.status,
      createdAt: c.createdAt,
      risksCount: c.analysis?.risks?.length ?? 0,
    }));

    return NextResponse.json({
      success: true,
      cases: formattedCases,
    });
  } catch (error: unknown) {
    console.error("❌ [/api/cases] Error fetching case history:", error);
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to fetch case history.") },
      { status: 500 }
    );
  }
}


