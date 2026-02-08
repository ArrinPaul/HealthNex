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
      return useMockPrediction(type, data);
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
      return useMockPrediction(type, data);
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Prediction failed' },
      { status: 500 }
    );
  }
}

function useMockPrediction(type: string, data: any) {
  switch (type) {
    case 'outbreak':
      return NextResponse.json({
        prediction: {
          riskLevel: 'Medium',
          probability: Math.round(30 + Math.random() * 40),
          timeframe: '2-4 weeks',
          affectedArea: 'Urban districts',
          recommendedActions: ['Increase health surveillance', 'Prepare medical supplies'],
          confidence: 85
        }
      });
    // ... rest of mock logic remains similar but wrapped in NextResponse.json
    case 'trend':
      return NextResponse.json({
        forecast: {
          districts: [{ name: 'District A', trend: 'increasing', cases: 45, prediction: 65 }],
          timeframe: '30 days',
          accuracy: '87%'
        }
      });
    case 'epidemic':
      return NextResponse.json({
        epidemicPrediction: {
          regions: [{ region: 'North', risk: 'High', preparedness: 'Enhanced monitoring required' }],
          overallRisk: 'Medium'
        }
      });
    case 'maintenance':
      return NextResponse.json({
        maintenancePrediction: {
          sources: [{ source: 'Plant A', nextMaintenance: '15 days', priority: 'High' }]
        }
      });
    case 'sentiment':
      return NextResponse.json({
        sentimentAnalysis: {
          overallSentiment: 'Positive',
          confidence: 0.78,
          keyThemes: ['water quality']
        }
      });
    default:
      return NextResponse.json({ error: 'Unknown prediction type' }, { status: 400 });
  }
}