# File Manifest

## Root

- README.md — project overview and quick start
- LICENSE — MIT license
- CHANGELOG.md — release history
- CONTRIBUTING.md — development and contribution rules
- .env.example — local configuration template
- package.json — Node package metadata and scripts
- tsconfig.json — TypeScript compiler configuration
- .gitignore — generated/local files

## Source

- src/cli.ts — command-line entry point
- src/agent.ts — task/context orchestration
- src/chat.ts — interactive chat loop
- src/config.ts — environment configuration
- src/types.ts — shared domain types
- src/repository.ts — bounded repository scanner
- src/patches.ts — structured patch types and path validation
- src/patch-parser.ts — safe model patch parser
- src/diff.ts — deterministic patch preview
- src/session.ts — in-memory chat history
- src/test-runner.ts — allowlisted verification commands
- src/git.ts — safe Git status/diff helpers
- src/tool-policy.ts — capability policy
- src/providers/ollama.ts — Ollama API adapter

## Tests

- tests/repository.test.ts — repository scanner tests
- tests/provider.test.ts — Ollama endpoint tests
- tests/config.test.ts — configuration tests
- tests/patches.test.ts — patch path security tests
- tests/session.test.ts — chat session tests
- tests/patch-parser.test.ts — structured patch validation and preview tests

## Documentation

- docs/ARCHITECTURE.md
- docs/API.md
- docs/DESIGN.md
- docs/UML.md
- docs/SEQUENCE-EDIT.md
- docs/SECURITY.md
- docs/ROADMAP.md
- docs/AGENT-LOOP.md
- docs/PATCH-PROTOCOL.md
- docs/FILE-MANIFEST.md

## GitHub

- .github/workflows/ci.yml — Windows CI
- .github/dependabot.yml — npm dependency updates
- .github/ISSUE_TEMPLATE/bug_report.md
- .github/ISSUE_TEMPLATE/feature_request.md
