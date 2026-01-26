import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, location, demographicInfo } = body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({
        analysis: "AI Symptom Analysis is currently in demo mode. Please configure your API key for real-time analysis.",
        diagnosis: "Demographic/General Assessment",
        confidence: 0.5,
        recommendations: ["Consult a doctor for accurate diagnosis", "Stay hydrated", "Monitor symptoms"]
      });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a medical diagnostic assistant. Analyze the following symptoms:
      Symptoms: ${symptoms.join(', ')}
      ${location ? `Location: ${location}` : ''}
      ${demographicInfo ? `Demographic Info: ${JSON.stringify(demographicInfo)}` : ''}

      Provide a structured analysis in JSON format including:
      1. "analysis": A detailed explanation of potential causes.
      2. "diagnosis": Likely condition (include disclaimer).
      3. "confidence": A value between 0 and 1.
      4. "recommendations": An array of actionable steps.
      5. "urgency": "low", "medium", or "high".

      DISCLAIMER: State that this is not a medical diagnosis.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    if (text.startsWith('```json')) text = text.replace(/```json|```/g, '').trim();
    if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error('Symptom Analysis Error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}