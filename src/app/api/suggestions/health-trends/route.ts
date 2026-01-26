import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const area = request.nextUrl.searchParams.get('area') || 'general';
    const timeframe = request.nextUrl.searchParams.get('timeframe') || 'weekly';

    return NextResponse.json({
      area,
      timeframe,
      trends: {
        waterborne: { status: 'stable', change: -2 },
        respiratory: { status: 'increasing', change: 5 },
        vectorborne: { status: 'stable', change: 0 }
      },
      summary: `Health trends for ${area} are generally stable with a slight increase in respiratory cases.`
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch health trends' }, { status: 500 });
  }
}
