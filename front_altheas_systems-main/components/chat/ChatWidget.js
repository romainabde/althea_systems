"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./ChatWidget.module.css";
import {
  endChatSession,
  escalateChatSession,
  sendChatMessage,
  startChatSession,
} from "../../services/chatbotService";

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

  async function openChat() {
    if (isOpen) {
      setIsOpen(false);
      if (sessionId) {
        await endChatSession(sessionId);
        setSessionId(null);
      }
      return;
    }

    setIsOpen(true);
    if (!sessionId) {
      const session = await startChatSession();
      setSessionId(session.sessionId);
      setMessages([
        {
          id: Date.now(),
          from: "bot",
          text: session.welcomeMessage,
        },
      ]);
    }
  }

  async function sendUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const session = await startChatSession();
      currentSessionId = session.sessionId;
      setSessionId(currentSessionId);
      if (messages.length === 0) {
        setMessages([
          {
            id: Date.now(),
            from: "bot",
            text: session.welcomeMessage,
          },
        ]);
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

    const response = await sendChatMessage({
      sessionId: currentSessionId,
      message: trimmed,
    });

    const botMessage = {
      id: Date.now() + 1,
      from: "bot",
      text: response.reply,
    };
    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await sendUserMessage(input);
  }

  async function handleHumanContact() {
    const response = await escalateChatSession(sessionId);
    const botMessage = {
      id: Date.now() + 2,
      from: "bot",
      text: response.message,
    };
    setMessages((prev) => [...prev, botMessage]);
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

          <p className={styles.intro}>Besoin d'aide rapide sur votre commande ?</p>

          <div className={styles.messages} ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={message.from === "user" ? styles.userMessage : styles.botMessage}
              >
                {message.text}
              </div>
            ))}
            {isTyping ? <div className={styles.botMessage}>...</div> : null}
          </div>

          <button type="button" onClick={handleHumanContact} className={styles.humanButton}>
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
            <button type="submit" className={styles.sendButton} aria-label="Envoyer le message">
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
