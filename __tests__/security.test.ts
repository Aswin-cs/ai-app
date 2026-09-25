/**
 * [SECURITY TEST SUITE]
 * Unit tests for input sanitization, HTML escaping, path traversal defense, and error masking.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  escapeHtml,
  sanitizeFileName,
  sanitizeString,
  safeErrorMessage,
} from "@/lib/security";

describe("Security Utility Functions", () => {
  describe("escapeHtml", () => {
    it("should escape special HTML characters to prevent XSS", () => {
      const rawHtml = '<script>alert("XSS")</script>&foo=\'bar\'';
      const escaped = escapeHtml(rawHtml);
      assert.ok(!escaped.includes("<script>"));
      assert.strictEqual(escaped, "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;foo=&#039;bar&#039;");
    });

    it("should handle empty strings or null inputs gracefully", () => {
      assert.strictEqual(escapeHtml(""), "");
      assert.strictEqual(escapeHtml(null), "");
      assert.strictEqual(escapeHtml(undefined), "");
    });

    it("should preserve standard text without HTML entities", () => {
      const plainText = "Commercial Lease Agreement 2026";
      assert.strictEqual(escapeHtml(plainText), plainText);
    });
  });

  describe("sanitizeFileName", () => {
    it("should strip path traversal sequences", () => {
      const dangerous = "../../../etc/passwd";
      const sanitized = sanitizeFileName(dangerous);
      assert.ok(!sanitized.includes(".."));
      assert.ok(!sanitized.includes("/"));
      assert.strictEqual(sanitized, "etc_passwd");
    });

    it("should sanitize file names with special characters and spaces", () => {
      const input = "my contract #1 (final)!.pdf";
      const sanitized = sanitizeFileName(input);
      assert.strictEqual(sanitized, "my contract _1 (final)_.pdf");
    });

    it("should fallback to 'uploaded_document' if file name is empty or only slashes/underscores", () => {
      assert.strictEqual(sanitizeFileName("///"), "uploaded_document");
      assert.strictEqual(sanitizeFileName(""), "uploaded_document");
    });
  });

  describe("sanitizeString", () => {
    it("should clamp string length to specified max length", () => {
      const longStr = "a".repeat(300);
      const clamped = sanitizeString(longStr, 100);
      assert.strictEqual(clamped.length, 100);
    });

    it("should remove null bytes and trim whitespace", () => {
      const stringWithNullByte = "  Hello\u0000World!  ";
      const cleaned = sanitizeString(stringWithNullByte);
      assert.strictEqual(cleaned, "HelloWorld!");
    });
  });

  describe("safeErrorMessage", () => {
    it("should return error message in development mode or fallback", () => {
      const err = new Error("File too large");
      const message = safeErrorMessage(err, "An error occurred");
      assert.ok(message.includes("File too large") || message === "An error occurred");
    });

    it("should return a fallback string when given non-error objects", () => {
      assert.strictEqual(safeErrorMessage(null, "Fallback Error"), "Fallback Error");
      assert.strictEqual(safeErrorMessage(123, "Default Error"), "Default Error");
    });
  });
});
