# Architecture

## Design principles

- Local-first inference through Ollama.
- Read-only repository inspection for the MVP.
- Bounded context: limited file count and per-file byte count.
- No automatic patch application or arbitrary shell execution.
- Provider adapter isolated from agent orchestration.
- Repository content is treated as untrusted context.

## Components

```text
CLI
 ├── OllamaProvider ──HTTP──> Ollama API ──> local model
 ├── RepositoryScanner ──> eligible text files
 └── AgentOrchestrator
      ├── bounded context
      ├── system/user prompt
      └── advisory plan output
```

The first version does not edit source code, run project tests, install dependencies, or invoke arbitrary tools.
