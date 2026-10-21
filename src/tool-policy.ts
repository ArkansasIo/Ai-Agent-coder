export type ToolName = "repository.read" | "git.status" | "git.diff" | "file.write" | "shell.exec";

export type ToolPolicy = Record<ToolName, boolean>;

export const READ_ONLY_POLICY: ToolPolicy = {
  "repository.read": true,
  "git.status": true,
  "git.diff": true,
  "file.write": false,
  "shell.exec": false
};

export function canUseTool(policy: ToolPolicy, tool: ToolName): boolean {
  return policy[tool] === true;
}
