// components/ChatClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

const MODELS = ["gpt-3.5-turbo", "gpt-4", "claude-3", "mistral-7b"];

export default function ChatClient() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, model }),
    });

    if (!res.body) {
      setLoading(false);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    const streamResponse = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...newMessages,
          { role: "assistant", content: fullText },
        ]);
      }
      setLoading(false);
    };

    streamResponse();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white font-sans">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
        <div className="text-xl font-bold">Chat Arena</div>
        <select
          className="bg-zinc-800 text-white px-3 py-2 rounded-md text-sm"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {MODELS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="flex items-start gap-2 max-w-xl">
              {msg.role === "assistant" && (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  AI
                </div>
              )}
              {msg.role === "user" && (
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  User
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap prose prose-invert bg-zinc-800`}
              >
                <Markdown>{msg.content}</Markdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-sm text-zinc-500">Streaming response...</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 resize-none bg-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
