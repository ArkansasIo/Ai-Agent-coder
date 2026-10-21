# Contributing

## Development

1. Install Node.js 20 or newer.
2. Run `npm install`.
3. Run `npm run check`.
4. Run `npm test`.
5. Keep agent tools least-privilege and explicit.

## Coding-agent safety

Do not add automatic command execution, file deletion, credential access, or network access without a documented permission boundary and tests. Model output is untrusted input.

## Pull requests

Describe the behavior change, tests performed, security implications, and any Windows-specific requirements.
