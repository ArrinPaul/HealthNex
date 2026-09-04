import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { JWTService } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const token = JWTService.extractTokenFromRequest(request);
    const payload = token ? JWTService.verifyToken(token) : null;
    if (!token || !payload || payload.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }

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
    // Convex itself re-verifies the token and the admin role (see
    // diseases.ts) so this mutation can't be reached by bypassing this route.
    const result = await convex.mutation(api.diseases.seedHistoricalOutbreaks, {
      token,
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
