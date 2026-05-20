"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import {
  endChatSession,
  escalateChatSession,
  sendChatMessage,
  startChatSession,
} from "../../services/api/chatbotApi";

const SUPPORT_HINT =
  "Impossible de joindre le service support. Vérifiez que support-service tourne (port 8081) et NEXT_PUBLIC_SUPPORT_API_URL dans .env.local.";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isTyping, isOpen]);

  function appendBot(text) {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), from: "bot", text },
    ]);
  }

  async function openChat() {
    if (isOpen) {
      setIsOpen(false);
      if (sessionId) {
        try {
          await endChatSession(sessionId);
        } catch {
          /* fermeture best-effort */
        }
        setSessionId(null);
      }
      return;
    }

    setIsOpen(true);
    if (!sessionId) {
      try {
        const session = await startChatSession();
        setSessionId(session.sessionId);
        setMessages([
          {
            id: Date.now(),
            from: "bot",
            text:
              session.welcomeMessage ||
              "Bonjour, comment puis-je vous aider ?",
          },
        ]);
      } catch {
        setMessages([
          {
            id: Date.now(),
            from: "bot",
            text: SUPPORT_HINT,
          },
        ]);
      }
    }
  }

  async function sendUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    let currentSessionId = sessionId;

    if (!currentSessionId) {
      try {
        const session = await startChatSession();
        currentSessionId = session.sessionId;
        setSessionId(currentSessionId);
        if (messages.length === 0) {
          setMessages([
            {
              id: Date.now(),
              from: "bot",
              text:
                session.welcomeMessage ||
                "Bonjour, comment puis-je vous aider ?",
            },
          ]);
        }
      } catch {
        appendBot(SUPPORT_HINT);
        return;
      }
    }

    const userMessage = {
      id: Date.now(),
      from: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage({
        sessionId: currentSessionId,
        message: trimmed,
      });

      const replyText =
        typeof response?.reply === "string" ? response.reply : "";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: replyText || "(Réponse vide)",
        },
      ]);
    } catch {
      appendBot(SUPPORT_HINT);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendUserMessage(input);
  }

  async function handleHumanContact() {
    if (!sessionId) {
      appendBot(
        "Ouvrez une conversation en envoyant un message, ou réessayez dans un instant."
      );
      return;
    }
    try {
      const response = await escalateChatSession(sessionId);
      const text =
        typeof response?.message === "string"
          ? response.message
          : "Votre demande a été transmise à un agent.";
      appendBot(text);
    } catch {
      appendBot(SUPPORT_HINT);
    }
  }

  return (
    <div className={styles.wrapper}>
      {isOpen ? (
        <section className={styles.panel} aria-label="Fenetre de chat">
          <div className={styles.header}>
            <h3 className={styles.title}>Assistant Althea</h3>
            <button
              type="button"
              onClick={openChat}
              className={styles.iconButton}
              aria-label="Fermer le chatbot"
            >
              ×
            </button>
          </div>

          <p className={styles.intro}>
            Besoin d&apos;aide rapide sur votre commande ?
          </p>

          <div className={styles.messages} ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.from === "user"
                    ? styles.userMessage
                    : styles.botMessage
                }
              >
                {message.text}
              </div>
            ))}
            {isTyping ? <div className={styles.botMessage}>...</div> : null}
          </div>

          <button
            type="button"
            onClick={handleHumanContact}
            className={styles.humanButton}
          >
            Contacter un humain
          </button>

          <form onSubmit={handleSubmit} className={styles.inputRow}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className={styles.input}
              placeholder="Ecrivez votre message..."
              aria-label="Votre message"
            />
            <button
              type="submit"
              className={styles.sendButton}
              aria-label="Envoyer le message"
            >
              Envoyer
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={openChat}
        className={styles.fab}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        Chat
      </button>
    </div>
  );
}
