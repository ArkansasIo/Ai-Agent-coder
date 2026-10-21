# AI Agent Coder

A Windows-friendly, local-first AI coding-agent starter built with TypeScript and Ollama.

## What is implemented

- Ollama health/version check and model management
- Bounded repository source inspection
- Context-aware implementation planning
- Interactive local chat sessions
- Structured patch proposal parsing and validation
- Deterministic patch preview
- Repository-relative path validation
- Explicit tool capability policy
- Read-only Git status/diff helpers
- Allowlisted test/build runner
- Unit tests
- Windows GitHub Actions CI
- UML, architecture, API, security, design, and agent-loop documentation

## Quick start

Requirements: Node.js 20+, npm, and optionally Ollama.

```powershell
npm install
npm run check
npm test
npm start -- --help
```

With Ollama running:

```powershell
npm start -- health
npm start -- models
npm start -- model-pull qwen2.5-coder:7b
npm start -- chat
npm start -- inspect . --max-files 30
npm start -- plan . "Add validation for API inputs" --model qwen2.5-coder:7b
```

Configure the provider with `OLLAMA_HOST`; the default is `http://localhost:11434`. See `.env.example` for supported configuration names.

## Safety boundary

The current agent is deliberately advisory. It reads bounded repository context and asks a model for plans or structured patch proposals. It does **not** silently edit files, execute model-produced shell commands, install dependencies, or claim that tests passed when they did not run.

Patch parsing is validation, not authorization. A future write workflow must require explicit user approval, compare expected file contents, show a diff, and apply changes in an isolated Git worktree. See [docs/SECURITY.md](docs/SECURITY.md), [docs/PATCH-PROTOCOL.md](docs/PATCH-PROTOCOL.md), and [docs/SEQUENCE-EDIT.md](docs/SEQUENCE-EDIT.md).

## Project structure

```text
src/
  cli.ts
  agent.ts
  chat.ts
  config.ts
  diff.ts
  patches.ts
  patch-parser.ts
  repository.ts
  session.ts
  test-runner.ts
  types.ts
  git.ts
  tool-policy.ts
  providers/ollama.ts

tests/
docs/
.github/
```

See [docs/FILE-MANIFEST.md](docs/FILE-MANIFEST.md) for the complete file inventory.

## Roadmap

1. Structured patch protocol — implemented
2. Diff preview — implemented
3. Explicit approval and host-side patch application
4. Git worktree isolation
5. Allowlisted test/build runner with stronger timeouts and output limits
6. Persistent sessions and task history
7. Windows desktop UI
8. Repository indexing/RAG
9. Multi-agent orchestration with explicit tool grants

## License

MIT for this starter application. Ollama, model weights, and dependencies retain their respective licenses.