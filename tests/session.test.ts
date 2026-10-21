import test from "node:test";
import assert from "node:assert/strict";
import { ChatSession } from "../src/session.js";

test("chat session stores and clears messages", () => {
  const session = new ChatSession();
  session.addUser("hello");
  session.addAssistant("hi");
  assert.equal(session.history().length, 2);
  session.clear();
  assert.equal(session.history().length, 0);
});
