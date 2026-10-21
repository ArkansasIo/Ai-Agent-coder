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
