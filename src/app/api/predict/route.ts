import { NextRequest, NextResponse } from 'next/server';
import { PredictionRequestSchema } from '@/lib/validations';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    
    // Check if Gemini API key is configured
    const geminiApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
      return NextResponse.json({ 
        error: 'AI Service Not Configured', 
        message: 'Please configure GOOGLE_AI_API_KEY to use prediction features.' 
      }, { status: 503 });
    }

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `
        You are an expert Epidemiologist and Public Health Analyst.
        Analyze the following data and provide a detailed prediction/assessment for the type: "${type}".
        
        DATA:
        ${JSON.stringify(data, null, 2)}
        
        RESPONSE FORMAT: Return ONLY a JSON object matching the expected structure for "${type}".
        No extra text or markdown code blocks.
      `;

      const aiResult = await model.generateContent(prompt);
      const response = await aiResult.response;
      let text = response.text().trim();
      
      // Basic JSON cleanup if AI includes markdown
      if (text.startsWith('```json')) text = text.replace(/```json|```/g, '').trim();
      if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

      return NextResponse.json(JSON.parse(text));
    } catch (aiError) {
      console.error('Gemini Prediction Error:', aiError);
      return NextResponse.json({ 
        error: 'AI Analysis Failed', 
        message: 'The AI service encountered an error while processing your request.' 
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Prediction failed' },
      { status: 500 }
    );
  }
}