import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

test("loads bounded default configuration", () => {
  const config = loadConfig();
  assert.equal(config.ollamaHost, process.env.OLLAMA_HOST ?? "http://localhost:11434");
  assert.ok(config.maxFiles >= 1 && config.maxFiles <= 500);
  assert.ok(config.maxBytesPerFile >= 1 && config.maxBytesPerFile <= 1_000_000);
});
