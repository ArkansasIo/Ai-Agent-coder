import type { ChatMessage } from "./types.js";

export class ChatSession {
  private readonly messages: ChatMessage[] = [];

  addUser(content: string): void { this.messages.push({ role: "user", content }); }
  addAssistant(content: string): void { this.messages.push({ role: "assistant", content }); }
  clear(): void { this.messages.length = 0; }
  history(): ChatMessage[] { return this.messages.map((message) => ({ ...message })); }
}
