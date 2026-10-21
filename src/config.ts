export type AgentConfig = {
  ollamaHost: string;
  model: string;
  maxFiles: number;
  maxBytesPerFile: number;
};

function positiveInt(value: string | undefined, fallback: number, max: number): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function loadConfig(): AgentConfig {
  return {
    ollamaHost: process.env.OLLAMA_HOST ?? "http://localhost:11434",
    model: process.env.AI_AGENT_MODEL ?? "qwen2.5-coder:7b",
    maxFiles: positiveInt(process.env.AI_AGENT_MAX_FILES, 30, 500),
    maxBytesPerFile: positiveInt(process.env.AI_AGENT_MAX_BYTES_PER_FILE, 16000, 1000000)
  };
}
