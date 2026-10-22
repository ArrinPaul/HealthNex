import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, generateJSONResponse } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { healthData } = json;

    if (!healthData || !Array.isArray(healthData)) {
      return NextResponse.json({ error: 'Health data array is required' }, { status: 400 });
    }

    try {
      const model = getGeminiModel();
      const prompt = `
        You are a Health Policy Advisor and Predictive Analyst.
        Generate a health forecast report for these districts:
        ${JSON.stringify(healthData, null, 2)}
        
        IMPORTANT: Return ONLY a JSON object matching this structure:
        {
          "forecastSummary": "A concise overview of predicted health trends...",
          "highRiskAreas": ["District X", "District Y"],
          "trends": [
            { "month": "Jul", "predictedIncidents": 30 },
            { "month": "Aug", "predictedIncidents": 45 }
          ]
        }
        Do not return markdown code blocks or extra text. Return ONLY valid JSON.
      `;

      const aiData = await generateJSONResponse(model, prompt);
      return NextResponse.json(aiData);
    } catch (aiError) {
      console.warn("Health Forecast: Provider failed, returning explicit 503 response.", aiError);
      return NextResponse.json({
        error: 'AI health forecast service is temporarily unavailable.',
        status: 'unavailable',
        message: 'District incident predictive modeling could not be completed at this time.'
      }, { status: 503 });
    }
  } catch (error: any) {
    console.error('Health Forecast failed:', error);
    return NextResponse.json(
      { error: error.message || 'Forecast failed' },
      { status: 500 }
    );
  }
}
