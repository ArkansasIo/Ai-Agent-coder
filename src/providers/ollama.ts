import type { ChatMessage, OllamaModel, OllamaChatResponse } from "../types.js";

export class OllamaProvider {
  readonly host: string;

  constructor(host = process.env.OLLAMA_HOST ?? "http://localhost:11434") {
    const normalized = host.trim().replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(normalized)) {
      throw new Error("Ollama host must begin with http:// or https://");
    }
    this.host = normalized;
  }

  private async request(path: string, init?: RequestInit): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(`${this.host}${path}`, init);
    } catch (error) {
      throw new Error(`Cannot reach Ollama at ${this.host}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Ollama returned HTTP ${response.status}: ${body || response.statusText}`);
    }
    return response;
  }

  async health(): Promise<{ version: string }> {
    const response = await this.request("/api/version");
    return response.json() as Promise<{ version: string }>;
  }

  async models(): Promise<OllamaModel[]> {
    const response = await this.request("/api/tags");
    const data = await response.json() as { models?: OllamaModel[] };
    return data.models ?? [];
  }

  async chat(model: string, messages: ChatMessage[]): Promise<string> {
    const response = await this.request("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false })
    });
    const data = await response.json() as OllamaChatResponse;
    if (data.error) throw new Error(data.error);
    return data.message?.content ?? "";
  }
}
