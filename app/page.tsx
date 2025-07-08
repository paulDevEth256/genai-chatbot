// ✅ This is a production-ready Next.js App Router component
// ✅ Features implemented:
// 🔄 Streaming token-based responses using ReadableStream
// 🌙 Dark mode with toggle + system theme detection
// 💾 Persistent chat using localStorage
// 💡 GPT model selector
// ✨ Smooth chat animations

"use client";

import { useEffect, useRef, useState } from "react";

const MODELS = ["gpt-3.5-turbo", "gpt-4"];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [streaming, setStreaming] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  );
  const [model, setModel] = useState(MODELS[0]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("chat-theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("chat-history");
    if (saved) setMessages(JSON.parse(saved));

    const storedTheme = localStorage.getItem("chat-theme");
    if (storedTheme === "dark" || storedTheme === "light")
      setTheme(storedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("chat-history", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, model }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let finalText = "";
    if (!reader) return;

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const idx = messages.length + 1;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      finalText += chunk;

      setMessages((prev) => {
        const copy = [...prev];
        copy[idx] = { role: "assistant", content: finalText };
        return copy;
      });
    }

    setStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white flex flex-col items-center px-4 py-6 transition-colors duration-300">
      <div className="w-full max-w-2xl flex flex-col flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">💬 GPT Chat</h1>
          <div className="flex items-center gap-3">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 text-sm p-2 rounded-md"
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                setTheme((prev) => (prev === "dark" ? "light" : "dark"))
              }
              className="text-sm px-3 py-1 rounded-md bg-gray-300 dark:bg-gray-700 hover:opacity-80"
            >
              {theme === "dark" ? "🌞" : "🌙"}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[60vh]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap p-3 rounded-lg shadow-md transition-all duration-300 ease-in-out animate-fadeIn ${
                msg.role === "user"
                  ? "bg-blue-100 dark:bg-blue-600 text-right ml-auto"
                  : "bg-gray-200 dark:bg-gray-700 text-left mr-auto"
              } max-w-[80%]`}
            >
              {msg.content}
            </div>
          ))}
          {streaming && (
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg max-w-[80%] mr-auto animate-pulse">
              Typing...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="mt-auto flex gap-2">
          <textarea
            className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 p-2 text-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
