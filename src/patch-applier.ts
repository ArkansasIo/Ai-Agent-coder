import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { FileEdit, PatchProposal } from "./patches.js";
import { validateRelativePath } from "./patches.js";

function safePath(root: string, relativePath: string): string {
  validateRelativePath(relativePath);
  const base = resolve(root);
  const target = resolve(base, relativePath);
  const prefix = process.platform === "win32" ? `${base}\\` : `${base}/`;
  if (target !== base && !target.startsWith(prefix)) throw new Error(`Patch path escapes repository: ${relativePath}`);
  return target;
}

export async function validatePatch(root: string, proposal: PatchProposal): Promise<void> {
  for (const edit of proposal.edits) {
    const target = safePath(root, edit.path);
    if (edit.kind === "modify" && edit.oldContent !== undefined) {
      const current = await readFile(target, "utf8");
      if (current !== edit.oldContent) throw new Error(`Patch precondition failed: ${edit.path}`);
    }
  }
}

async function applyEdit(root: string, edit: FileEdit): Promise<void> {
  const target = safePath(root, edit.path);
  if (edit.kind === "delete") {
    await unlink(target);
    return;
  }
  if (edit.newContent === undefined) throw new Error(`Missing newContent for ${edit.kind}: ${edit.path}`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, edit.newContent, "utf8");
}

export async function applyApprovedPatch(root: string, proposal: PatchProposal, approved: boolean): Promise<void> {
  if (!approved) throw new Error("Patch application requires explicit approval");
  await validatePatch(root, proposal);
  for (const edit of proposal.edits) await applyEdit(root, edit);
}
