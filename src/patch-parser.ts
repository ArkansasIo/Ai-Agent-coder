import { validateRelativePath, type FileEdit, type FileEditKind, type PatchProposal } from "./patches.js";

const MAX_EDITS = 100;
const MAX_TEXT = 2_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanJson(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced?.[1] ?? trimmed).trim();
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_TEXT) {
    throw new Error(`Invalid patch field: ${field}`);
  }
  return value;
}

function parseEdit(value: unknown, index: number): FileEdit {
  if (!isRecord(value)) throw new Error(`Patch edit ${index} must be an object`);
  const path = requiredString(value.path, `edits[${index}].path`);
  validateRelativePath(path);
  const kind = value.kind;
  if (kind !== "create" && kind !== "modify" && kind !== "delete") {
    throw new Error(`Invalid patch edit kind at edits[${index}]`);
  }
  const reason = requiredString(value.reason, `edits[${index}].reason`);
  const oldContent = value.oldContent;
  const newContent = value.newContent;
  if (oldContent !== undefined && typeof oldContent !== "string") {
    throw new Error(`Invalid oldContent at edits[${index}]`);
  }
  if (newContent !== undefined && typeof newContent !== "string") {
    throw new Error(`Invalid newContent at edits[${index}]`);
  }
  if (kind === "create" && typeof newContent !== "string") {
    throw new Error(`Create edit ${index} requires newContent`);
  }
  if (kind === "modify" && typeof newContent !== "string") {
    throw new Error(`Modify edit ${index} requires newContent`);
  }
  if (kind === "delete" && newContent !== undefined) {
    throw new Error(`Delete edit ${index} must not include newContent`);
  }
  return { path, kind: kind as FileEditKind, reason, oldContent, newContent };
}

export function parsePatchProposal(raw: string): PatchProposal {
  let value: unknown;
  try {
    value = JSON.parse(cleanJson(raw));
  } catch (error) {
    throw new Error(`Invalid patch JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!isRecord(value)) throw new Error("Patch proposal must be a JSON object");
  const task = requiredString(value.task, "task");
  if (!Array.isArray(value.edits) || value.edits.length > MAX_EDITS) {
    throw new Error(`Patch proposal must contain 1-${MAX_EDITS} edits`);
  }
  if (!Array.isArray(value.verification)) throw new Error("Patch proposal requires a verification array");
  const verification = value.verification.map((item, index) => requiredString(item, `verification[${index}]`));
  return { task, edits: value.edits.map(parseEdit), verification };
}
