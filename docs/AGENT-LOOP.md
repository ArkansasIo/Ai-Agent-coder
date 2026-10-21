# Agent Loop

The coding agent follows a constrained loop:

1. Load configuration.
2. Inspect repository metadata and eligible text files.
3. Build bounded model context.
4. Ask Ollama for analysis or a structured proposal.
5. Validate returned paths and patch preconditions.
6. Present the proposed diff for human review.
7. Apply only an explicitly approved patch.
8. Run only an allowlisted verification command.
9. Report the exact actions and results.

The model never receives implicit authority to execute arbitrary shell commands or modify files directly.
