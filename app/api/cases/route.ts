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
import { logger } from "@/lib/logger";

interface LeanCaseItem {
  _id: { toString: () => string };
  fileName: string;
  status: string;
  createdAt: Date;
  analysis?: {
    documentTitle?: string;
    documentType?: string;
    overallRiskScore?: number;
    risks?: unknown[];
  };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse || !user) return errorResponse!;

    // Parse query params for pagination
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // 2. Fetch user's cases with pagination & projection (excluding heavy fileSummary string)
    const [cases, totalCount] = await Promise.all([
      Case.find({ userId: user._id })
        .select("_id fileName status createdAt analysis.documentTitle analysis.documentType analysis.overallRiskScore analysis.risks")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Case.countDocuments({ userId: user._id }),
    ]);

    const formattedCases = (cases as unknown as LeanCaseItem[]).map((c) => ({
      _id: c._id.toString(),
      fileName: c.fileName,
      documentTitle: c.analysis?.documentTitle || c.fileName,
      documentType: c.analysis?.documentType || "Legal Document",
      overallRiskScore: c.analysis?.overallRiskScore ?? 0,
      status: c.status,
      createdAt: c.createdAt,
      risksCount: c.analysis?.risks?.length ?? 0,
    }));

    const hasMore = skip + cases.length < totalCount;

    return NextResponse.json({
      success: true,
      cases: formattedCases,
      page,
      limit,
      total: totalCount,
      hasMore,
    });
  } catch (error: unknown) {
    logger.error("❌ [/api/cases] Error fetching case history:", error);
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to fetch case history.") },
      { status: 500 }
    );
  }
}
