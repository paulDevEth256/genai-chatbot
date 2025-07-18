import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, model } = body;
  const selectedModel = model || "gpt-3.5-turbo";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ?? "No response from OpenAI.";
    return NextResponse.json({ response: reply });
  } catch (err: any) {
    console.error("OpenAI API error:", err);
    return NextResponse.json(
      { error: "Failed to contact OpenAI API." },
      { status: 500 }
    );
  }
}
