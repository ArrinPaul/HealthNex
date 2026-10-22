import { NextRequest } from 'next/server';
import { JWTService } from '@/lib/jwt';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { privateJsonResponse } from '@/lib/apiResponse';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce rate limiting: 10 accepted tickets per client IP per hour (3,600,000 ms)
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`support-ticket:${clientIp}`, 10, 3600000);
    if (!rateLimit.allowed) {
      return privateJsonResponse(
        {
          error: 'Rate limit exceeded: Too many support ticket submissions. Please try again later.',
          retryAfterMs: rateLimit.retryAfterMs,
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate JSON payload safely
    let body: any;
    try {
      body = await request.json();
    } catch {
      return privateJsonResponse(
        { error: 'Invalid payload: Malformed JSON body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return privateJsonResponse(
        { error: 'Invalid payload: Request body must be an object' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = body;

    // 3. Server-side validation of string lengths and email format
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 100) {
      return privateJsonResponse(
        { error: 'Validation error: Name is required and must be under 100 characters' },
        { status: 400 }
      );
    }

    if (
      typeof email !== 'string' ||
      !email.trim() ||
      email.trim().length > 255 ||
      !EMAIL_REGEX.test(email.trim())
    ) {
      return privateJsonResponse(
        { error: 'Validation error: A valid email address under 255 characters is required' },
        { status: 400 }
      );
    }

    if (typeof subject !== 'string' || !subject.trim() || subject.trim().length > 200) {
      return privateJsonResponse(
        { error: 'Validation error: Subject is required and must be under 200 characters' },
        { status: 400 }
      );
    }

    if (typeof message !== 'string' || !message.trim() || message.trim().length > 5000) {
      return privateJsonResponse(
        { error: 'Validation error: Message is required and must be under 5000 characters' },
        { status: 400 }
      );
    }

    // 4. Resolve authenticated identity securely on server-side only
    let authToken: string | undefined = undefined;
    const extractedToken = JWTService.extractTokenFromRequest(request);
    if (extractedToken) {
      const verified = JWTService.verifyToken(extractedToken);
      if (verified?.userId) {
        authToken = extractedToken;
      }
    }

    // 5. Verify server secret configuration and fail closed if missing
    const supportSecret = process.env.SUPPORT_TICKET_SECRET;
    if (!supportSecret || supportSecret.trim().length === 0) {
      console.error('SUPPORT_TICKET_SECRET is not configured on this server; refusing ticket submission');
      return privateJsonResponse(
        { error: 'Support service configuration error: Unable to process support ticket at this time.' },
        { status: 500 }
      );
    }

    // 6. Invoke Convex support mutation with server secret
    const ticketId = await convex.mutation(api.support.sendTicket, {
      secret: supportSecret,
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      token: authToken,
    });

    return privateJsonResponse(
      {
        success: true,
        message: 'Support ticket submitted successfully',
        ticketId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Support ticket submission error:', error?.message || error);
    return privateJsonResponse(
      { error: 'Failed to submit support ticket. Please try again later.' },
      { status: 500 }
    );
  }
}
