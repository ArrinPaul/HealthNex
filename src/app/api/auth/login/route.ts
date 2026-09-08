import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(`login:${clientIp}`, 5, 60000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)),
          }
        }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Dummy bypass for test user
    let user;
    let isDummy = false;
    if (email.toLowerCase() === 'admin@test.com' && password === 'password') {
      user = {
        _id: 'dummy_admin_id_123',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        requestedRole: 'admin',
        verificationStatus: 'verified',
        onboardingCompleted: true,
      };
      isDummy = true;
    } else {
      // Password verification happens inside Convex
      user = await convex.action(api.users.verifyCredentials, { email, password });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = JWTService.generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    if (!isDummy) {
      await convex.mutation(api.users.updateLastLogin, { token });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        requestedRole: user.requestedRole,
        verificationStatus: user.verificationStatus || 'none',
        onboardingCompleted: user.onboardingCompleted || false,
      },
      token: token
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
