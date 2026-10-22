export type Role = "system" | "user" | "assistant" | "tool";

export type Message = {
  role: Role;
  content: string;
  name?: string;
};

export type GenerateRequest = {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  stream?: boolean;
  options?: Record<string, unknown>;
};

export type ChatRequest = {
  model: string;
  messages: Message[];
  stream?: boolean;
  options?: Record<string, unknown>;
};

export type ModelRecord = {
  name: string;
  digest: string;
  size: number;
  modified_at: string;
  family?: string;
  parameter_size?: string;
  quantization_level?: string;
  modelfile?: string;
  parameters?: Record<string, string>;
  template?: string;
  system?: string;
};

export type Backend = {
  generate(request: GenerateRequest): AsyncIterable<string>;
  chat(request: ChatRequest): AsyncIterable<string>;
};
