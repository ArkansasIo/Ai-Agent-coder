import { readdir, readFile, realpath } from "node:fs/promises";
import path from "node:path";

const EXCLUDED = new Set([
  ".git", "node_modules", "dist", "build", "coverage", ".next",
  ".venv", "venv", "target", "vendor", ".idea", ".vscode"
]);
const TEXT_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md",
  ".py", ".go", ".rs", ".java", ".cs", ".cpp", ".h", ".hpp",
  ".html", ".css", ".scss", ".yml", ".yaml", ".toml", ".sh",
  ".ps1", ".bat", ".sql", ".xml", ".ini", ".txt"
]);

export type RepositoryFile = { path: string; content: string };

export async function listRepositoryFiles(
  root: string,
  options: { maxFiles?: number } = {}
): Promise<string[]> {
  const rootReal = await realpath(root);
  const maxFiles = Math.max(1, Math.min(options.maxFiles ?? 50, 500));
  const found: string[] = [];

  async function walk(current: string): Promise<void> {
    if (found.length >= maxFiles) return;
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (found.length >= maxFiles) break;
      if (entry.isDirectory()) {
        if (!EXCLUDED.has(entry.name) && (!entry.name.startsWith(".") || entry.name === ".github")) {
          await walk(path.join(current, entry.name));
        }
      } else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        found.push(path.relative(rootReal, path.join(current, entry.name)).replaceAll("\\", "/"));
      }
    }
  }

  await walk(rootReal);
  return found;
}

export async function readRepositoryContext(
  root: string,
  files: string[],
  maxBytesPerFile = 16_000
): Promise<RepositoryFile[]> {
  const rootReal = await realpath(root);
  const result: RepositoryFile[] = [];

  for (const relative of files) {
    const candidate = path.resolve(rootReal, relative);
    const normalized = path.relative(rootReal, candidate);
    if (normalized.startsWith("..") || path.isAbsolute(normalized)) {
      throw new Error(`Rejected path outside repository: ${relative}`);
    }
    const content = await readFile(candidate);
    if (content.includes(0)) continue;
    result.push({
      path: relative,
      content: content.subarray(0, maxBytesPerFile).toString("utf8")
    });
  }
  return result;
}
