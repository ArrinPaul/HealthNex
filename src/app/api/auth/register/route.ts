import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { ROLES } from '../../../../../convex/roles';

const REQUESTABLE_ROLES = [ROLES.PUBLIC_USER, ROLES.HEALTH_WORKER];

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(`register:${clientIp}`, 3, 60000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
          }
        }
      );
    }

    const { email, password, name, role, location, verificationDoc } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const requestedRole = REQUESTABLE_ROLES.includes(role) ? role : ROLES.PUBLIC_USER;

    let userId;
    try {
      userId = await convex.mutation(api.users.createUser, {
        email,
        name,
        passwordHash: hashedPassword,
        role: requestedRole,
        verificationDocUrl: verificationDoc,
      });
    } catch (dbError: any) {
      return NextResponse.json(
        { error: dbError.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // The account's actual role always starts at public-user — a health-worker
    // request only takes effect once an admin approves it (see users.verifyUser).
    const assignedRole = ROLES.PUBLIC_USER;

    const token = JWTService.generateToken({
      userId,
      email,
      role: assignedRole
    });

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        name,
        role: assignedRole,
        requestedRole,
        location: location || 'Unknown',
        verificationStatus: requestedRole === ROLES.HEALTH_WORKER ? 'pending' : 'none',
        onboardingCompleted: false,
      }
    });

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
