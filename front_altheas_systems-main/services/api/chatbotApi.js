import { API_CONFIG } from "../config";
import { httpClient } from "../http/client";
import { API_ROUTES } from "../routes";

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildMockReply(input) {
  const text = input.toLowerCase();

  if (text.includes("adresse")) {
    return "Pour modifier une adresse, allez dans Checkout > Adresse ou dans Mon compte > Paramètres.";
  }
  if (text.includes("paiement") || text.includes("carte")) {
    return "Les méthodes de paiement sont gérées à l'étape Paiement du checkout. Vous pouvez y renseigner votre carte.";
  }
  if (text.includes("commande") || text.includes("suivi")) {
    return "Le suivi de commande est visible dans Mon compte > Mes commandes, avec le statut en temps réel.";
  }

  return "Merci pour votre message. Je peux vous aider sur les adresses, paiements ou suivi de commande.";
}

export async function startChatSessionApi() {
  if (API_CONFIG.useMocks) {
    await sleep(250);
    return {
      sessionId: `chat_${Date.now()}`,
      welcomeMessage: "Bonjour, je suis l'Assistant Althea. Comment puis-je vous aider ?",
    };
  }

  const data = await httpClient(API_ROUTES.chatbot.start, { method: "POST" });
  const welcome = data.messages?.[0];
  return {
    sessionId: data.sessionId,
    welcomeMessage: welcome?.text ?? "",
  };
}

export async function sendChatMessageApi(payload) {
  if (API_CONFIG.useMocks) {
    await sleep(700);
    return {
      reply: buildMockReply(payload.message || ""),
    };
  }

  const data = await httpClient(API_ROUTES.chatbot.message, {
    method: "POST",
    body: JSON.stringify({
      sessionId: payload.sessionId,
      text: payload.message,
    }),
  });
  const replyText =
    typeof data.reply === "string" ? data.reply : data.reply?.text;
  return { reply: replyText ?? "" };
}

export async function endChatSessionApi(payload) {
  if (API_CONFIG.useMocks) {
    await sleep(200);
    return { success: true };
  }

  return httpClient(API_ROUTES.chatbot.end, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function escalateChatSessionApi(payload) {
  if (API_CONFIG.useMocks) {
    await sleep(250);
    return {
      message: "Votre demande sera transmise a un agent humain.",
    };
  }

  return httpClient(API_ROUTES.chatbot.escalate, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
