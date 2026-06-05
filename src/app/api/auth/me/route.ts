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

    // Optionally fetch full user profile from database to ensure it's still active
    let user;
    if (payload.userId === 'demo-user-id') {
      user = {
        _id: 'demo-user-id',
        email: payload.email,
        name: 'Demo Admin',
        role: payload.role,
        isActive: true
      };
    } else {
      user = await convex.query(api.users.getUser, { userId: payload.userId as any });
    }

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
        location: 'Guwahati, Assam' // Placeholder or fetch from profile if stored
      },
      token: token
    });

  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
