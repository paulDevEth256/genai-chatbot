"use client";

import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const replyMessage = { role: "assistant", content: data.response };
      setMessages((prev) => [...prev, replyMessage]);
    } catch (err) {
      console.error("API Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: Failed to fetch response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6 flex flex-col flex-1 overflow-auto">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          💬 ChatGPT Clone
        </h1>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[60vh]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`whitespace-pre-wrap p-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-100 text-right ml-auto"
                  : "bg-gray-200 text-left mr-auto"
              } max-w-[80%]`}
            >
              {msg.content}
            </div>
          ))}

          {loading && (
            <div className="bg-gray-200 text-left p-3 rounded-lg max-w-[80%] mr-auto">
              Typing...
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <textarea
            className="flex-1 resize-none rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
