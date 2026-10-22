import { NextRequest } from 'next/server';
import { privateJsonResponse } from '@/lib/apiResponse';

export async function POST(request: NextRequest) {
  try {
    const response = privateJsonResponse({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the auth token cookie
    response.cookies.set({
      name: 'auth-token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return privateJsonResponse(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}