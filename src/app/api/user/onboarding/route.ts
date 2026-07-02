import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function POST(request: NextRequest) {
  try {
    const token = JWTService.extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JWTService.verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { state, district, address, latitude, longitude, dateOfBirth, gender, bloodGroup, medicalConditions, occupation } = body;

    if (!state || !dateOfBirth || !gender) {
      return NextResponse.json({ error: 'State, date of birth, and gender are required' }, { status: 400 });
    }

    const location = {
      latitude: latitude || 0,
      longitude: longitude || 0,
      address: address || '',
      state: state || '',
      district: district || '',
    };

    await convex.mutation(api.users.completeOnboarding, {
      token,
      dateOfBirth,
      gender,
      location,
      bloodGroup: bloodGroup || '',
      medicalConditions: medicalConditions || [],
      occupation: occupation || '',
    });

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
