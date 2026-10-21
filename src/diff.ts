import type { FileEdit, PatchProposal } from "./patches.js";

function lines(text: string | undefined): string[] {
  return (text ?? "").replaceAll("\r\n", "\n").split("\n");
}

function previewEdit(edit: FileEdit): string {
  const oldLines = lines(edit.oldContent);
  const newLines = lines(edit.newContent);
  const output: string[] = [`--- ${edit.kind === "create" ? "/dev/null" : `a/${edit.path}`}`, `+++ ${edit.kind === "delete" ? "/dev/null" : `b/${edit.path}`}`];
  const max = Math.max(oldLines.length, newLines.length);
  for (let index = 0; index < max; index++) {
    const oldLine = oldLines[index];
    const newLine = newLines[index];
    if (oldLine === newLine) continue;
    if (oldLine !== undefined) output.push(`-${oldLine}`);
    if (newLine !== undefined) output.push(`+${newLine}`);
  }
  return output.join("\n");
}

export function renderPatchPreview(proposal: PatchProposal): string {
  const sections = proposal.edits.map(previewEdit);
  const verification = proposal.verification.length
    ? `\nVerification:\n${proposal.verification.map(command => `- ${command}`).join("\n")}`
    : "";
  return [`Task: ${proposal.task}`, ...sections, verification].filter(Boolean).join("\n\n");
}
