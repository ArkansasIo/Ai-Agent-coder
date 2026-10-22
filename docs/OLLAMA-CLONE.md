# Ollama-Compatible Runtime

This repository now contains a clean-room Ollama-compatible runtime foundation under `src/ollama-clone/`.

## Implemented

- Local model metadata store.
- Model import metadata and SHA-256 digesting.
- Modelfile parser for FROM, PARAMETER, TEMPLATE, SYSTEM, ADAPTER, LICENSE, MESSAGE, and REQUIRES.
- `/api/version`.
- `/api/tags`.
- `/api/show`.
- `/api/delete`.
- `/api/generate` with NDJSON streaming.
- `/api/chat` with NDJSON streaming.
- `/v1/models`.
- `/v1/chat/completions` with streaming SSE.
- Backend abstraction so inference engines are independent of the HTTP layer.
- Automated tests for parsing, storage, and HTTP behavior.

## Architecture

```text
CLI / Desktop / SDK
        |
        v
HTTP compatibility layer
        |
        +---- Ollama API
        +---- OpenAI API
        |
        v
Model store + scheduler
        |
        v
Inference Backend interface
        |
        +---- GGUF backend
        +---- CPU backend
        +---- CUDA backend
        +---- Metal backend
        +---- Vulkan backend
```

## Remaining runtime work

1. GGUF reader and tensor metadata.
2. Tokenizer abstraction and model-specific tokenizers.
3. KV-cache implementation.
4. Sampling pipeline.
5. CPU tensor backend.
6. GPU backend adapters.
7. Model pull/push registry protocol.
8. Blob/content-addressed storage for model layers.
9. Model creation from Modelfiles.
10. `/api/embed` and `/api/embeddings`.
11. Running-model process/scheduler APIs.
12. Context-window and memory management.
13. Windows installer/service integration.
14. Full CLI parity.
15. Conformance tests against documented API behavior.

The inference layer is deliberately isolated from the compatibility API so the runtime can move from a development backend to a native local inference implementation without changing clients.
