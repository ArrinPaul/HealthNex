import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { location, coordinates, waterQuality, weather } = await request.json();

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Return safe, realistic fallback recommendations if AI key is missing or not configured
      return NextResponse.json({
        recommendations: getFallbackRecommendations(waterQuality, weather)
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert public health and water safety AI assistant.
Analyze the following water quality and weather metrics for a region, and provide 3-4 actionable, high-quality public health recommendations to ensure water safety. Keep each recommendation short, precise, and practical.
Location: ${location}
Coordinates: Latitude ${coordinates?.lat}, Longitude ${coordinates?.lng}
Water Quality Parameters:
- pH: ${waterQuality?.pH}
- Turbidity: ${waterQuality?.turbidity} NTU
- Risk Level: ${waterQuality?.riskLevel}
Weather Telemetry:
- Temperature: ${Math.round((weather?.temperature || 298.15) - 273.15)}°C
- Rainfall: ${weather?.rainfall || 0} mm
- Humidity: ${weather?.humidity || 60}%

Return ONLY a JSON object containing a key 'recommendations' which maps to an array of 3-4 strings (recommendations). Example output format:
{
  "recommendations": [
    "First recommendation",
    "Second recommendation",
    "Third recommendation"
  ]
}
Do not include any markdown styling like \`\`\`json or extra explanations outside the JSON structure.`;

    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();
    
    // Clean code fences if AI returned them
    const cleanText = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    
    try {
      const parsedData = JSON.parse(cleanText);
      if (parsedData && Array.isArray(parsedData.recommendations)) {
        return NextResponse.json({ recommendations: parsedData.recommendations });
      }
    } catch (parseError) {
      console.warn("Gemini didn't return valid JSON. Response text was:", text);
    }

    // Default to fallback if parsing fails
    return NextResponse.json({
      recommendations: getFallbackRecommendations(waterQuality, weather)
    });

  } catch (error: any) {
    console.error('Water Quality AI Analysis API error:', error);
    // Return fallback recommendations instead of 500
    return NextResponse.json({
      recommendations: getFallbackRecommendations(
        error.waterQuality || { pH: 7.2, turbidity: 1.2, riskLevel: 'Low' },
        error.weather || { temperature: 298.15, humidity: 60 }
      )
    });
  }
}

function getFallbackRecommendations(waterQuality: any, weather: any) {
  const ph = waterQuality?.pH ?? 7.2;
  const turbidity = waterQuality?.turbidity ?? 1.2;
  const rainfall = weather?.rainfall ?? 0;

  const recommendations = [];

  if (turbidity > 5.0) {
    recommendations.push(`Turbidity level is elevated at ${turbidity} NTU, which exceeds WHO drinking guidelines. Filter water using double-folded clean cotton cloth or commercial filters before utilization.`);
    recommendations.push("Boil all drinking water vigorously for at least 1-2 minutes to eliminate microbial contaminants that bind to suspended particles.");
  } else {
    recommendations.push("Turbidity parameters are within the safe threshold (<5 NTU). Standard household filtration is sufficient.");
  }

  if (ph < 6.5 || ph > 8.5) {
    recommendations.push(`Water pH is outside the ideal potable range (pH: ${ph}). Test secondary wells and inspect pipelines for potential acidic runoff or alkaline contamination.`);
  } else {
    recommendations.push(`Potability pH index is optimal (${ph}). No acid/alkaline neutralizing countermeasures required.`);
  }

  if (rainfall > 10) {
    recommendations.push(`Significant rainfall observed (${rainfall} mm). Inspect local storage tanks and implement chlorination procedures to mitigate storm runoff contamination.`);
  } else {
    recommendations.push("Precipitation risk is minimal. Continue regular municipal and source sanitation inspections.");
  }

  return recommendations;
}
