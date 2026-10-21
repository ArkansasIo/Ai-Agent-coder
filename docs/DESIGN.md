# AI Agent Coder Design

## 1. Runtime

The application is a Node.js/TypeScript CLI. Ollama is an external local model runtime. The design intentionally keeps model transport separate from agent policy and repository access.

## 2. Agent loop

```text
Task
  -> repository discovery
  -> bounded context selection
  -> system policy + task prompt
  -> Ollama inference
  -> advisory response
  -> human review
```

A future implementation loop is:

```text
Plan -> structured patch -> validate -> diff preview -> approve -> isolated apply -> tests -> report
```

## 3. Trust boundaries

1. Developer task is trusted input.
2. Repository files are untrusted data.
3. Model output is untrusted data.
4. Tool execution requires an explicit capability grant.
5. File writes require explicit approval.

## 4. Windows design

Use Node's platform-neutral filesystem APIs and avoid shell-specific command strings. Git commands use `execFile` with argument arrays. CI runs on `windows-latest` to catch Windows-specific regressions.

## 5. Extension points

Provider adapters can support other OpenAI-compatible local endpoints without coupling the agent to a specific inference implementation. Tool adapters can expose repository, Git, test, and build operations behind a capability policy.

## 6. Non-goals for MVP

No autonomous shell execution, no credential harvesting, no silent file writes, no unrestricted network crawler, and no claims that generated code has been tested unless a test tool actually ran it.
