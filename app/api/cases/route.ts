import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/config/db";
import Case from "@/models/case.model";
import User from "@/models/user.model";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // 2. Connect to MongoDB
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 404 }
      );
    }

    // 3. Fetch user's cases sorted by newest first
    const cases = await Case.find({ userId: user._id })
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
  } catch (error: any) {
    console.error("❌ [/api/cases] Error fetching case history:", error);
    return NextResponse.json(
      { error: "Failed to fetch case history." },
      { status: 500 }
    );
  }
}
