#!/usr/bin/env node
import { createPlan } from "./agent.js";
import { OllamaProvider } from "./providers/ollama.js";
import { listRepositoryFiles } from "./repository.js";

function usage(): void {
  console.log(`AI Agent Coder — local coding-agent starter

Usage:
  ai-agent-coder health [--host URL]
  ai-agent-coder models [--host URL]
  ai-agent-coder inspect <repository> [--max-files N]
  ai-agent-coder plan <repository> <task...> [--model NAME] [--host URL] [--max-files N]

Environment:
  OLLAMA_HOST   Ollama API base URL (default http://localhost:11434)

Safety:
  The plan command generates advisory text only. It does not write or execute code.
`);
}

function valueAfter(args: string[], key: string): string | undefined {
  const index = args.indexOf(key);
  return index >= 0 ? args[index + 1] : undefined;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  if (!command || command === "--help" || command === "-h") return usage();

  const host = valueAfter(args, "--host");
  const model = valueAfter(args, "--model");
  const maxFiles = Number(valueAfter(args, "--max-files") ?? 30);
  const provider = new OllamaProvider(host);

  if (command === "health") {
    const result = await provider.health();
    console.log(`Ollama online. Version: ${result.version}`);
    return;
  }

  if (command === "models") {
    const models = await provider.models();
    if (!models.length) console.log("No models installed.");
    for (const item of models) console.log(`- ${item.name}${item.size ? ` (${(item.size / 1024 ** 3).toFixed(2)} GiB)` : ""}`);
    return;
  }

  if (command === "inspect") {
    const root = args[1];
    if (!root) throw new Error("inspect requires a repository path");
    const files = await listRepositoryFiles(root, { maxFiles });
    console.log(files.length ? files.join("\n") : "No eligible text files found.");
    return;
  }

  if (command === "plan") {
    const root = args[1];
    const taskParts: string[] = [];
    const optionNames = new Set(["--host", "--model", "--max-files"]);
    for (let i = 2; i < args.length; i++) {
      if (optionNames.has(args[i]!)) { i++; continue; }
      taskParts.push(args[i]!);
    }
    const task = taskParts.join(" ").trim();
    if (!root || !task) throw new Error("plan requires a repository path and task description");
    const plan = await createPlan(root, task, { host, model, maxFiles });
    console.log(`# Plan for: ${plan.task}\n# Repository: ${plan.repositoryRoot}\n# Context files: ${plan.includedFiles.length}\n\n${plan.response}`);
    return;
  }

  usage();
  process.exitCode = 2;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
