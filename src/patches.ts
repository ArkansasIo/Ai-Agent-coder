export type FileEditKind = "create" | "modify" | "delete";

export type FileEdit = {
  path: string;
  kind: FileEditKind;
  oldContent?: string;
  newContent?: string;
  reason: string;
};

export type PatchProposal = {
  task: string;
  edits: FileEdit[];
  verification: string[];
};

export function validateRelativePath(relativePath: string): void {
  if (!relativePath || relativePath.includes("\\0")) throw new Error("Invalid patch path");
  if (relativePath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(relativePath)) {
    throw new Error(`Absolute patch path rejected: ${relativePath}`);
  }
  const normalized = relativePath.replaceAll("\\", "/");
  if (normalized.split("/").includes("..")) {
    throw new Error(`Path traversal rejected: ${relativePath}`);
  }
}
