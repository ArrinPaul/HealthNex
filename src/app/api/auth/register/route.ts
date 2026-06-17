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
    const { email, password, name, role = 'community-user', location, verificationDoc } = await request.json();

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
      // Auto-promote specific email to super-admin for initial setup
      const finalRole = email === 'admin@healthnex.com' ? 'super-admin' : role;
      
      userId = await convex.mutation(api.users.createUser, {
        email,
        name,
        passwordHash: hashedPassword,
        role: finalRole, // This is the requested role
        verificationDocUrl: verificationDoc,
      });
    } catch (dbError: any) {
      return NextResponse.json(
        { error: dbError.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // After creation, determine the actual role for the token
    const assignedRole = email === 'admin@healthnex.com' ? 'super-admin' : 'public'; 
    
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
        verificationStatus: (assignedRole === 'super-admin') ? 'verified' : (role === 'public' ? 'none' : 'pending')
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