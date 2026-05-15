import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, generateJSONResponse } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, location, context } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const model = getGeminiModel();

    const prompt = `
      You are a Public Health Expert and Health Assistant. Answer the following question:
      Question: "${question}"
      ${location ? `User Location: ${location}` : ''}
      ${context ? `Additional Context: ${JSON.stringify(context)}` : ''}

      Provide a helpful, accurate, and concise response. 
      Include "sources" (types of sources or general fields) and a "disclaimer".
      Return the response in JSON format.
    `;

    const data = await generateJSONResponse(model, prompt);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Health Query Error:', error);
    const status = error.message.includes('AI Service Not Configured') ? 503 : 500;
    return NextResponse.json({ error: error.message || 'Query failed' }, { status });
  }
}