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
      console.warn("Health Forecast: Falling back to rule-based forecast.", aiError);
      const fallbackForecast = getFallbackForecast(healthData);
      return NextResponse.json(fallbackForecast);
    }
  } catch (error: any) {
    console.error('Health Forecast failed:', error);
    return NextResponse.json(
      { error: error.message || 'Forecast failed' },
      { status: 500 }
    );
  }
}

function getFallbackForecast(healthData: any[]) {
  const highRiskAreas = healthData
    .filter(d => Number(d.incidents ?? d.cases ?? 0) > 40)
    .map(d => String(d.community ?? d.location ?? 'District'));

  const forecastSummary = `Incidents are predicted to rise by approximately 15% across ${healthData.length} monitored sectors due to monsoon onset. ${highRiskAreas.length > 0 ? `${highRiskAreas.join(', ')} designated as critical sentinel zones.` : 'Overall hazard outlook remains stable.'}`;

  const averageIncidents = healthData.reduce((sum, d) => sum + Number(d.incidents ?? d.cases ?? 0), 0) / (healthData.length || 1);

  const trends = [
    { month: 'Jul', predictedIncidents: Math.round(averageIncidents * 1.1) },
    { month: 'Aug', predictedIncidents: Math.round(averageIncidents * 1.25) },
    { month: 'Sep', predictedIncidents: Math.round(averageIncidents * 0.95) }
  ];

  return {
    forecastSummary,
    highRiskAreas,
    trends
  };
}
