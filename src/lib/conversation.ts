import { CONFIG } from "./config";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

let conversationHistory: ChatMessage[] = [];

export function getConversationHistory(): ChatMessage[] {
  return conversationHistory;
}

export function addToConversationHistory(message: ChatMessage) {
  conversationHistory.push(message);
  if (conversationHistory.length > CONFIG.MAX_CHAT_MESSAGES) {
    conversationHistory.shift();
  }
}

export function clearConversationHistory() {
  conversationHistory = [];
}
