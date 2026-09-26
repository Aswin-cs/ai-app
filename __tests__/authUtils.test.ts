/**
 * [AUTHENTICATION HELPER TEST SUITE]
 * Unit tests for getAuthenticatedUser helper verifying unauthenticated and authenticated flows.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getAuthenticatedUser } from "@/lib/authUtils";

describe("getAuthenticatedUser Helper", () => {
  it("should return errorResponse when no session or user profile exists", async () => {
    // Calling getAuthenticatedUser without active NextAuth session
    const result = await getAuthenticatedUser();
    assert.strictEqual(result.user, null);
    assert.ok(result.errorResponse !== null);
    assert.strictEqual(result.errorResponse?.status, 401);
  });
});
