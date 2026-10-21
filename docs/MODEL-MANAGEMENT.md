# Ollama Model Management

The CLI exposes local Ollama model lifecycle operations:

```text
ai-agent-coder models
ai-agent-coder model-show qwen2.5-coder:7b
ai-agent-coder model-pull qwen2.5-coder:7b
ai-agent-coder model-delete qwen2.5-coder:7b
```

## Operations

| Command | API operation | Effect |
|---|---|---|
| `models` | `GET /api/tags` | List installed models |
| `model-show` | `POST /api/show` | Read model metadata |
| `model-pull` | `POST /api/pull` | Download/install a model |
| `model-delete` | `DELETE /api/delete` | Remove an installed model |
| `chat` | `POST /api/chat` | Run an interactive conversation |

Model deletion and pulling are explicit CLI actions. The coding planner never installs, deletes, or switches models automatically.

## Remote hosts

`OLLAMA_HOST` may point to another HTTP(S) endpoint. Use a trusted network and appropriate access controls when doing this; the application does not add authentication to the Ollama protocol on your behalf.
