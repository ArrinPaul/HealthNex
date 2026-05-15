import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, generateJSONResponse } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, location, demographicInfo } = body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 });
    }

    const model = getGeminiModel();

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

    const data = await generateJSONResponse(model, prompt);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Symptom Analysis Error:', error);
    const status = error.message.includes('AI Service Not Configured') ? 503 : 500;
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status });
  }
}