import {
  endChatSessionApi,
  escalateChatSessionApi,
  sendChatMessageApi,
  startChatSessionApi,
} from "./api/chatbotApi";

export async function startChatSession() {
  return startChatSessionApi();
}

export async function sendChatMessage({ sessionId, message }) {
  return sendChatMessageApi({ sessionId, message });
}

export async function endChatSession(sessionId) {
  return endChatSessionApi({ sessionId });
}

export async function escalateChatSession(sessionId) {
  return escalateChatSessionApi({ sessionId });
}
