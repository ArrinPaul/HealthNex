import { NextRequest, NextResponse } from 'next/server';
import { PredictionRequestSchema } from '@/lib/validations';
import { getGeminiModel, generateJSONResponse } from '@/lib/ai';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = PredictionRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ 
        error: 'Invalid prediction request', 
        details: result.error.format() 
      }, { status: 400 });
    }

    const { type, data } = result.data;
    
    try {
      const model = getGeminiModel();
      
      const prompt = `
        You are an expert Epidemiologist and Public Health Analyst.
        Analyze the following data and provide a detailed prediction/assessment for the type: "${type}".
        
        DATA:
        ${JSON.stringify(data, null, 2)}
        
        RESPONSE FORMAT: Return ONLY a JSON object matching the expected structure for "${type}".
        No extra text or markdown code blocks.
      `;

      const aiData = await generateJSONResponse(model, prompt);
      return NextResponse.json(aiData);
    } catch (aiError: any) {
      console.error('Gemini Prediction Error:', aiError);
      const status = aiError.message.includes('AI Service Not Configured') ? 503 : 500;
      return NextResponse.json({ 
        error: aiError.message || 'AI Analysis Failed', 
        message: 'The AI service encountered an error while processing your request.' 
      }, { status });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Prediction failed' },
      { status: 500 }
    );
  }
}