import { NextResponse } from "next/server";
import Case from "@/models/case.model";
import { withAuth } from "@/lib/authUtils";
import { safeErrorMessage } from "@/lib/security";
import { logger } from "@/lib/logger";

export const GET = withAuth<{ id: string }>(async (_request, { user, params }) => {
  try {
    // 2. Validate ObjectId format
    const { id } = params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
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

    // 3. Verify ownership — user can only access their own cases
    if (caseDoc.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Access denied. This case does not belong to you." },
        { status: 403 }
      );
    }

    // 4. Return the case data
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
  } catch (error: unknown) {
    logger.error("❌ [/api/case/[id]] Error:", error);
    return NextResponse.json(
      { error: safeErrorMessage(error, "Internal server error.") },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth<{ id: string }>(async (_request, { user, params }) => {
  try {
    // 2. Validate ID
    const { id } = params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid case ID format." },
        { status: 400 }
      );
    }

    // 3. Find case and verify ownership
    const caseDoc = await Case.findById(id);
    if (!caseDoc) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    if (caseDoc.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Access denied. You can only delete your own cases." },
        { status: 403 }
      );
    }

    // 4. Delete document
    await Case.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Case deleted successfully.",
    });
  } catch (error: unknown) {
    logger.error("❌ [/api/case/[id]] DELETE error:", error);
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to delete case.") },
      { status: 500 }
    );
  }
});
