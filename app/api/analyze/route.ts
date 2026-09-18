import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/config/db";
import Case from "@/models/case.model";
import User from "@/models/user.model";
import { generateGeminiContent } from "@/config/gemini";
import {
  LEGAL_SYSTEM_INSTRUCTION,
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/config/legalSystemPrompt";
import { GEMINI_RESPONSE_SCHEMA } from "@/types/case.types";

/**
 * Extract plain text from a DOCX file buffer.
 * DOCX is a ZIP archive containing XML files. We extract text from
 * word/document.xml by stripping XML tags.
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid bundling issues
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")?.async("string");

  if (!documentXml) {
    throw new Error("Could not find document.xml inside DOCX file");
  }

  // Strip XML tags and decode common XML entities
  const text = documentXml
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

/**
 * Build Gemini content parts based on file type.
 * - Text/DOCX: send as text content
 * - PDF/Images: send as inline base64 data
 */
function buildContentParts(
  fileBuffer: Buffer,
  mimeType: string,
  category: "text" | "document" | "image",
  extractedText: string | null,
  userPrompt: string
): any[] {
  const parts: any[] = [];

  // Add user prompt context if provided
  const promptPrefix = userPrompt
    ? `The user has provided the following additional context or question: "${userPrompt}"\n\nAnalyze the following document:\n\n`
    : "Analyze the following document:\n\n";

  if (category === "text" || (category === "document" && extractedText)) {
    // For text files and DOCX (extracted text), send as text content
    parts.push({
      text: promptPrefix + (extractedText || fileBuffer.toString("utf-8")),
    });
  } else {
    // For PDF and images, send as inline base64 data + text prompt
    parts.push({ text: promptPrefix });
    parts.push({
      inlineData: {
        data: fileBuffer.toString("base64"),
        mimeType: mimeType,
      },
    });
  }

  return parts;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to continue." },
        { status: 401 }
      );
    }

    // 2. Connect to MongoDB and find user
    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 }
      );
    }

    // 3. Parse the FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const prompt = (formData.get("prompt") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload a document to analyze." },
        { status: 400 }
      );
    }

    // 4. Validate file type
    const fileName = file.name;
    const fileExtension = "." + fileName.split(".").pop()?.toLowerCase();
    const fileTypeInfo = SUPPORTED_FILE_TYPES[fileExtension];

    if (!fileTypeInfo) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${fileExtension}. Supported types: ${Object.keys(SUPPORTED_FILE_TYPES).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 5. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
        },
        { status: 413 }
      );
    }

    // 6. Create Case document with "processing" status
    const caseDoc = await Case.create({
      userId: user._id,
      fileName: fileName,
      fileType: fileTypeInfo.mime,
      fileSize: file.size,
      prompt: prompt,
      status: "processing",
    });

    // 7. Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 8. Extract text content for fileSummary storage
    let extractedText: string | null = null;
    if (fileExtension === ".docx") {
      try {
        extractedText = await extractDocxText(fileBuffer);
      } catch (docxError: any) {
        // Update case as failed if DOCX extraction fails
        await Case.findByIdAndUpdate(caseDoc._id, {
          status: "failed",
          errorMessage: `Failed to extract text from DOCX: ${docxError?.message || docxError}`,
        });
        return NextResponse.json(
          { error: "Failed to parse DOCX file. The file may be corrupted." },
          { status: 422 }
        );
      }
    } else if (fileExtension === ".txt") {
      extractedText = fileBuffer.toString("utf-8");
    }

    // Build fileSummary — the readable text content of the uploaded file
    // For text-based files, store the full extracted text (capped at 50K chars)
    // For binary files (PDF/images), store a placeholder until AI analysis completes
    const fileSummary = extractedText
      ? extractedText.substring(0, 50000)
      : `[Binary file: ${fileName} — ${(file.size / 1024).toFixed(1)}KB ${fileTypeInfo.mime}]`;

    // 9. Build content parts for Gemini
    const contentParts = buildContentParts(
      fileBuffer,
      fileTypeInfo.mime,
      fileTypeInfo.category,
      extractedText,
      prompt
    );

    // 10. Call Gemini API with legal system instruction
    try {
      const analysisResult = await generateGeminiContent({
        contents: contentParts,
        systemInstruction: LEGAL_SYSTEM_INSTRUCTION,
        config: {
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        },
      });

      // 11. Save analysis result and fileSummary to case document
      // For binary files, update fileSummary with the AI-generated summary
      const finalFileSummary = extractedText
        ? fileSummary
        : (typeof analysisResult === "object" && analysisResult?.summary)
          ? analysisResult.summary
          : fileSummary;

      await Case.findByIdAndUpdate(caseDoc._id, {
        status: "completed",
        analysis: analysisResult,
        fileSummary: finalFileSummary,
      });

      return NextResponse.json(
        {
          success: true,
          caseId: caseDoc._id.toString(),
          status: "completed",
        },
        { status: 200 }
      );
    } catch (aiError: any) {
      // Update case as failed if Gemini call fails
      await Case.findByIdAndUpdate(caseDoc._id, {
        status: "failed",
        errorMessage: aiError?.message || "AI analysis failed",
      });

      return NextResponse.json(
        {
          error: "AI analysis failed. Please try again.",
          caseId: caseDoc._id.toString(),
          details: aiError?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("❌ [/api/analyze] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
