/**
 * JurisAI Case Follow-Up API Route
 * 
 * [AI FEATURE: Contextual Retrieval-Augmented Generation (RAG Engine)]
 * [FEATURE: Interactive Document-Specific Q&A & Counter-Proposal Drafting]
 * [SECURITY FEATURE: Input Sanitization & Session Verification]
 */
import { NextRequest, NextResponse } from "next/server";
import Case from "@/models/case.model";
import Conversation from "@/models/conversation.model";
import { generateGeminiContent } from "@/config/gemini";
import { FOLLOWUP_SYSTEM_INSTRUCTION } from "@/config/followupSystemPrompt";
import { sanitizeString, safeErrorMessage } from "@/lib/security";
import { getAuthenticatedUser } from "@/lib/authUtils";


/**
 * POST /api/case/[id]/followup
 * Send a follow-up question about an analyzed case and get an AI response.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user & connect to DB
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Validate case ID
    const { id } = await params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid case ID format." },
        { status: 400 }
      );
    }

    // 4. Find the case and verify ownership
    const caseDoc = await Case.findById(id).lean();
    if (!caseDoc) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    if (caseDoc.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Access denied." },
        { status: 403 }
      );
    }

    if (caseDoc.status !== "completed" || !caseDoc.analysis) {
      return NextResponse.json(
        { error: "Case analysis is not yet complete." },
        { status: 400 }
      );
    }

    // 5. Parse request body
    const body = await request.json();
    const rawQuestion = body?.question;

    if (!rawQuestion || typeof rawQuestion !== "string" || !rawQuestion.trim()) {
      return NextResponse.json(
        { error: "A question is required." },
        { status: 400 }
      );
    }

    const trimmedQuestion = sanitizeString(rawQuestion, 2000);

    if (!trimmedQuestion) {
      return NextResponse.json(
        { error: "Invalid or empty question provided." },
        { status: 400 }
      );
    }


    // 6. Get or create conversation for this case + user
    let conversation = await Conversation.findOne({
      caseId: caseDoc._id,
      userId: user._id,
    });

    if (!conversation) {
      conversation = new Conversation({
        caseId: caseDoc._id,
        userId: user._id,
        messages: [],
      });
    }

    // 7. Build context for the AI
    const analysis = caseDoc.analysis as Record<string, any>;

    const documentContext = [
      `## Document Information`,
      `- **Title:** ${analysis.documentTitle || caseDoc.fileName}`,
      `- **Type:** ${analysis.documentType || "Legal Document"}`,
      `- **Jurisdiction:** ${analysis.jurisdiction || "Not specified"}`,
      `- **Effective Date:** ${analysis.effectiveDate || "Not specified"}`,
      `- **Overall Risk Score:** ${analysis.overallRiskScore ?? "N/A"}/100`,
      `- **Confidence Score:** ${analysis.confidenceScore ?? "N/A"}%`,
      ``,
      `## AI Summary`,
      analysis.summary || "No summary available.",
      ``,
      `## Parties`,
      ...(analysis.parties || []).map(
        (p: any) => `- **${p.role}:** ${p.name}`
      ),
      ``,
      `## Flagged Risks (${(analysis.risks || []).length} items)`,
      ...(analysis.risks || []).map(
        (r: any, i: number) =>
          `${i + 1}. [${r.severity.toUpperCase()}] **${r.title}** (${r.clause})${
            r.statuteReference ? ` — Ref: ${r.statuteReference}` : ""
          }\n   Source: "${(r.sourceText || "").substring(0, 200)}"\n   Explanation: ${(r.explanation || "").substring(0, 300)}`
      ),
      ``,
      `## Extracted Terms`,
      ...(analysis.extractedTerms || []).map(
        (t: any) => `- **${t.label}:** ${t.value}`
      ),
      ``,
      `## Recommendations`,
      ...(analysis.recommendations || []).map(
        (r: string, i: number) => `${i + 1}. ${r}`
      ),
    ].join("\n");

    // Include original document text excerpt (first 4000 chars)
    const docText = caseDoc.fileSummary
      ? `\n\n## Original Document Text (excerpt)\n${caseDoc.fileSummary.substring(0, 4000)}`
      : "";

    // Include user's original prompt if available
    const userPromptContext = caseDoc.prompt
      ? `\n\n## User's Original Analysis Prompt\n${caseDoc.prompt}`
      : "";

    // Build conversation history for context (last 10 messages)
    const recentMessages = conversation.messages.slice(-10);
    const conversationHistory = recentMessages.length
      ? `\n\n## Previous Conversation\n${recentMessages
          .map(
            (m: any) =>
              `**${m.role === "user" ? "User" : "JurisAI"}:** ${m.content.substring(0, 500)}`
          )
          .join("\n\n")}`
      : "";

    // 8. Generate AI response
    const fullContext = `${documentContext}${docText}${userPromptContext}${conversationHistory}`;

    const userMessage = `Based on the document analysis context provided, answer this follow-up question:\n\n"${trimmedQuestion}"`;

    const aiResponse = await generateGeminiContent({
      systemInstruction: FOLLOWUP_SYSTEM_INSTRUCTION,
      contents: `${fullContext}\n\n---\n\n${userMessage}`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    // 9. Parse and validate AI response
    let parsedResponse: any;

    if (typeof aiResponse === "object" && aiResponse !== null) {
      parsedResponse = aiResponse;
    } else if (typeof aiResponse === "string") {
      try {
        const cleaned = aiResponse
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        parsedResponse = JSON.parse(cleaned);
      } catch {
        // If JSON parsing fails, wrap raw text into structure
        parsedResponse = {
          answer: aiResponse,
          keyPoints: [],
          confidence: "medium",
          relatedClauses: [],
          disclaimer: true,
        };
      }
    } else {
      parsedResponse = {
        answer: "I was unable to generate a response. Please try rephrasing your question.",
        keyPoints: [],
        confidence: "low",
        relatedClauses: [],
        disclaimer: true,
      };
    }

    // Ensure required fields
    const finalResponse = {
      answer: parsedResponse.answer || "No response generated.",
      keyPoints: Array.isArray(parsedResponse.keyPoints)
        ? parsedResponse.keyPoints
        : [],
      confidence: ["high", "medium", "low"].includes(parsedResponse.confidence)
        ? parsedResponse.confidence
        : "medium",
      relatedClauses: Array.isArray(parsedResponse.relatedClauses)
        ? parsedResponse.relatedClauses
        : [],
      disclaimer: parsedResponse.disclaimer !== false,
    };

    // 10. Save messages to conversation
    conversation.messages.push({
      role: "user",
      content: trimmedQuestion,
      timestamp: new Date(),
    });

    conversation.messages.push({
      role: "assistant",
      content: JSON.stringify(finalResponse),
      timestamp: new Date(),
    });

    await conversation.save();

    // 11. Return response
    return NextResponse.json({
      success: true,
      response: finalResponse,
      messageCount: conversation.messages.length,
    });
  } catch (error: any) {
    console.error("❌ [/api/case/[id]/followup] Error:", error);
    return NextResponse.json(
      {
        error: safeErrorMessage(error, "Failed to process follow-up question."),
      },
      { status: 500 }
    );
  }
}


/**
 * GET /api/case/[id]/followup
 * Retrieve the conversation history for a specific case.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await getAuthenticatedUser();
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: "Invalid case ID." },
        { status: 400 }
      );
    }

    const conversation = await Conversation.findOne({
      caseId: id,
      userId: user._id,
    }).lean();

    return NextResponse.json({
      success: true,
      messages: conversation?.messages || [],
    });
  } catch (error: any) {
    console.error("❌ [/api/case/[id]/followup] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to load conversation." },
      { status: 500 }
    );
  }
}
