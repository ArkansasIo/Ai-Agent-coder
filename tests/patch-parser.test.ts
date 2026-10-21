import test from "node:test";
import assert from "node:assert/strict";
import { parsePatchProposal } from "../src/patch-parser.js";
import { renderPatchPreview } from "../src/diff.js";

test("parses fenced JSON patch proposals", () => {
  const proposal = parsePatchProposal(````json\n${JSON.stringify({ task: "update", edits: [{ path: "src/a.ts", kind: "create", reason: "add", newContent: "export const a = 1;" }], verification: ["npm test"] })}\n````);
  assert.equal(proposal.edits[0]?.kind, "create");
  assert.match(renderPatchPreview(proposal), /\+export const a = 1;/);
});

test("rejects traversal and malformed edits", () => {
  assert.throws(() => parsePatchProposal(JSON.stringify({ task: "bad", edits: [{ path: "../secret", kind: "create", reason: "x", newContent: "x" }], verification: [] })));
  assert.throws(() => parsePatchProposal(JSON.stringify({ task: "bad", edits: [{ path: "x.ts", kind: "create", reason: "x" }], verification: [] })));
});
