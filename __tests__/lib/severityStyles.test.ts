/**
 * [SEVERITY STYLES TEST SUITE]
 * Unit tests for getSeverityStyles and getRiskScoreStyles helpers.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getSeverityStyles, getRiskScoreStyles } from "@/lib/severityStyles";

describe("lib/severityStyles Utility", () => {
  describe("getSeverityStyles", () => {
    it("should return critical style tokens for 'critical' or 'high'", () => {
      const critical = getSeverityStyles("critical");
      assert.strictEqual(critical.severity, "critical");
      assert.strictEqual(critical.dotBgClass, "bg-red-500");
      assert.ok(critical.textClass.includes("text-red"));

      const high = getSeverityStyles("HIGH");
      assert.strictEqual(high.severity, "critical");
      assert.strictEqual(high.dotBgClass, "bg-red-500");
    });

    it("should return warning style tokens for 'warning', 'medium', or 'moderate'", () => {
      const warning = getSeverityStyles("warning");
      assert.strictEqual(warning.severity, "warning");
      assert.strictEqual(warning.dotBgClass, "bg-amber-500");

      const medium = getSeverityStyles("medium");
      assert.strictEqual(medium.severity, "warning");

      const moderate = getSeverityStyles("MODERATE");
      assert.strictEqual(moderate.severity, "warning");
    });

    it("should return note/default style tokens for low, note, or unrecognized severity", () => {
      const note = getSeverityStyles("note");
      assert.strictEqual(note.severity, "note");
      assert.strictEqual(note.dotBgClass, "bg-emerald-500");

      const low = getSeverityStyles("low");
      assert.strictEqual(low.severity, "note");

      const unknown = getSeverityStyles("something_else");
      assert.strictEqual(unknown.severity, "note");

      const empty = getSeverityStyles("");
      assert.strictEqual(empty.severity, "note");
    });
  });

  describe("getRiskScoreStyles", () => {
    it("should return critical risk score tokens for scores >= 70", () => {
      const res = getRiskScoreStyles(85);
      assert.strictEqual(res.score, 85);
      assert.strictEqual(res.level, "critical");
      assert.strictEqual(res.label, "High Risk");
      assert.ok(res.badgeClass.includes("red"));
      assert.strictEqual(res.dotClass, "bg-red-500");
    });

    it("should return warning risk score tokens for scores between 40 and 69", () => {
      const res = getRiskScoreStyles(55);
      assert.strictEqual(res.score, 55);
      assert.strictEqual(res.level, "warning");
      assert.strictEqual(res.label, "Moderate Risk");
      assert.ok(res.badgeClass.includes("amber"));

      const edgeLow = getRiskScoreStyles(40);
      assert.strictEqual(edgeLow.level, "warning");
    });

    it("should return low risk score tokens for scores < 40", () => {
      const res = getRiskScoreStyles(25);
      assert.strictEqual(res.score, 25);
      assert.strictEqual(res.level, "note");
      assert.strictEqual(res.label, "Low Risk");
      assert.ok(res.badgeClass.includes("emerald"));
    });

    it("should clamp scores out of range [0, 100]", () => {
      const negative = getRiskScoreStyles(-10);
      assert.strictEqual(negative.score, 0);

      const overflow = getRiskScoreStyles(150);
      assert.strictEqual(overflow.score, 100);
    });
  });
});
