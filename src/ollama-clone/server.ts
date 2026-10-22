import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import type { ChatRequest, GenerateRequest, Backend } from "./types.js";
import { ModelStore } from "./model-store.js";
import { handleOpenAIRequest } from "./openai.js";

const json = (res: ServerResponse, status: number, value: unknown) => {
  const body = JSON.stringify(value);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body) });
  res.end(body);
};

async function body(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function stream(res: ServerResponse, source: AsyncIterable<string>, map: (text: string, done: boolean) => unknown): Promise<void> {
  res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-cache", connection: "keep-alive" });
  for await (const text of source) res.write(`${JSON.stringify(map(text, false))}\n`);
  res.write(`${JSON.stringify(map("", true))}\n`);
  res.end();
}

export type CloneServerOptions = { host?: string; port?: number; store?: ModelStore; backend: Backend };

export function createOllamaCompatibleServer(options: CloneServerOptions) {
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? Number(process.env.OLLAMA_CLONE_PORT ?? 11434);
  const store = options.store ?? new ModelStore();
  const backend: Backend = options.backend;

  return createServer(async (req, res) => {
    try {
      if (await handleOpenAIRequest(req, res, backend)) return;
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${host}:${port}`}`);
      const path = url.pathname;
      if (req.method === "GET" && path === "/") return json(res, 200, { status: "Ollama-compatible runtime" });
      if (req.method === "GET" && path === "/api/version") return json(res, 200, { version: "0.1.0-clone" });
      if (req.method === "GET" && path === "/api/tags") return json(res, 200, { models: await store.list() });
      if (req.method === "GET" && path === "/v1/models") {
        const models = await store.list();
        return json(res, 200, { object: "list", data: models.map(m => ({ id: m.name, object: "model", owned_by: "local", created: Math.floor(Date.parse(m.modified_at) / 1000) })) });
      }
      if (req.method === "POST" && path === "/api/show") {
        const input = await body(req) as { name?: string; model?: string };
        const model = await store.get(input.name ?? input.model ?? "");
        if (!model) return json(res, 404, { error: "model not found" });
        return json(res, 200, model);
      }
      if ((req.method === "DELETE" || req.method === "POST") && path === "/api/delete") {
        const input = await body(req) as { name?: string; model?: string };
        const ok = await store.remove(input.name ?? input.model ?? "");
        return ok ? json(res, 200, {}) : json(res, 404, { error: "model not found" });
      }
      if (req.method === "POST" && path === "/api/generate") {
        const input = await body(req) as GenerateRequest;
        const source = backend.generate(input);
        if (input.stream === false) {
          let response = "";
          for await (const chunk of source) response += chunk;
          return json(res, 200, { model: input.model, response, done: true });
        }
        return stream(res, source, (text, done) => ({ model: input.model, response: text, done }));
      }
      if (req.method === "POST" && path === "/api/chat") {
        const input = await body(req) as ChatRequest;
        const source = backend.chat(input);
        if (input.stream === false) {
          let response = "";
          for await (const chunk of source) response += chunk;
          return json(res, 200, { model: input.model, message: { role: "assistant", content: response }, done: true });
        }
        return stream(res, source, (text, done) => ({ model: input.model, message: { role: "assistant", content: text }, done }));
      }
      return json(res, 404, { error: "not found" });
    } catch (error) {
      return json(res, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  });
}

export async function startOllamaCompatibleServer(options: CloneServerOptions): Promise<void> {
  await (options.store ?? new ModelStore()).init();
  const server = createOllamaCompatibleServer(options);
  const port = options.port ?? Number(process.env.OLLAMA_CLONE_PORT ?? 11434);
  const host = options.host ?? "127.0.0.1";
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve());
  });
  console.log(`Ollama-compatible runtime listening on http://${host}:${port}`);
}
