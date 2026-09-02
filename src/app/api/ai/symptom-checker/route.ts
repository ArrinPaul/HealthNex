import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are a medical triage AI for an Indian public health platform (HealthNex).
Your job is to ask the user questions one by one to determine their disease based on symptoms.
Be empathetic, concise, and professional.
Ask ONLY ONE question at a time.
Once you are fairly confident (e.g., after 3-5 questions) OR if the user provides enough info, you MUST make a final prediction.
When making a final prediction, your response MUST be in this exact JSON format and nothing else:
{"prediction": "Disease Name", "score": 85, "reasoning": "Brief explanation", "symptoms": ["fever", "cough"]}
Until you are ready to predict, just reply with the next question in plain text.`;

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Use small fast model
        messages: apiMessages,
        temperature: 0.2,
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", err);
      return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Symptom checker error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
