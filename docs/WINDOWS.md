# Windows Development

## Prerequisites

- Windows 10 or newer
- Node.js 20+
- npm
- Ollama installed locally for inference

## Setup

```powershell
npm install
npm run check
npm test
```

Start the CLI with:

```powershell
npm run build
node dist/src/cli.js health
node dist/src/cli.js models
node dist/src/cli.js chat
```

The project uses Node's built-in filesystem, process, HTTP, and readline APIs so the core runtime does not require a native build toolchain.

## PowerShell examples

```powershell
$env:OLLAMA_HOST = "http://localhost:11434"
$env:AI_AGENT_MODEL = "qwen2.5-coder:7b"
node dist/src/cli.js plan . "Review the repository architecture and identify missing tests"
```

## Troubleshooting

If `health` cannot connect, start Ollama and verify the endpoint in `OLLAMA_HOST`. If TypeScript reports module-resolution errors, run `npm install` and use the supported Node.js version range.
