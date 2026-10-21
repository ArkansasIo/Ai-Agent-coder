import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function gitStatus(root: string): Promise<string> {
  const result = await execFileAsync("git", ["status", "--short", "--branch"], {
    cwd: root,
    windowsHide: true,
    maxBuffer: 1024 * 1024
  });
  return result.stdout.trim();
}

export async function gitDiff(root: string): Promise<string> {
  const result = await execFileAsync("git", ["diff", "--no-ext-diff", "--"], {
    cwd: root,
    windowsHide: true,
    maxBuffer: 5 * 1024 * 1024
  });
  return result.stdout;
}
