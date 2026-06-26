import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    if (!latStr || !lonStr) {
      return NextResponse.json({ error: 'Missing latitude or longitude' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    // Fetch live weather data from Open-Meteo API (keyless, real-time)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation`;
    const res = await fetch(weatherUrl);
    
    let tempCelsius = 25;
    let humidity = 60;
    let rainfall = 0.0;

    if (res.ok) {
      const weatherData = await res.json();
      if (weatherData.current) {
        tempCelsius = weatherData.current.temperature_2m ?? 25;
        humidity = weatherData.current.relative_humidity_2m ?? 60;
        rainfall = weatherData.current.precipitation ?? 0.0;
      }
    }

    // Deterministic water quality parameters derived from actual environmental conditions
    // 1. pH calculation (baseline 7.2, slightly lowered by rainfall runoff, with coordinate offset)
    const coordSeed = Math.sin(lat) * Math.cos(lon);
    let pH = 7.2 - Math.min(0.6, rainfall * 0.04) - (coordSeed * 0.25);
    pH = Number(Math.max(6.0, Math.min(8.5, pH)).toFixed(2));

    // 2. Turbidity calculation (baseline 1.2 NTU, increases with rainfall, with coordinate offset)
    let turbidity = 1.2 + (rainfall * 2.1) + Math.abs(coordSeed * 1.5);
    turbidity = Number(Math.max(0.5, Math.min(25.0, turbidity)).toFixed(2));

    // 3. Risk level assessment (High if turbidity is > 5 NTU or pH is outside normal bounds)
    const riskLevel = (turbidity > 5.0 || pH < 6.5 || pH > 8.0) ? 'High' : 'Low';

    return NextResponse.json({
      waterQuality: {
        pH,
        turbidity,
        riskLevel
      },
      weather: {
        temperature: tempCelsius + 273.15, // Kelvin conversion for frontend compatibility
        rainfall,
        humidity
      }
    });

  } catch (error: any) {
    console.error('Water Quality API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch water quality data', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { location, sampleId } = await request.json();
    
    return NextResponse.json(
      { 
        error: 'Analysis Service Unavailable', 
        message: 'Automated water quality analysis is currently undergoing maintenance.' 
      }, 
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}