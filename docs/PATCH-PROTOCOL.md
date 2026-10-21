# Structured Patch Protocol

AI Agent Coder keeps model output advisory until a host-side approval step exists.

## JSON shape

```json
{
  "task": "Describe the requested change",
  "edits": [
    {
      "path": "src/example.ts",
      "kind": "create",
      "reason": "Explain why the file changes",
      "newContent": "export const value = 1;"
    }
  ],
  "verification": ["npm run check", "npm test"]
}
```

Supported edit kinds are `create`, `modify`, and `delete`. Relative paths are mandatory; absolute paths and `..` traversal are rejected. Creates and modifies require `newContent`; deletes cannot include it.

The parser also accepts a single fenced `json` block so a chat model can return the proposal without requiring a separate transport format.

## Trust boundary

Parsing is validation, not authorization. A valid proposal must still be reviewed by the host before any file is changed. Verification entries are descriptive at this stage and are never executed directly from model output.
