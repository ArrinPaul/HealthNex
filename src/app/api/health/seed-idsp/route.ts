import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';

export async function POST(request: NextRequest) {
  try {
    const csvPath = path.join(process.cwd(), 'public', 'docs', 'idsp_historical_data.csv');
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV seed file not found at: ${csvPath}`);
    }
    
    const csvData = fs.readFileSync(csvPath, 'utf8');

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL environment variable is not defined");
    }

    const convex = new ConvexHttpClient(convexUrl);
    const result = await convex.mutation(api.diseases.seedHistoricalOutbreaks, {
      force: true,
      csvData: csvData
    });

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.count} real-world IDSP data nodes from CSV`,
      count: result.count
    });

  } catch (error: any) {
    console.error("IDSP Seeding API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to seed IDSP data' },
      { status: 500 }
    );
  }
}

// Support GET request for easy browser testing / diagnostic calls
export async function GET(request: NextRequest) {
  return POST(request);
}
