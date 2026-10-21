import type { ChatMessage, ModelDetails, OllamaChatResponse, OllamaModel, PullProgress } from "../types.js";

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

  async showModel(model: string): Promise<ModelDetails> {
    const response = await this.request("/api/show", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: model })
    });
    return response.json() as Promise<ModelDetails>;
  }

  async deleteModel(model: string): Promise<void> {
    await this.request("/api/delete", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model })
    });
  }

  async pullModel(model: string, onProgress?: (progress: PullProgress) => void): Promise<void> {
    const response = await this.request("/api/pull", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, stream: true })
    });
    if (!response.body) throw new Error("Ollama pull returned no response stream");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const progress = JSON.parse(line) as PullProgress;
          if (progress.error) throw new Error(progress.error);
          onProgress?.(progress);
        }
      }
      if (buffer.trim()) {
        const progress = JSON.parse(buffer) as PullProgress;
        if (progress.error) throw new Error(progress.error);
        onProgress?.(progress);
      }
    } finally {
      reader.releaseLock();
    }
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
