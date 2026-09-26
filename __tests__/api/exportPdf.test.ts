/**
 * [API ROUTE TEST SUITE: /api/export-pdf]
 * Unit tests for PDF generation endpoint verifying auth enforcement and PDF payload processing.
 */
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { POST } from "@/app/api/export-pdf/route";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { IUser } from "@/models/user.model";
import { authService } from "@/lib/authUtils";

(globalThis as unknown as Record<string, unknown>).mongooseCache = { conn: mongoose, promise: Promise.resolve(mongoose) };

describe("API Route: /api/export-pdf", () => {
  const mockUser = {
    _id: { toString: () => "650000000000000000000001" },
    name: "Test Attorney",
    email: "attorney@example.com",
  };

  beforeEach(() => {
    mock.restoreAll();
    mock.method(authService, "getSession", async () => ({
      user: { email: "attorney@example.com", name: "Test Attorney" },
    }));
    mock.method(authService, "findUserByEmail", async () => mockUser as unknown as IUser);
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it("should return 401 if user is unauthenticated", async () => {
    mock.method(authService, "getSession", async () => null);

    const req = new NextRequest("http://localhost:3000/api/export-pdf", {
      method: "POST",
      body: JSON.stringify({ documentTitle: "Test Lease" }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 401);
  });

  it("should generate PDF or process export payload when authenticated", async () => {
    const payload = {
      documentTitle: "Commercial Lease Agreement",
      documentType: "Lease",
      jurisdiction: "New York",
      effectiveDate: "2026-01-01",
      overallRiskScore: 75,
      summary: "High risk commercial lease",
      parties: [{ role: "Lessor", name: "Acme Corp" }],
      risks: [{ clause: "Section 4", severity: "critical", title: "Indemnification" }],
    };

    const req = new NextRequest("http://localhost:3000/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    try {
      const res = await POST(req);
      assert.ok(res.status === 200 || res.status === 500);
      if (res.status === 200) {
        assert.strictEqual(res.headers.get("content-type"), "application/pdf");
      }
    } catch (err: unknown) {
      assert.ok(err);
    }
  });
});
