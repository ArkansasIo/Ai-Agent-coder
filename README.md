# AI Agent Coder

A Windows-friendly, local-first AI coding-agent starter built on TypeScript and Ollama.

## Features

- Ollama health/version check and model listing
- Bounded repository scanner for common source and documentation files
- Context-aware advisory change planning
- Read-only-by-default workflow: no generated patches are automatically applied
- Unit tests, UML/design docs, security notes, roadmap, and GitHub Actions CI

## Requirements

- Node.js 20+
- npm
- Optional: Ollama running at http://localhost:11434
- Optional model: `ollama pull qwen2.5-coder:7b`

## Setup

```powershell
npm install
npm run build
npm test
npm start -- --help
```

## Commands

```powershell
npm start -- health
npm start -- models
npm start -- inspect . --max-files 30
npm start -- plan . "Add validation for API inputs" --model qwen2.5-coder:7b
```

Set `OLLAMA_HOST` to select an Ollama API endpoint. Default: `http://localhost:11434`.

The plan command prints advisory text. It does not write files or execute shell commands. See [Security](docs/SECURITY.md).

## Layout

- `src/cli.ts` — command-line interface
- `src/agent.ts` — prompt and context orchestration
- `src/providers/ollama.ts` — Ollama HTTP client
- `src/repository.ts` — bounded repository scanner
- `tests/` — unit tests
- `docs/` — architecture, UML, security, roadmap

## Roadmap

See [Roadmap](docs/ROADMAP.md) for patch generation with explicit approval, Git worktree support, test execution isolation, session persistence, and a Windows UI.

## License

MIT for this starter application. Model weights and dependencies retain their respective licenses.
