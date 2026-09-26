/**
 * [API ROUTE TEST SUITE: /api/case/[id]]
 * Unit tests for retrieving and deleting specific cases by ID with ownership security.
 */
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { GET, DELETE } from "@/app/api/case/[id]/route";
import { NextRequest } from "next/server";
import Case from "@/models/case.model";
import mongoose from "mongoose";

import { IUser } from "@/models/user.model";
import { authService } from "@/lib/authUtils";

(globalThis as unknown as Record<string, unknown>).mongooseCache = { conn: mongoose, promise: Promise.resolve(mongoose) };

describe("API Route: /api/case/[id]", () => {
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
    fileName: "Agreement.pdf",
    fileType: "application/pdf",
    fileSize: 50000,
    fileSummary: "Summary text",
    prompt: "Analyze lease",
    status: "completed",
    analysis: { documentTitle: "Commercial Lease", overallRiskScore: 45 },
    createdAt: new Date(),
    updatedAt: new Date(),
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

  describe("GET /api/case/[id]", () => {
    it("should return 401 if user is unauthenticated", async () => {
      mock.method(authService, "getSession", async () => null);

      const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}`);
      const res = await GET(req, { params: Promise.resolve({ id: validCaseId }) });

      assert.strictEqual(res.status, 401);
    });

    it("should return 400 if case ID format is invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/case/invalid-id");
      const res = await GET(req, { params: Promise.resolve({ id: "invalid-id" }) });

      assert.strictEqual(res.status, 400);
      const json = await res.json();
      assert.strictEqual(json.error, "Invalid case ID format.");
    });

    it("should return 404 if case is not found", async () => {
      mock.method(Case, "findById", () => ({
        lean: async () => null,
      }));

      const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}`);
      const res = await GET(req, { params: Promise.resolve({ id: validCaseId }) });

      assert.strictEqual(res.status, 404);
    });

    it("should return 403 if case belongs to a different user", async () => {
      const foreignCase = {
        ...mockCaseDoc,
        userId: { toString: () => foreignUserId },
      };

      mock.method(Case, "findById", () => ({
        lean: async () => foreignCase,
      }));

      const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}`);
      const res = await GET(req, { params: Promise.resolve({ id: validCaseId }) });

      assert.strictEqual(res.status, 403);
      const json = await res.json();
      assert.ok(json.error.includes("Access denied"));
    });

    it("should return 200 and case data when owner accesses case", async () => {
      mock.method(Case, "findById", () => ({
        lean: async () => mockCaseDoc,
      }));

      const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}`);
      const res = await GET(req, { params: Promise.resolve({ id: validCaseId }) });

      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.case._id, validCaseId);
      assert.strictEqual(json.case.fileName, "Agreement.pdf");
    });
  });

  describe("DELETE /api/case/[id]", () => {
    it("should return 401 if user is unauthenticated", async () => {
      mock.method(authService, "getSession", async () => null);

      const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}`, { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: validCaseId }) });

      assert.strictEqual(res.status, 401);
    });

    it("should delete case successfully if user owns it", async () => {
      mock.method(Case, "findById", async () => mockCaseDoc);
      mock.method(Case, "findByIdAndDelete", async () => mockCaseDoc);

      const req = new NextRequest(`http://localhost:3000/api/case/${validCaseId}`, { method: "DELETE" });
      const res = await DELETE(req, { params: Promise.resolve({ id: validCaseId }) });

      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
    });
  });
});
