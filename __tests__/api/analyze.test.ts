import "../setupDom";
/**
 * [API ROUTE TEST SUITE: /api/analyze]
 * Unit tests for document analysis API route testing happy path, authentication, input validation, and AI fallback/error cascades.
 */
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { POST } from "@/app/api/analyze/route";
import { NextRequest, NextResponse } from "next/server";
import Case from "@/models/case.model";
import { ai } from "@/config/gemini";
import { MAX_FILE_SIZE } from "@/config/legalSystemPrompt";
import mongoose from "mongoose";

import { IUser } from "@/models/user.model";

(globalThis as unknown as Record<string, unknown>).mongooseCache = { conn: mongoose, promise: Promise.resolve(mongoose) };

describe("API Route: /api/analyze", () => {
  const mockUserId = "650000000000000000000001";
  const mockUser = {
    _id: { toString: () => mockUserId, equals: (id: string) => id === mockUserId },
    name: "Test User",
    email: "test@example.com",
  };

  const createDummyFile = (name: string, type: string, content: string = "Sample contract text", size?: number) => {
    const blob = new Blob([content], { type });
    const file = new File([blob], name, { type });
    if (size) {
      Object.defineProperty(file, "size", { value: size });
    }
    return file;
  };

  beforeEach(() => {
    mock.restoreAll();
    globalThis.__mockAuthResult = { user: mockUser as unknown as IUser, errorResponse: null };

    mock.method(Case, "create", async (data: Record<string, unknown>) => ({
      _id: { toString: () => "650000000000000000000010" },
      ...data,
    }));
    mock.method(Case, "findByIdAndUpdate", async () => {});
  });

  afterEach(() => {
    globalThis.__mockAuthResult = undefined;
  });

  it("should return 401 if user is unauthenticated", async () => {
    globalThis.__mockAuthResult = {
      user: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };

    const formData = new FormData();
    formData.append("file", createDummyFile("contract.txt", "text/plain"));

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 401);
  });

  it("should return 400 if no file is provided in FormData", async () => {
    const formData = new FormData();
    formData.append("prompt", "Analyze lease");

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes("No file provided"));
  });

  it("should return 400 if file extension is unsupported", async () => {
    const formData = new FormData();
    formData.append("file", createDummyFile("malicious.exe", "application/octet-stream"));

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.ok(json.error.includes("Unsupported file type"));
  });

  it("should return 413 if file exceeds maximum size limit (10MB)", async () => {
    const oversizedBuffer = new Uint8Array(MAX_FILE_SIZE + 1024);
    const oversizedFile = new File([oversizedBuffer], "huge_lease.pdf", { type: "application/pdf" });

    const formData = new FormData();
    formData.append("file", oversizedFile);

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 413);
    const json = await res.json();
    assert.ok(json.error.includes("File too large"));
  });

  it("should process document, call Gemini API, and return 200 on happy path", async () => {
    const mockAnalysisResult = {
      documentTitle: "Office Lease Agreement",
      documentType: "Lease",
      overallRiskScore: 40,
      confidenceScore: 95,
      summary: "Standard office lease agreement",
      parties: [{ role: "Lessor", name: "Landlord LLC" }],
      risks: [{ id: "r1", severity: "warning", title: "Maintenance Duty", clause: "Section 5" }],
    };

    mock.method(ai.models, "generateContent", async () => ({
      text: JSON.stringify(mockAnalysisResult),
    }));

    const formData = new FormData();
    formData.append("file", createDummyFile("lease.txt", "text/plain", "Commercial Lease Agreement text content"));
    formData.append("prompt", "Focus on maintenance responsibilities");

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 200);

    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.caseId, "650000000000000000000010");
    assert.strictEqual(json.status, "completed");
  });

  it("should update case status to 'failed' and return 500 when Gemini analysis fails", async () => {
    let updatedStatus: string | undefined = undefined;
    mock.method(Case, "findByIdAndUpdate", async (_id: unknown, update: { status?: string }) => {
      updatedStatus = update.status;
    });

    mock.method(ai.models, "generateContent", async () => {
      throw new Error("All Gemini models exhausted.");
    });

    const formData = new FormData();
    formData.append("file", createDummyFile("agreement.txt", "text/plain", "Agreement content"));

    const req = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 500);

    const json = await res.json();
    assert.ok(json.error.includes("AI analysis failed"));
    assert.strictEqual(updatedStatus, "failed");
  });
});
