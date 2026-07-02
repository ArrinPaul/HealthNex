import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function GET(request: NextRequest) {
  try {
    const token = JWTService.extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JWTService.verifyToken(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch full user profile from database
    let user;
    user = await convex.query(api.users.getSelf, { token });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User no longer exists or is inactive' }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        verificationStatus: user.verificationStatus || 'none',
        onboardingCompleted: user.onboardingCompleted || false,
        dateOfBirth: user.dateOfBirth || null,
        gender: user.gender || null,
        location: user.location || null,
        bloodGroup: user.bloodGroup || null,
        medicalConditions: user.medicalConditions || [],
        occupation: user.occupation || null,
      },
      token: token
    });

  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
