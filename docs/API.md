# API and Module Contracts

## OllamaProvider

- `health()` calls `GET /api/version`.
- `models()` calls `GET /api/tags`.
- `chat(model, messages)` calls `POST /api/chat` with `stream: false`.

## Repository scanner

`listRepositoryFiles(root, options)` returns repository-relative paths for supported text extensions while excluding dependency/build directories.

`readRepositoryContext(root, files, maxBytesPerFile)` returns bounded file content and rejects paths outside the canonical repository root.

## Agent

`createPlan(root, task, options)` creates a bounded context and asks the selected Ollama model for an advisory implementation plan. It does not mutate the repository.

## Planned write API

Future write-capable code should accept only structured `PatchProposal` values, validate every path, produce a diff, and require explicit user approval before writing.
