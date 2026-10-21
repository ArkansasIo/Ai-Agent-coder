# Security Model

## MVP controls

- The agent does not apply generated changes.
- The agent does not execute model-produced shell commands.
- Repository context is bounded by file count and 16 KB per file by default.
- NUL-containing files are skipped as likely binary content.
- Relative paths are checked against the canonical repository root.
- Repository files must be treated as untrusted data.
- For private repositories, use a trusted local Ollama endpoint.

## Remaining risks

Symlink and concurrent file replacement hardening should be expanded before processing hostile repositories. Model responses may be wrong or influenced by repository content. A remote Ollama host receives prompts and included source. Review all model output before implementing it.

## Before adding write-capable tools

1. Represent edits as structured patches.
2. Validate all paths under the canonical root.
3. Render a diff preview.
4. Require explicit approval.
5. Use a clean Git worktree and retain backups.
6. Run tests in a sandbox with time, memory, and network limits.
7. Audit approved actions and results.
