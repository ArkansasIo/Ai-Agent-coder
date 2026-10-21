import { execFile } from "node:child_process";
import { promisify } from "node:util";
const execFileAsync = promisify(execFile);
const ALLOWED = new Set(["npm test", "npm run check", "npm run build"]);
export async function runAllowedTest(root: string, command: string): Promise<{ code: number; output: string }> {
  if (!ALLOWED.has(command)) throw new Error(`Command is not allowlisted: ${command}`);
  const [program, ...args] = command.split(" ");
  try {
    const result = await execFileAsync(program!, args, { cwd: root, windowsHide: true, maxBuffer: 2 * 1024 * 1024 });
    return { code: 0, output: `${result.stdout}${result.stderr}` };
  } catch (error) {
    const failure = error as { code?: number; stdout?: string; stderr?: string };
    return { code: typeof failure.code === "number" ? failure.code : 1, output: `${failure.stdout ?? ""}${failure.stderr ?? ""}` };
  }
}
