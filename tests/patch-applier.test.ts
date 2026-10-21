import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyApprovedPatch, validatePatch } from "../src/patch-applier.js";
import type { PatchProposal } from "../src/patches.js";

test("patch application requires approval", async () => {
  const root = await mkdtemp(join(tmpdir(), "ai-agent-coder-"));
  const proposal: PatchProposal = {
    task: "edit",
    edits: [{ path: "src/app.ts", kind: "create", newContent: "export const ok = true;", reason: "test" }],
    verification: ["npm test"]
  };
  await assert.rejects(() => applyApprovedPatch(root, proposal, false), /explicit approval/);
});

test("patch preconditions prevent stale overwrites", async () => {
  const root = await mkdtemp(join(tmpdir(), "ai-agent-coder-"));
  const file = join(root, "app.ts");
  await writeFile(file, "current", "utf8");
  const proposal: PatchProposal = {
    task: "edit",
    edits: [{ path: "app.ts", kind: "modify", oldContent: "stale", newContent: "new", reason: "test" }],
    verification: []
  };
  await assert.rejects(() => validatePatch(root, proposal), /precondition/);
  assert.equal(await readFile(file, "utf8"), "current");
});
