import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const time = request.nextUrl.searchParams.get('time');
    const weather = request.nextUrl.searchParams.get('weather');

    const suggestions = [
      {
        id: 'ctx-1',
        type: 'personal',
        priority: 'medium',
        title: 'Stay Hydrated',
        description: 'Current weather conditions suggest increased hydration needs.',
        timestamp: new Date()
      }
    ];

    return NextResponse.json({
      suggestions,
      context: { time, weather }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contextual suggestions' }, { status: 500 });
  }
}
