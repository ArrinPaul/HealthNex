import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simulate water quality data
    const waterQualityData = {
      ph: Math.round((6.5 + Math.random() * 2) * 10) / 10, // 6.5-8.5
      turbidity: Math.round((1 + Math.random() * 3) * 10) / 10, // 1-4 NTU
      chlorine: Math.round((0.2 + Math.random() * 0.8) * 100) / 100, // 0.2-1.0 mg/L
      temperature: Math.round((20 + Math.random() * 10) * 10) / 10, // 20-30°C
      timestamp: new Date().toISOString(),
      location: 'Sample Location',
      status: 'normal'
    };

    // Determine risk level
    let riskLevel = 'Low';
    let alerts = [];

    if (waterQualityData.ph < 6.5 || waterQualityData.ph > 8.5) {
      riskLevel = 'High';
      alerts.push('pH level outside safe range');
    }
    if (waterQualityData.turbidity > 3) {
      riskLevel = riskLevel === 'High' ? 'High' : 'Medium';
      alerts.push('High turbidity detected');
    }
    if (waterQualityData.chlorine < 0.2) {
      riskLevel = riskLevel === 'High' ? 'High' : 'Medium';
      alerts.push('Low chlorine levels');
    }

    return NextResponse.json({
      waterQuality: {
        pH: waterQualityData.ph,
        turbidity: waterQualityData.turbidity,
        chlorine: waterQualityData.chlorine,
        riskLevel
      },
      weather: {
        temperature: 300,
        humidity: 65,
        condition: 'Clear'
      },
      alerts,
      recommendations: [
        'Regular water quality monitoring recommended',
        'Use water purification tablets if available',
        'Boil water for 20 minutes before consumption'
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch water quality data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { location, sampleId } = await request.json();
    
    // Simulate AI-powered water quality analysis
    const analysis = {
      sampleId: sampleId || `WQ-${Date.now()}`,
      location: location || 'Unknown',
      timestamp: new Date().toISOString(),
      aiRecommendations: [
        '🔬 Water quality analysis complete',
        '✅ Safe for consumption after boiling',
        '⚠️ Monitor chlorine levels regularly',
        '🚰 Consider installing water filtration system'
      ],
      score: Math.round(70 + Math.random() * 25), // 70-95
      status: 'analyzed'
    };

    return NextResponse.json({ 
      analysis,
      recommendations: analysis.aiRecommendations 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}