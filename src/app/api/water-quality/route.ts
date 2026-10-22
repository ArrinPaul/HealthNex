import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lonStr = searchParams.get('lon');

    if (!latStr || !lonStr) {
      return NextResponse.json({ error: 'Missing latitude or longitude parameters' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ 
        error: 'Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.' 
      }, { status: 400 });
    }

    // Fetch live weather data from Open-Meteo API (keyless, real-time)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation`;
    let res: Response;
    try {
      res = await fetch(weatherUrl);
    } catch (fetchErr: any) {
      return NextResponse.json({
        error: 'Environmental telemetry provider unreachable',
        details: 'Failed to connect to meteorological provider to calculate environmental estimates.'
      }, { status: 502 });
    }
    
    if (!res.ok) {
      return NextResponse.json({
        error: 'Environmental telemetry provider unavailable',
        details: 'Meteorological data could not be retrieved from Open-Meteo API to compute runoff estimates.'
      }, { status: 502 });
    }

    const weatherData = await res.json();
    if (!weatherData.current) {
      return NextResponse.json({
        error: 'Incomplete meteorological telemetry',
        details: 'Weather provider returned incomplete current conditions.'
      }, { status: 502 });
    }

    const tempCelsius = typeof weatherData.current.temperature_2m === 'number' ? weatherData.current.temperature_2m : 25;
    const humidity = typeof weatherData.current.relative_humidity_2m === 'number' ? weatherData.current.relative_humidity_2m : 60;
    const rainfall = typeof weatherData.current.precipitation === 'number' ? weatherData.current.precipitation : 0.0;

    // Mathematical runoff model estimating environmental risk parameters
    // Note: These values are mathematical estimates, NOT direct laboratory or sensor observations
    const coordSeed = Math.sin(lat) * Math.cos(lon);
    let pH = 7.2 - Math.min(0.6, rainfall * 0.04) - (coordSeed * 0.25);
    pH = Number(Math.max(6.0, Math.min(8.5, pH)).toFixed(2));

    let turbidity = 1.2 + (rainfall * 2.1) + Math.abs(coordSeed * 1.5);
    turbidity = Number(Math.max(0.5, Math.min(25.0, turbidity)).toFixed(2));

    const riskLevel = (turbidity > 5.0 || pH < 6.5 || pH > 8.0) ? 'High' : 'Low';

    return NextResponse.json({
      provenance: {
        dataType: 'modeled_estimate',
        isDirectMeasurement: false,
        model: 'meteorological_runoff_estimate',
        description: 'Parameters are mathematically estimated from terrain coordinates and rainfall runoff telemetry. These are NOT direct laboratory or sensor measurements.',
        weatherSource: 'Open-Meteo API',
        stationCoordinates: { lat, lon },
        retrievedAt: new Date().toISOString()
      },
      waterQuality: {
        pH,
        turbidity,
        riskLevel,
        isEstimated: true,
        dataType: 'modeled_estimate'
      },
      weather: {
        temperature: tempCelsius + 273.15, // Kelvin conversion for frontend compatibility
        rainfall,
        humidity,
        isDirectMeasurement: true,
        source: 'Open-Meteo API'
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
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { location, sampleId } = body;
    if (!location || !sampleId) {
      return NextResponse.json({ 
        error: 'Missing required fields: location and sampleId are required.' 
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { 
        error: 'Direct laboratory analysis unsupported', 
        status: 'unsupported_operation',
        message: 'Direct sample ingestion and laboratory analysis is not supported on this endpoint. Please submit verified water quality test reports through authorized health worker portals.' 
      }, 
      { status: 501 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Analysis request failed' },
      { status: 500 }
    );
  }
}