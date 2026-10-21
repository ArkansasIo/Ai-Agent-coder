# AI Agent Coder

A Windows-friendly, local-first AI coding-agent starter built with TypeScript and Ollama.

## What is implemented

- Ollama health/version check and model listing
- Bounded repository source inspection
- Context-aware implementation planning
- Repository-relative path validation for future edits
- Explicit tool capability policy
- Read-only Git status/diff helpers
- Unit tests
- Windows GitHub Actions CI
- UML, architecture, API, security, and design documentation

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
npm start -- inspect . --max-files 30
npm start -- plan . "Add validation for API inputs" --model qwen2.5-coder:7b
```

Configure the provider with `OLLAMA_HOST`; the default is `http://localhost:11434`. See `.env.example` for supported configuration names.

## Safety boundary

The current agent is deliberately advisory. It reads bounded repository context and asks a model for a plan. It does **not** silently edit files, execute model-produced shell commands, install dependencies, or claim that tests passed when they did not run.

Future write support must use structured patches, path validation, diff preview, explicit approval, and an isolated Git worktree. See [docs/SECURITY.md](docs/SECURITY.md) and [docs/SEQUENCE-EDIT.md](docs/SEQUENCE-EDIT.md).

## Project structure

```text
src/
  cli.ts
  agent.ts
  config.ts
  types.ts
  repository.ts
  patches.ts
  git.ts
  tool-policy.ts
  providers/ollama.ts

tests/
docs/
.github/
```

See [docs/FILE-MANIFEST.md](docs/FILE-MANIFEST.md) for the complete file inventory.

## Roadmap

1. Structured patch protocol
2. Diff preview and explicit approval
3. Git worktree-based application
4. Allowlisted test/build runner with timeouts
5. Persistent sessions and task history
6. Windows desktop UI
7. Repository indexing/RAG
8. Multi-agent orchestration with explicit tool grants

## License

MIT for this starter application. Ollama, model weights, and dependencies retain their respective licenses.
