import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { listRepositoryFiles, readRepositoryContext } from "../src/repository.js";

test("lists eligible source files and skips dependency folders", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "agent-coder-"));
  try {
    await mkdir(path.join(root, "node_modules"), { recursive: true });
    await mkdir(path.join(root, "src"), { recursive: true });
    await writeFile(path.join(root, "src", "app.ts"), "export const a = 1;");
    await writeFile(path.join(root, "node_modules", "junk.ts"), "should not be listed");
    await writeFile(path.join(root, "image.png"), Buffer.from([0, 1, 2]));
    const files = await listRepositoryFiles(root);
    assert.deepEqual(files, ["src/app.ts"]);
    const context = await readRepositoryContext(root, files);
    assert.equal(context[0]?.content, "export const a = 1;");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects path traversal when reading context", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "agent-coder-"));
  try {
    await assert.rejects(readRepositoryContext(root, ["../secret.txt"]), /outside repository/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
