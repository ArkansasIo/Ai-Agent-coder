#!/usr/bin/env node
import { createPlan } from "./agent.js";
import { runInteractiveChat } from "./chat.js";
import { loadConfig } from "./config.js";
import { OllamaProvider } from "./providers/ollama.js";
import { listRepositoryFiles } from "./repository.js";

function usage(): void {
  console.log(`AI Agent Coder — local coding-agent

Usage:
  ai-agent-coder health [--host URL]
  ai-agent-coder models [--host URL]
  ai-agent-coder model-show <model> [--host URL]
  ai-agent-coder model-pull <model> [--host URL]
  ai-agent-coder model-delete <model> [--host URL]
  ai-agent-coder chat [model] [--host URL]
  ai-agent-coder inspect <repository> [--max-files N]
  ai-agent-coder plan <repository> <task...> [--model NAME] [--host URL] [--max-files N]

Environment:
  OLLAMA_HOST   Ollama API base URL (default http://localhost:11434)
  AI_AGENT_MODEL Default model

Safety:
  Chat and planning do not write repository files or execute model-generated shell commands.
`);
}

function valueAfter(args: string[], key: string): string | undefined {
  const index = args.indexOf(key);
  return index >= 0 ? args[index + 1] : undefined;
}

function positional(args: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i]?.startsWith("--")) i++;
    else if (args[i]) result.push(args[i]);
  }
  return result;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  if (!command || command === "--help" || command === "-h" || command === "help") return usage();

  const config = loadConfig();
  const host = valueAfter(args, "--host") ?? config.ollamaHost;
  const model = valueAfter(args, "--model") ?? config.model;
  const maxFiles = Number(valueAfter(args, "--max-files") ?? config.maxFiles);
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

  if (command === "model-show") {
    const name = positional(args.slice(1))[0];
    if (!name) throw new Error("model-show requires a model name");
    console.log(JSON.stringify(await provider.showModel(name), null, 2));
    return;
  }

  if (command === "model-pull") {
    const name = positional(args.slice(1))[0];
    if (!name) throw new Error("model-pull requires a model name");
    await provider.pullModel(name, progress => {
      const total = progress.total ?? 0;
      const completed = progress.completed ?? 0;
      const percent = total > 0 ? ` ${((completed / total) * 100).toFixed(1)}%` : "";
      process.stdout.write(`\r${progress.status ?? "working"}${percent}`);
    });
    process.stdout.write("\n");
    console.log(`Model ready: ${name}`);
    return;
  }

  if (command === "model-delete") {
    const name = positional(args.slice(1))[0];
    if (!name) throw new Error("model-delete requires a model name");
    await provider.deleteModel(name);
    console.log(`Deleted model: ${name}`);
    return;
  }

  if (command === "chat") {
    await runInteractiveChat(provider, positional(args.slice(1))[0] ?? model);
    return;
  }

  if (command === "inspect") {
    const root = positional(args.slice(1))[0];
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
