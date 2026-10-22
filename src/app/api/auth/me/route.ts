import { NextRequest } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { privateJsonResponse } from '@/lib/apiResponse';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function GET(request: NextRequest) {
  try {
    const token = JWTService.extractTokenFromRequest(request);

    if (!token) {
      return privateJsonResponse({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JWTService.verifyToken(token);

    if (!payload) {
      return privateJsonResponse({ error: 'Invalid token' }, { status: 401 });
    }

    // Fetch full user profile from database
    let user;
    user = await convex.query(api.users.getSelf, { token });

    if (!user || !user.isActive) {
      return privateJsonResponse({ error: 'User no longer exists or is inactive' }, { status: 401 });
    }

    return privateJsonResponse({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        requestedRole: user.requestedRole,
        location: user.location?.address || '',
        verificationStatus: user.verificationStatus || 'none',
        onboardingCompleted: user.onboardingCompleted || false,
        dateOfBirth: user.dateOfBirth || null,
        gender: user.gender || null,
        userLocation: user.location || null,
        bloodGroup: user.bloodGroup || null,
        medicalConditions: user.medicalConditions || [],
        occupation: user.occupation || null,
      },
      token: token
    });

  } catch (error) {
    console.error('Session error:', error);
    return privateJsonResponse({ error: 'Internal server error' }, { status: 500 });
  }
}
