"use client";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState("");
  const [streamResponse, setStreamResponse] = useState("");

  const handleChat = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("Error : " + error.message);
    }

    setLoading(false);
  };

  const handleStreamChat = async () => {
    setStreaming(true);
    setStreamResponse("");

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            setStreamResponse((prev) => prev + data.content);
          }
        }
      }
    } catch (error) {
      setStreamResponse("Error : " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <h1>ChatBot to Give best Solutions</h1>

      <textarea
        className={styles.textarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your awesome message here"
        rows={4}
      />

      <div>
        <button
          onClick={handleChat}
          className={`${styles.button} ${styles.chatBtn}`}
        >
          {loading ? "Loading" : "Chat"}
        </button>
        <button
          onClick={handleStreamChat}
          className={`${styles.button} ${styles.streamBtn}`}
        >
          {loading ? "Loading" : "Stream Chat"}
        </button>
      </div>

      <div className={styles.responseBox}>{response}</div>
      <div className={styles.responseBox}>{streamResponse}</div>
    </div>
  );
}
