import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/health-data', '/community-reports', '/water-quality', '/settings', '/profile', '/alerts'];

// API routes that require authentication
const PROTECTED_API_PREFIX = '/api/';
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/health'];

const JWT_SECRET =
  process.env.JWT_SECRET || 'fallback-dev-secret-key-change-in-production-minimum-32-chars';

function base64UrlDecodeToString(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const decoded = base64UrlDecodeToString(value);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const [headerPart, payloadPart, signaturePart] = token.split('.');
    if (!headerPart || !payloadPart || !signaturePart) return false;

    const header = JSON.parse(base64UrlDecodeToString(headerPart)) as {
      alg?: string;
      typ?: string;
    };

    if (header.alg !== 'HS256') return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${headerPart}.${payloadPart}`);
    const signature = base64UrlDecodeToBytes(signaturePart);
    const dataBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    const signatureBuffer = signature.buffer.slice(
      signature.byteOffset,
      signature.byteOffset + signature.byteLength
    );
    const isValidSignature = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer as BufferSource,
      dataBuffer as BufferSource
    );
    if (!isValidSignature) return false;

    const payload = JSON.parse(base64UrlDecodeToString(payloadPart)) as { exp?: number };
    if (payload.exp && Date.now() >= payload.exp * 1000) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // CSRF Protection: Verify Origin/Referer for state-changing API requests
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host');
    
    // Allow if origin matches host (same-origin)
    // In production, you might need to check against a whitelist of allowed domains
    if (origin) {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
      }
    } else if (referer) {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
      }
    }
  }

  // 0. Development Bypass: Allow access in dev mode if database is not configured
  const isDev = process.env.NODE_ENV === 'development';
  const hasConvex = !!process.env.NEXT_PUBLIC_CONVEX_URL;
  if (isDev && !hasConvex) {
    return NextResponse.next();
  }

  // 1. Handle Protected Frontend Routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const isValidToken = token ? await verifyToken(token) : false;
    if (!isValidToken) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 2. Handle Protected API Routes
  if (pathname.startsWith(PROTECTED_API_PREFIX)) {
    if (!PUBLIC_API_ROUTES.some(route => pathname === route)) {
      const isValidToken = token ? await verifyToken(token) : false;
      if (!isValidToken) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - locales (translation files)
     */
    '/((?!_next/static|_next/image|favicon.ico|locales).*)',
  ],
};