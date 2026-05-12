import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, location, context } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({
        error: "AI Service Not Configured",
        message: "Please configure GOOGLE_AI_API_KEY for health query services."
      }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a Public Health Expert and Health Assistant. Answer the following question:
      Question: "${question}"
      ${location ? `User Location: ${location}` : ''}
      ${context ? `Additional Context: ${JSON.stringify(context)}` : ''}

      Provide a helpful, accurate, and concise response. 
      Include "sources" (types of sources or general fields) and a "disclaimer".
      Return the response in JSON format.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    if (text.startsWith('```json')) text = text.replace(/```json|```/g, '').trim();
    if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error('Health Query Error:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}