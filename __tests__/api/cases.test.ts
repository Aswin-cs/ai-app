/**
 * [API ROUTE TEST SUITE: /api/cases]
 * Unit tests for user case history listing, pagination, and ownership isolation.
 */
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { GET } from "@/app/api/cases/route";
import { NextRequest, NextResponse } from "next/server";
import Case from "@/models/case.model";
import mongoose from "mongoose";

(global as any).mongooseCache = { conn: mongoose, promise: Promise.resolve(mongoose) };

describe("API Route: /api/cases", () => {
  const mockUserId = "650000000000000000000001";
  const mockUser = {
    _id: { toString: () => mockUserId, equals: (id: string) => id === mockUserId },
    name: "Test Attorney",
    email: "attorney@example.com",
  };

  beforeEach(() => {
    mock.restoreAll();
    globalThis.__mockAuthResult = { user: mockUser as any, errorResponse: null };
  });

  afterEach(() => {
    globalThis.__mockAuthResult = undefined;
  });

  it("should return 401 if user is unauthenticated", async () => {
    globalThis.__mockAuthResult = {
      user: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };

    const req = new NextRequest("http://localhost:3000/api/cases");
    const res = await GET(req);

    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.error, "Unauthorized");
  });

  it("should fetch paginated cases scoped exclusively to the authenticated user", async () => {
    const mockCases = [
      {
        _id: { toString: () => "650000000000000000000002" },
        fileName: "Lease_Agreement.pdf",
        status: "completed",
        createdAt: new Date("2026-09-25T10:00:00Z"),
        analysis: {
          documentTitle: "Commercial Lease Agreement",
          documentType: "Lease",
          overallRiskScore: 65,
          risks: [{ id: "r1" }, { id: "r2" }],
        },
      },
    ];

    mock.method(Case, "find", (query: any) => {
      assert.strictEqual(query.userId, mockUser._id);
      return {
        select: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => mockCases,
              }),
            }),
          }),
        }),
      };
    });

    mock.method(Case, "countDocuments", async (query: any) => {
      assert.strictEqual(query.userId, mockUser._id);
      return 15;
    });

    const req = new NextRequest("http://localhost:3000/api/cases?page=1&limit=10");
    const res = await GET(req);

    assert.strictEqual(res.status, 200);
    const json = await res.json();

    assert.strictEqual(json.success, true);
    assert.strictEqual(json.page, 1);
    assert.strictEqual(json.limit, 10);
    assert.strictEqual(json.total, 15);
    assert.strictEqual(json.hasMore, true);
    assert.strictEqual(json.cases.length, 1);
    assert.strictEqual(json.cases[0].documentTitle, "Commercial Lease Agreement");
    assert.strictEqual(json.cases[0].risksCount, 2);
  });

  it("should return hasMore = false when on the final page", async () => {
    const mockCases = Array.from({ length: 5 }, (_, i) => ({
      _id: { toString: () => `65000000000000000000000${i + 1}` },
      fileName: `Doc_${i}.pdf`,
      status: "completed",
      createdAt: new Date(),
    }));

    mock.method(Case, "find", () => ({
      select: () => ({
        sort: () => ({
          skip: () => ({
            limit: () => ({
              lean: async () => mockCases,
            }),
          }),
        }),
      }),
    }));

    mock.method(Case, "countDocuments", async () => 5);

    const req = new NextRequest("http://localhost:3000/api/cases?page=1&limit=20");
    const res = await GET(req);

    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.hasMore, false);
    assert.strictEqual(json.total, 5);
  });
});
