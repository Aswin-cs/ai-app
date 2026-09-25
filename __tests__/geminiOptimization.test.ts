/**
 * [GEMINI COST & TOKEN OPTIMIZATION TEST SUITE]
 * Unit tests verifying token limits, response schema caps, fallback model list length,
 * and context caching configuration.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GEMINI_RESPONSE_SCHEMA } from "@/types/case.types";
import {
  FALLBACK_MODEL_LIST,
  MAX_FALLBACK_CANDIDATES,
  generateGeminiContent,
  uploadGeminiFile,
  deleteGeminiFile,
  createGeminiContextCache,
} from "@/config/gemini";
import { LEGAL_SYSTEM_INSTRUCTION } from "@/config/legalSystemPrompt";

describe("Gemini Cost & Token Optimizations", () => {
  it("should cap GEMINI_RESPONSE_SCHEMA array sizes and require concise sourceText locators", () => {
    const risksSchema: any = GEMINI_RESPONSE_SCHEMA.properties.risks;
    const recommendationsSchema: any = GEMINI_RESPONSE_SCHEMA.properties.recommendations;
    const termsSchema: any = GEMINI_RESPONSE_SCHEMA.properties.extractedTerms;
    const partiesSchema: any = GEMINI_RESPONSE_SCHEMA.properties.parties;

    assert.strictEqual(risksSchema.maxItems, 15);
    assert.strictEqual(recommendationsSchema.maxItems, 5);
    assert.strictEqual(termsSchema.maxItems, 10);
    assert.strictEqual(partiesSchema.maxItems, 5);

    const sourceTextDesc = risksSchema.items.properties.sourceText.description;
    assert.ok(sourceTextDesc.includes("Short clause locator"));
  });

  it("should cap the fallback model list to at most 3 candidate models to fail fast", () => {
    assert.ok(FALLBACK_MODEL_LIST.length <= 3);
    assert.strictEqual(MAX_FALLBACK_CANDIDATES, 3);
  });

  it("should enforce field size limits in LEGAL_SYSTEM_INSTRUCTION", () => {
    assert.ok(LEGAL_SYSTEM_INSTRUCTION.includes("short locator or snippet"));
    assert.ok(LEGAL_SYSTEM_INSTRUCTION.includes("Flag at most 15"));
    assert.ok(LEGAL_SYSTEM_INSTRUCTION.includes("at most 5 actionable recommendations"));
  });

  it("should export helper functions for file upload, deletion, and context caching", () => {
    assert.strictEqual(typeof generateGeminiContent, "function");
    assert.strictEqual(typeof uploadGeminiFile, "function");
    assert.strictEqual(typeof deleteGeminiFile, "function");
    assert.strictEqual(typeof createGeminiContextCache, "function");
  });
});
