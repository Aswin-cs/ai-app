import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/config/db";
import Case from "@/models/case.model";
import User from "@/models/user.model";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate the user
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

    // 3. Resolve params and find the case
    const { id } = await params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid case ID format." },
        { status: 400 }
      );
    }

    const caseDoc = await Case.findById(id).lean();

    if (!caseDoc) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    // 4. Verify ownership — user can only access their own cases
    if (caseDoc.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Access denied. This case does not belong to you." },
        { status: 403 }
      );
    }

    // 5. Return the case data
    return NextResponse.json({
      success: true,
      case: {
        _id: caseDoc._id.toString(),
        userId: caseDoc.userId.toString(),
        fileName: caseDoc.fileName,
        fileType: caseDoc.fileType,
        fileSize: caseDoc.fileSize,
        fileSummary: caseDoc.fileSummary,
        prompt: caseDoc.prompt,
        status: caseDoc.status,
        analysis: caseDoc.analysis,
        errorMessage: caseDoc.errorMessage,
        createdAt: caseDoc.createdAt,
        updatedAt: caseDoc.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("❌ [/api/case/[id]] Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
