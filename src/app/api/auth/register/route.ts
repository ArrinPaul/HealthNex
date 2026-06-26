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
    const { email, password, name, location, verificationDoc } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to Convex
    let userId;
    try {
      // All new registrations start as community-user
      const finalRole = 'community-user';
      
      userId = await convex.mutation(api.users.createUser, {
        email,
        name,
        passwordHash: hashedPassword,
        role: finalRole,
        verificationDocUrl: verificationDoc,
      });
    } catch (dbError: any) {
      return NextResponse.json(
        { error: dbError.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // After creation, determine the actual role for the token
    // If they requested community-user, they get it immediately.
    // Otherwise, they stay as 'public' until verified.
    const assignedRole = 'community-user'; 
    
    // Generate JWT token with the actual assigned role
    const token = JWTService.generateToken({
      userId,
      email,
      role: assignedRole
    });

    const response = NextResponse.json({
      success: true,
      user: { 
        id: userId, 
        email, 
        name, 
        role: assignedRole,
        location: location || 'Unknown',
        verificationStatus: (assignedRole === 'super-admin') ? 'verified' : 
                            (assignedRole === 'community-user' ? 'none' : 'pending')
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}