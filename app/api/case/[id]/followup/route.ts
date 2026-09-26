/**
 * JurisAI Case Follow-Up API Route
 * 
 * [AI FEATURE: Contextual Retrieval-Augmented Generation (RAG Engine)]
 * [FEATURE: Interactive Document-Specific Q&A & Counter-Proposal Drafting]
 * [SECURITY FEATURE: Input Sanitization & Session Verification]
 */
import { NextResponse } from "next/server";
import Case from "@/models/case.model";
import Conversation from "@/models/conversation.model";
import { generateGeminiContent, createGeminiContextCache } from "@/config/gemini";
import { FOLLOWUP_SYSTEM_INSTRUCTION } from "@/config/followupSystemPrompt";
import { sanitizeString, safeErrorMessage } from "@/lib/security";
import { withAuth } from "@/lib/authUtils";
import { logger } from "@/lib/logger";

export interface FollowupParty {
  role?: string;
  name?: string;
}

export interface FollowupRisk {
  severity: string;
  title: string;
  clause: string;
  statuteReference?: string;
  sourceText?: string;
  explanation?: string;
}

export interface FollowupExtractedTerm {
  label: string;
  value: string;
}

export interface FollowupMessageItem {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date | string;
}

export interface FollowupParsedResponse {
  answer?: string;
  keyPoints?: string[];
  confidence?: "high" | "medium" | "low" | string;
  relatedClauses?: string[];
  disclaimer?: boolean;
}

/**
 * POST /api/case/[id]/followup
 * Send a follow-up question about an analyzed case and get an AI response.
 */
export const POST = withAuth<{ id: string }>(async (request, { user, params }) => {
  try {

    // 3. Validate case ID
    const { id } = params;
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
    const analysis = (caseDoc.analysis || {}) as Record<string, unknown>;
    const parties = Array.isArray(analysis.parties) ? (analysis.parties as FollowupParty[]) : [];
    const risks = Array.isArray(analysis.risks) ? (analysis.risks as FollowupRisk[]) : [];
    const extractedTerms = Array.isArray(analysis.extractedTerms)
      ? (analysis.extractedTerms as FollowupExtractedTerm[])
      : [];
    const recommendations = Array.isArray(analysis.recommendations)
      ? (analysis.recommendations as string[])
      : [];

    const staticDocumentContext = [
      `## Document Information`,
      `- **Title:** ${(analysis.documentTitle as string) || caseDoc.fileName}`,
      `- **Type:** ${(analysis.documentType as string) || "Legal Document"}`,
      `- **Jurisdiction:** ${(analysis.jurisdiction as string) || "Not specified"}`,
      `- **Effective Date:** ${(analysis.effectiveDate as string) || "Not specified"}`,
      `- **Overall Risk Score:** ${(analysis.overallRiskScore as number) ?? "N/A"}/100`,
      `- **Confidence Score:** ${(analysis.confidenceScore as number) ?? "N/A"}%`,
      ``,
      `## AI Summary`,
      (analysis.summary as string) || "No summary available.",
      ``,
      `## Parties`,
      ...parties.map((p) => `- **${p.role || "Party"}:** ${p.name || "Unknown"}`),
      ``,
      `## Flagged Risks (${risks.length} items)`,
      ...risks.map(
        (r, i) =>
          `${i + 1}. [${(r.severity || "").toUpperCase()}] **${r.title || ""}** (${r.clause || ""})${
            r.statuteReference ? ` — Ref: ${r.statuteReference}` : ""
          }\n   Locator: "${(r.sourceText || "").substring(0, 100)}"\n   Explanation: ${(r.explanation || "").substring(0, 150)}`
      ),
      ``,
      `## Extracted Terms`,
      ...extractedTerms.map((t) => `- **${t.label || ""}:** ${t.value || ""}`),
      ``,
      `## Recommendations`,
      ...recommendations.map((r, i) => `${i + 1}. ${r}`),
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
          .map((m: FollowupMessageItem) => {
            let textContent = m.content;
            if (m.role === "assistant") {
              try {
                const parsed = JSON.parse(m.content) as FollowupParsedResponse;
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
    let parsedResponse: FollowupParsedResponse;

    if (typeof aiResponse === "object" && aiResponse !== null) {
      parsedResponse = aiResponse as FollowupParsedResponse;
    } else if (typeof aiResponse === "string") {
      try {
        const cleaned = aiResponse
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/, "")
          .trim();
        parsedResponse = JSON.parse(cleaned) as FollowupParsedResponse;
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
      confidence: ["high", "medium", "low"].includes(parsedResponse.confidence || "")
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
  } catch (error: unknown) {
    logger.error("❌ [/api/case/[id]/followup] Error:", error);
    return NextResponse.json(
      {
        error: safeErrorMessage(error, "Failed to process follow-up question."),
      },
      { status: 500 }
    );
  }
});

/**
 * GET /api/case/[id]/followup
 * Retrieve the conversation history for a specific case.
 */
export const GET = withAuth<{ id: string }>(async (_request, { user, params }) => {
  try {
    const { id } = params;
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
  } catch (error: unknown) {
    logger.error("❌ [/api/case/[id]/followup] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to load conversation." },
      { status: 500 }
    );
  }
});
