import test from "node:test";
import assert from "node:assert/strict";
import { validateRelativePath } from "../src/patches.js";

test("accepts a repository-relative patch path", () => {
  assert.doesNotThrow(() => validateRelativePath("src/app.ts"));
});

test("rejects traversal and absolute paths", () => {
  assert.throws(() => validateRelativePath("../secret.txt"), /traversal/);
  assert.throws(() => validateRelativePath("C:\\secret.txt"), /Absolute/);
  assert.throws(() => validateRelativePath("/etc/passwd"), /Absolute/);
});
