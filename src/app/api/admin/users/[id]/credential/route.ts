import { NextRequest } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../../../convex/_generated/api';
import { ROLES } from '../../../../../../../convex/roles';
import { privateJsonResponse } from '@/lib/apiResponse';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    const token = JWTService.extractTokenFromRequest(request);
    if (!token) {
      return privateJsonResponse({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const payload = JWTService.verifyToken(token);
    if (!payload || payload.role !== ROLES.ADMIN) {
      return privateJsonResponse(
        { error: 'Forbidden: Only administrators can retrieve verification documents' },
        { status: 403 }
      );
    }

    const result = await convex.query(api.users.getVerificationDocumentUrl, {
      token,
      targetUserId: targetUserId as any,
    });

    return privateJsonResponse({
      success: true,
      url: result?.url || null,
      fileName: result?.fileName || null,
      isLegacy: Boolean(result?.isLegacy),
    });
  } catch (error: any) {
    console.error('Failed to retrieve credential document URL:', error);
    return privateJsonResponse(
      { error: error.message || 'Failed to retrieve verification document' },
      { status: 500 }
    );
  }
}
