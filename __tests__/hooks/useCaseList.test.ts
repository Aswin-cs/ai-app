import "../setupDom";
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { useCaseList } from "@/hooks/useCaseList";

describe("useCaseList hook", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    cleanup();
  });

  it("fetches history cases on mount and groups them correctly", async () => {
    const now = new Date();
    const todayStr = new Date(now).toISOString();
    const yesterdayStr = new Date(now.getTime() - 26 * 3600 * 1000).toISOString();
    const olderStr = new Date(now.getTime() - 10 * 86400 * 1000).toISOString();

    const mockCases = [
      {
        _id: "case1",
        fileName: "lease.pdf",
        documentTitle: "Lease Agreement",
        documentType: "Lease",
        overallRiskScore: 40,
        status: "completed",
        createdAt: todayStr,
        risksCount: 2,
      },
      {
        _id: "case2",
        fileName: "notice.pdf",
        documentTitle: "Eviction Notice",
        documentType: "Notice",
        overallRiskScore: 80,
        status: "completed",
        createdAt: yesterdayStr,
        risksCount: 5,
      },
      {
        _id: "case3",
        fileName: "severance.pdf",
        documentTitle: "Severance Contract",
        documentType: "Severance",
        overallRiskScore: 20,
        status: "completed",
        createdAt: olderStr,
        risksCount: 1,
      },
    ];

    globalThis.fetch = mock.fn(async () => ({
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ success: true, cases: mockCases }),
    })) as any;

    const { result } = renderHook(() => useCaseList());

    await waitFor(() => {
      assert.strictEqual(result.current.isLoadingHistory, false);
    });

    assert.strictEqual(result.current.historyCases.length, 3);
    assert.strictEqual(result.current.groupedHistory.today.length, 1);
    assert.strictEqual(result.current.groupedHistory.yesterday.length, 1);
    assert.strictEqual(result.current.groupedHistory.older.length, 1);
  });

  it("returns correct document icons via getDocIcon", () => {
    const { result } = renderHook(() => useCaseList());
    assert.strictEqual(result.current.getDocIcon("Lease Contract"), "description");
    assert.strictEqual(result.current.getDocIcon("Eviction Notice"), "gavel");
    assert.strictEqual(result.current.getDocIcon("Severance Agreement"), "assignment_turned_in");
    assert.strictEqual(result.current.getDocIcon("NDA Agreement"), "article");
    assert.strictEqual(result.current.getDocIcon("Unknown Document"), "description");
  });

  it("handles case deletion success flow", async () => {
    globalThis.fetch = mock.fn(async (url: string, opts?: any) => {
      if (opts?.method === "DELETE") {
        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      }
      return {
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          success: true,
          cases: [
            {
              _id: "507f1f77bcf86cd799439011",
              fileName: "doc.pdf",
              documentTitle: "Test Doc",
              documentType: "NDA",
              overallRiskScore: 10,
              status: "completed",
              createdAt: new Date().toISOString(),
              risksCount: 0,
            },
          ],
        }),
      };
    }) as any;

    const { result } = renderHook(() => useCaseList());

    await waitFor(() => {
      assert.strictEqual(result.current.isLoadingHistory, false);
    });

    act(() => {
      result.current.setCaseToDelete(result.current.historyCases[0]);
    });

    await act(async () => {
      await result.current.handleDeleteCaseConfirm();
    });

    assert.strictEqual(result.current.historyCases.length, 0);
    assert.ok(result.current.successToast?.includes('"Test Doc" has been deleted.'));
    assert.strictEqual(result.current.caseToDelete, null);
  });

  it("handles case deletion failure flow", async () => {
    globalThis.fetch = mock.fn(async (url: string, opts?: any) => {
      if (opts?.method === "DELETE") {
        return {
          ok: false,
          json: async () => ({ error: "Permission denied" }),
        };
      }
      return {
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({
          success: true,
          cases: [
            {
              _id: "507f1f77bcf86cd799439011",
              fileName: "doc.pdf",
              documentTitle: "Test Doc",
              documentType: "NDA",
              overallRiskScore: 10,
              status: "completed",
              createdAt: new Date().toISOString(),
              risksCount: 0,
            },
          ],
        }),
      };
    }) as any;

    const { result } = renderHook(() => useCaseList());

    await waitFor(() => {
      assert.strictEqual(result.current.isLoadingHistory, false);
    });

    act(() => {
      result.current.setCaseToDelete(result.current.historyCases[0]);
    });

    await act(async () => {
      await result.current.handleDeleteCaseConfirm();
    });

    assert.strictEqual(result.current.historyCases.length, 1);
    assert.strictEqual(result.current.errorMessage, "Permission denied");
  });
});
