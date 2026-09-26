import "../setupDom";
import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { useCaseFollowup } from "@/hooks/useCaseFollowup";

describe("useCaseFollowup hook", () => {
  const validCaseId = "507f1f77bcf86cd799439011";
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    cleanup();
  });

  it("does not fetch conversation history on mount if caseId is invalid", () => {
    const fetchMock = mock.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    renderHook(() =>
      useCaseFollowup({
        caseId: "invalid-id",
        soundEnabled: false,
        playCompletionSound: () => {},
      })
    );

    assert.strictEqual(fetchMock.mock.callCount(), 0);
  });

  it("loads conversation history on mount if caseId is valid", async () => {
    const mockMessages = [
      { role: "user", content: "What is clause 3?", timestamp: new Date().toISOString() },
    ];

    globalThis.fetch = mock.fn(async () => ({
      ok: true,
      json: async () => ({ messages: mockMessages }),
    })) as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useCaseFollowup({
        caseId: validCaseId,
        soundEnabled: false,
        playCompletionSound: () => {},
      })
    );

    await waitFor(() => {
      assert.strictEqual(result.current.conversationMessages.length, 1);
    });

    assert.strictEqual(result.current.conversationMessages[0].content, "What is clause 3?");
  });

  it("executes prompt, updates messages, and calls completion sound", async () => {
    let completionSoundCalled = false;
    const playCompletionSound = () => {
      completionSoundCalled = true;
    };

    globalThis.fetch = mock.fn(async (url: string | URL | Request, opts?: RequestInit) => {
      if (opts?.method === "POST") {
        return {
          ok: true,
          json: async () => ({
            success: true,
            response: {
              answer: "Yes, 3 months rent.",
              keyPoints: ["Fee applies"],
              confidence: "high",
              relatedClauses: ["Clause 12"],
              disclaimer: true,
            },
          }),
        };
      }
      return {
        ok: true,
        json: async () => ({ messages: [] }),
      };
    }) as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useCaseFollowup({
        caseId: validCaseId,
        soundEnabled: true,
        playCompletionSound,
      })
    );

    await waitFor(() => {
      assert.strictEqual(result.current.isAnalyzing, false);
    });

    act(() => {
      result.current.setPromptText("Is there a termination fee?");
    });

    await act(async () => {
      await result.current.handleExecutePrompt();
    });

    assert.strictEqual(result.current.conversationMessages.length, 2);
    assert.strictEqual(result.current.conversationMessages[0].role, "user");
    assert.strictEqual(result.current.conversationMessages[0].content, "Is there a termination fee?");
    assert.strictEqual(result.current.conversationMessages[1].role, "assistant");
    assert.ok(result.current.latestAiResponse);
    assert.strictEqual(result.current.latestAiResponse.answer, "Yes, 3 months rent.");
    assert.strictEqual(completionSoundCalled, true);
  });

  it("handles prompt execution failure", async () => {
    globalThis.fetch = mock.fn(async (url: string | URL | Request, opts?: RequestInit) => {
      if (opts?.method === "POST") {
        return {
          ok: false,
          json: async () => ({ error: "AI rate limit reached" }),
        };
      }
      return {
        ok: true,
        json: async () => ({ messages: [] }),
      };
    }) as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useCaseFollowup({
        caseId: validCaseId,
        soundEnabled: false,
        playCompletionSound: () => {},
      })
    );

    act(() => {
      result.current.setPromptText("Can I sublease?");
    });

    await act(async () => {
      await result.current.handleExecutePrompt();
    });

    assert.strictEqual(result.current.followupError, "AI rate limit reached");
  });
});
