import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { ChatMessage } from "./types.js";
import { OllamaProvider } from "./providers/ollama.js";

export async function runInteractiveChat(provider: OllamaProvider, model: string): Promise<void> {
  const readline = createInterface({ input, output });
  const messages: ChatMessage[] = [
    { role: "system", content: "You are a local-first coding assistant. Be precise, explain assumptions, and never claim to have changed files unless a tool actually did so." }
  ];

  console.log(`AI Agent Coder chat — model: ${model}`);
  console.log("Type /exit to quit, /clear to reset conversation.");

  try {
    while (true) {
      const prompt = (await readline.question("\nYou> ")).trim();
      if (!prompt) continue;
      if (prompt === "/exit" || prompt === "/quit") break;
      if (prompt === "/clear") {
        messages.splice(1);
        console.log("Conversation cleared.");
        continue;
      }

      messages.push({ role: "user", content: prompt });
      const response = await provider.chat(model, messages);
      messages.push({ role: "assistant", content: response });
      console.log(`\nAI> ${response}`);
    }
  } finally {
    readline.close();
  }
}
