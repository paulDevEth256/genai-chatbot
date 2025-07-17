import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, model, provider } = body;
  const selectedModel = model || "gpt-3.5-turbo";
  const selectedProvider = provider || "openai";

  let apiUrl = "";
  let headers: Record<string, string> = {};
  let payload: any = {};

  if (selectedProvider === "openai") {
    apiUrl = "https://api.openai.com/v1/chat/completions";
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };
    payload = {
      model: selectedModel,
      messages: [{ role: "user", content: message }],
    };
  } else if (selectedProvider === "anthropic") {
    apiUrl = "https://api.anthropic.com/v1/messages";
    headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
    };
    payload = {
      model: selectedModel || "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [{ role: "user", content: message }],
    };
  } else if (selectedProvider === "gemini") {
    apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${
      selectedModel || "gemini-pro"
    }:generateContent?key=${process.env.GOOGLE_API_KEY}`;
    headers = {
      "Content-Type": "application/json",
    };
    payload = {
      contents: [{ parts: [{ text: message }] }],
    };
  } else {
    return NextResponse.json(
      { error: "Unsupported provider." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    let reply = "No response from provider.";
    if (selectedProvider === "openai") {
      reply = data.choices?.[0]?.message?.content ?? reply;
    } else if (selectedProvider === "anthropic") {
      reply = data.content?.[0]?.text ?? reply;
    } else if (selectedProvider === "gemini") {
      reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? reply;
    }

    return NextResponse.json({ response: reply });
  } catch (err: any) {
    console.error(`${selectedProvider} API error:`, err);
    return NextResponse.json(
      { error: `Failed to contact ${selectedProvider} API.` },
      { status: 500 }
    );
  }
}
