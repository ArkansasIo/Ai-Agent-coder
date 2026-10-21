export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OllamaModel = {
  name: string;
  modified_at?: string;
  size?: number;
  digest?: string;
};

export type OllamaChatResponse = {
  message?: { role?: string; content?: string };
  done?: boolean;
  error?: string;
};

export type AgentPlan = {
  task: string;
  repositoryRoot: string;
  includedFiles: string[];
  response: string;
};

export type ModelDetails = {
  modelfile?: string;
  parameters?: string;
  template?: string;
  details?: Record<string, unknown>;
  model_info?: Record<string, unknown>;
};

export type PullProgress = {
  status?: string;
  digest?: string;
  total?: number;
  completed?: number;
  error?: string;
};

export type ToolResult = {
  ok: boolean;
  output: string;
};
