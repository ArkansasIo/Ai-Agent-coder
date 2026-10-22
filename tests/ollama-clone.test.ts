import test from "node:test";
import assert from "node:assert/strict";
import { parseModelfile } from "../src/ollama-clone/modelfile.js";
import { ModelStore } from "../src/ollama-clone/model-store.js";
import { createOllamaCompatibleServer } from "../src/ollama-clone/server.js";
import type { Backend } from "../src/ollama-clone/types.js";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function* chunks(value: string) { yield value; }

const backend: Backend = {
  generate: async function* () { yield "hello"; yield " world"; },
  chat: async function* () { yield "hello"; yield " from clone"; }
};

test("parses Modelfile directives", () => {
  const model = parseModelfile(`FROM ./model.gguf\nPARAMETER temperature 0.7\nSYSTEM \"\"\"You are local.\"\"\"\nMESSAGE user hello`);
  assert.equal(model.from, "./model.gguf");
  assert.equal(model.parameters.get("temperature"), "0.7");
  assert.equal(model.system, "You are local.");
  assert.deepEqual(model.messages, [{ role: "user", content: "hello" }]);
});

test("stores and lists model metadata", async () => {
  const root = await mkdtemp(join(tmpdir(), "ollama-clone-"));
  const source = join(root, "model.gguf");
  await writeFile(source, Buffer.from("test model"));
  const store = new ModelStore(join(root, "store"));
  const record = await store.importFile(source, "test-model");
  assert.equal((await store.get("test-model"))?.digest, record.digest);
  assert.equal((await store.list()).length, 1);
  assert.equal(await store.remove("test-model"), true);
});

test("serves Ollama-compatible tags and chat endpoints", async () => {
  const root = await mkdtemp(join(tmpdir(), "ollama-clone-http-"));
  const store = new ModelStore(root);
  await store.put({ name: "demo", digest: "sha256:test", size: 1, modified_at: new Date().toISOString() });
  const server = createOllamaCompatibleServer({ host: "127.0.0.1", port: 0, store, backend });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const base = `http://127.0.0.1:${address.port}`;
  const tags = await fetch(`${base}/api/tags`).then(r => r.json()) as { models: Array<{ name: string }> };
  assert.equal(tags.models[0].name, "demo");
  const chat = await fetch(`${base}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model: "demo", messages: [{ role: "user", content: "hi" }], stream: false }) }).then(r => r.json()) as { message: { content: string } };
  assert.equal(chat.message.content, "hello from clone");
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
