/**
 * [LEGAL SYSTEM CONFIGURATION TEST SUITE]
 * Unit tests verifying file type constraints, file size limits, and system prompt integrity.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
  LEGAL_SYSTEM_INSTRUCTION,
} from "@/config/legalSystemPrompt";
import { FOLLOWUP_SYSTEM_INSTRUCTION } from "@/config/followupSystemPrompt";

describe("Legal System Configuration & File Constraints", () => {
  it("should define supported file extensions with correct MIME types and categories", () => {
    assert.deepStrictEqual(SUPPORTED_FILE_TYPES[".pdf"], {
      mime: "application/pdf",
      category: "document",
    });

    assert.deepStrictEqual(SUPPORTED_FILE_TYPES[".docx"], {
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      category: "document",
    });

    assert.deepStrictEqual(SUPPORTED_FILE_TYPES[".txt"], {
      mime: "text/plain",
      category: "text",
    });

    assert.deepStrictEqual(SUPPORTED_FILE_TYPES[".png"], {
      mime: "image/png",
      category: "image",
    });
  });

  it("should enforce a 10MB maximum file size limit", () => {
    assert.strictEqual(MAX_FILE_SIZE, 10 * 1024 * 1024);
  });

  it("should contain essential AI system instructions", () => {
    assert.ok(LEGAL_SYSTEM_INSTRUCTION.includes("JurisAI"));
    assert.ok(LEGAL_SYSTEM_INSTRUCTION.includes("45% RULE"));
    assert.ok(LEGAL_SYSTEM_INSTRUCTION.includes("critical"));
    assert.ok(LEGAL_SYSTEM_INSTRUCTION.includes("warning"));
    assert.ok(LEGAL_SYSTEM_INSTRUCTION.includes("STRICT SCOPE BOUNDARY"));
    assert.ok(FOLLOWUP_SYSTEM_INSTRUCTION.includes("STRICT SCOPE BOUNDARY"));
  });
});
