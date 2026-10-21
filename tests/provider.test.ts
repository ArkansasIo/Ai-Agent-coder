import test from "node:test";
import assert from "node:assert/strict";
import { OllamaProvider } from "../src/providers/ollama.js";

test("normalizes Ollama endpoint", () => {
  const provider = new OllamaProvider("http://localhost:11434///");
  assert.equal(provider.host, "http://localhost:11434");
});

test("rejects a malformed Ollama endpoint", () => {
  assert.throws(() => new OllamaProvider("localhost:11434"), /http:\/\//);
});
