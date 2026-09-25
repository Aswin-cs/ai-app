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
import { generateGeminiContent, createGeminiContextCache } from "@/config/gemini";
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

    // 7. Build static document context for the AI
    const analysis = caseDoc.analysis as Record<string, any>;

    const staticDocumentContext = [
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
          }\n   Locator: "${(r.sourceText || "").substring(0, 100)}"\n   Explanation: ${(r.explanation || "").substring(0, 150)}`
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
      ...(caseDoc.fileSummary
        ? [`\n## Original Document Text Excerpt\n${caseDoc.fileSummary.substring(0, 2000)}`]
        : []),
      ...(caseDoc.prompt
        ? [`\n## User's Original Analysis Prompt\n${caseDoc.prompt}`]
        : []),
    ].join("\n");

    // Attempt Gemini Context Caching for static document context
    const cacheName = await createGeminiContextCache({
      systemInstruction: FOLLOWUP_SYSTEM_INSTRUCTION,
      contents: [{ role: "user", parts: [{ text: staticDocumentContext }] }],
      ttlSeconds: 900, // 15-min TTL cache
    });

    // Aggressively trim conversation history (last 4 messages / 2 turns, capped at 200 chars each)
    const recentMessages = conversation.messages.slice(-4);
    const conversationHistory = recentMessages.length
      ? `\n\n## Recent Conversation\n${recentMessages
          .map((m: any) => {
            let textContent = m.content;
            if (m.role === "assistant") {
              try {
                const parsed = JSON.parse(m.content);
                textContent = parsed.answer || m.content;
              } catch {}
            }
            return `**${m.role === "user" ? "User" : "JurisAI"}:** ${textContent.substring(0, 200)}`;
          })
          .join("\n\n")}`
      : "";

    // 8. Generate AI response
    const deltaPrompt = `${conversationHistory}\n\n---\n\nBased on the document analysis context, answer this follow-up question:\n\n"${trimmedQuestion}"`;
    const fullContents = cacheName
      ? deltaPrompt
      : `${staticDocumentContext}\n\n${deltaPrompt}`;

    const aiResponse = await generateGeminiContent({
      systemInstruction: FOLLOWUP_SYSTEM_INSTRUCTION,
      contents: fullContents,
      maxOutputTokens: 2048,
      cachedContent: cacheName || undefined,
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
