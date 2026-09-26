/**
 * [DATABASE MODEL TEST SUITE]
 * Unit tests for MongoDB Case and User model definitions, required fields, and default values.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Case from "@/models/case.model";
import User from "@/models/user.model";

interface SchemaPathStatus {
  defaultValue?: unknown;
  enumValues?: string[];
}

describe("Mongoose Database Models", () => {
  describe("Case Model Schema", () => {
    it("should have required fields defined in schema", () => {
      const paths = Case.schema.paths;
      assert.ok(paths.userId);
      assert.ok(paths.fileName);
      assert.ok(paths.fileType);
      assert.ok(paths.status);
    });

    it("should default status to 'processing'", () => {
      const statusPath = Case.schema.paths.status as unknown as SchemaPathStatus;
      assert.strictEqual(statusPath.defaultValue, "processing");
    });

    it("should enforce enum values for status field", () => {
      const statusPath = Case.schema.paths.status as unknown as SchemaPathStatus;
      assert.deepStrictEqual(statusPath.enumValues, ["processing", "completed", "failed"]);
    });

    it("should have compound index defined for userId and createdAt", () => {
      const indexes = Case.schema.indexes();
      const hasCompoundIndex = indexes.some(
        ([indexObj]) => indexObj.userId === 1 && indexObj.createdAt === -1
      );
      assert.ok(hasCompoundIndex);
    });
  });

  describe("User Model Schema", () => {
    it("should require email and name fields", () => {
      const paths = User.schema.paths;
      assert.ok(paths.email);
      assert.ok(paths.name);
      assert.ok((paths.email as unknown as { options: { required: boolean } }).options.required);
    });
  });
});
