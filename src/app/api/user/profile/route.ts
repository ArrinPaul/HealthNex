import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { validatePassword } from '@/lib/passwordValidation';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { privateJsonResponse } from '@/lib/apiResponse';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function PATCH(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`profile-update:${clientIp}`, 10, 60000);
    if (!rateLimit.allowed) {
      return privateJsonResponse({ error: 'Too many profile update requests. Please wait a moment.' }, { status: 429 });
    }

    const token = JWTService.extractTokenFromRequest(request);
    if (!token) {
      return privateJsonResponse({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const payload = JWTService.verifyToken(token);
    if (!payload) {
      return privateJsonResponse({ error: 'Invalid or expired session token.' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return privateJsonResponse({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const { name, location, newPassword } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return privateJsonResponse({ error: 'Full name cannot be empty.' }, { status: 400 });
      }
      if (name.trim().length > 100) {
        return privateJsonResponse({ error: 'Full name must be under 100 characters.' }, { status: 400 });
      }
    }

    // Validate location if provided
    if (location !== undefined) {
      if (typeof location !== 'string') {
        return privateJsonResponse({ error: 'Location must be a string.' }, { status: 400 });
      }
      if (location.trim().length > 200) {
        return privateJsonResponse({ error: 'Location must be under 200 characters.' }, { status: 400 });
      }
    }

    let newPasswordHash: string | undefined = undefined;
    if (newPassword !== undefined) {
      if (typeof newPassword !== 'string' || !newPassword) {
        return privateJsonResponse({ error: 'Invalid password format.' }, { status: 400 });
      }
      const { isValid, requirements } = validatePassword(newPassword);
      if (!isValid) {
        const unmet = requirements.filter(r => !r.met).map(r => r.label);
        return privateJsonResponse({ error: unmet[0] || 'Password does not meet complexity requirements.' }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(12);
      newPasswordHash = await bcrypt.hash(newPassword, salt);
    }

    // Call Convex mutation with verified auth token
    await convex.mutation(api.users.updateProfile, {
      token,
      name: name !== undefined ? name.trim() : undefined,
      locationAddress: location !== undefined ? location.trim() : undefined,
      newPasswordHash,
    });

    return privateJsonResponse({
      success: true,
      message: 'Profile updated successfully.'
    });

  } catch (error: any) {
    console.error('Profile update failed:', error);
    return privateJsonResponse(
      { error: error.message || 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
