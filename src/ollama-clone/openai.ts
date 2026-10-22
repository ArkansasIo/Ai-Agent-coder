import type { Backend, ChatRequest, GenerateRequest, Message } from "./types.js";
import type { IncomingMessage, ServerResponse } from "node:http";

const send = (res: ServerResponse, status: number, value: unknown) => {
  const text = JSON.stringify(value);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(text);
};

async function read(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

export async function handleOpenAIRequest(req: IncomingMessage, res: ServerResponse, backend: Backend): Promise<boolean> {
  if (req.method !== "POST" || req.url !== "/v1/chat/completions") return false;
  try {
    const input = await read(req) as { model?: string; messages?: Message[]; stream?: boolean; temperature?: number; max_tokens?: number };
    if (!input.model || !Array.isArray(input.messages)) return send(res, 400, { error: { message: "model and messages are required", type: "invalid_request_error" } }) as never;
    const request: ChatRequest = { model: input.model, messages: input.messages, stream: input.stream, options: { temperature: input.temperature, num_predict: input.max_tokens } };
    const source = backend.chat(request);
    if (input.stream) {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
      for await (const chunk of source) {
        res.write(`data: ${JSON.stringify({ id: `chatcmpl-${Date.now()}`, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: chunk }, finish_reason: null }] })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
      res.end();
      return true;
    }
    let content = "";
    for await (const chunk of source) content += chunk;
    return send(res, 200, { id: `chatcmpl-${Date.now()}`, object: "chat.completion", choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }], model: input.model }) as never;
  } catch (error) {
    send(res, 500, { error: { message: error instanceof Error ? error.message : String(error), type: "server_error" } });
    return true;
  }
}

export function promptFromMessages(messages: Message[]): string {
  return messages.map(message => `${message.role}: ${message.content}`).join("\n");
}

export function asGenerateRequest(model: string, messages: Message[]): GenerateRequest {
  return { model, prompt: promptFromMessages(messages), stream: true };
}
