import "../setupDom";
/**
 * [API ROUTE TEST SUITE: /api/case/[id]/followup]
 * Unit tests for contextual RAG follow-up API route verifying cachedContent reuse, case access control, and response logic.
 */
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { POST } from "@/app/api/case/[id]/followup/route";
import { NextRequest } from "next/server";
import Case from "@/models/case.model";
import Conversation from "@/models/conversation.model";
import { ai } from "@/config/gemini";
import mongoose from "mongoose";

import { IUser } from "@/models/user.model";
import { authService } from "@/lib/authUtils";

(globalThis as unknown as Record<string, unknown>).mongooseCache = { conn: mongoose, promise: Promise.resolve(mongoose) };

describe("API Route: /api/case/[id]/followup", () => {
  const mockUserId = "650000000000000000000001";
  const foreignUserId = "650000000000000000000099";
  const validCaseId = "650000000000000000000002";

  const mockUser = {
    _id: { toString: () => mockUserId, equals: (id: string) => id === mockUserId },
    name: "Test User",
    email: "test@example.com",
  };

  const mockCaseDoc = {
    _id: { toString: () => validCaseId },
    userId: { toString: () => mockUserId },
    fileName: "Commercial_Lease.pdf",
    fileSummary: "Lease text preview",
    prompt: "Initial prompt",
    status: "completed",
    analysis: {
      documentTitle: "Commercial Lease Agreement",
      documentType: "Lease",
      jurisdiction: "California",
      effectiveDate: "2026-01-01",
      overallRiskScore: 70,
      confidenceScore: 90,
      summary: "High risk lease document.",
      parties: [{ role: "Lessor", name: "Property Co" }],
      risks: [
        {
          severity: "critical",
          title: "Automatic Renewal",
          clause: "Section 12",
          explanation: "Renews without notice",
        },
      ],
      extractedTerms: [{ label: "Rent", value: "$5,000/mo" }],
      recommendations: ["Renegotiate section 12"],
    },
  };

  beforeEach(() => {
    mock.restoreAll();
    mock.method(authService, "getSession", async () => ({
      user: { email: "test@example.com", name: "Test User" },
    }));
    mock.method(authService, "findUserByEmail", async () => mockUser as unknown as IUser);
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it("should return 401 if user is unauthenticated", async () => {
    mock.method(authService, "getSession", async () => null);

    const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}/followup`, {
      method: "POST",
      body: JSON.stringify({ question: "Is this clause risky?" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: validCaseId }) });
    assert.strictEqual(res.status, 401);
  });

  it("should return 400 if case ID is invalid format", async () => {
    const req = new NextRequest("http://localhost:3000/api/case/bad-id/followup", {
      method: "POST",
      body: JSON.stringify({ question: "What is the rent?" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "bad-id" }) });
    assert.strictEqual(res.status, 400);
  });

  it("should return 404 if case does not exist", async () => {
    mock.method(Case, "findById", () => ({
      lean: async () => null,
    }));

    const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}/followup`, {
      method: "POST",
      body: JSON.stringify({ question: "Explain clause 5" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: validCaseId }) });
    assert.strictEqual(res.status, 404);
  });

  it("should return 403 if case belongs to another user", async () => {
    const foreignCase = {
      ...mockCaseDoc,
      userId: { toString: () => foreignUserId },
    };

    mock.method(Case, "findById", () => ({
      lean: async () => foreignCase,
    }));

    const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}/followup`, {
      method: "POST",
      body: JSON.stringify({ question: "Explain clause 5" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: validCaseId }) });
    assert.strictEqual(res.status, 403);
  });

  it("should reuse cachedContent when present and return AI answer", async () => {
    mock.method(Case, "findById", () => ({
      lean: async () => mockCaseDoc,
    }));

    mock.method(Conversation, "findOne", async () => ({
      messages: [],
      save: async () => {},
    }));

    (ai as unknown as Record<string, unknown>).caches = {
      create: async () => ({ name: "cachedContents/case-123-cache" }),
    };

    const mockAiResponse = {
      answer: "The automatic renewal clause poses a major legal risk.",
      keyPoints: ["Requires 90-day written notice to cancel"],
      confidence: "high",
      relatedClauses: ["Section 12"],
      disclaimer: true,
    };

    mock.method(ai.models, "generateContent", async () => ({
      text: JSON.stringify(mockAiResponse),
    }));

    const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}/followup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Is Section 12 safe?" }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: validCaseId }) });
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.response.answer, mockAiResponse.answer);
  });
});
