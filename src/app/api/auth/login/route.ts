import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Fetch user from Convex
    let user;
    try {
      user = await convex.query(api.users.getUserByEmail, { email });
    } catch (convexError) {
      console.error('Convex query failed, checking for demo mode...');
      // Fallback for demo mode if Convex is not configured
      if (email === 'admin@healthnex.com' && password === 'admin123') {
        user = {
          _id: 'demo-user-id',
          email: 'admin@healthnex.com',
          name: 'Demo Admin',
          passwordHash: await bcrypt.hash('admin123', 10),
          role: 'admin',
          isActive: true
        };
      } else {
        throw convexError;
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    await convex.mutation(api.users.updateLastLogin, { userId: user._id });

    // Generate JWT token
    const token = JWTService.generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        location: 'Guwahati, Assam' // Default for now
      },
      token: token
    });

    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Lax is better for Oauth/Navigation
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}