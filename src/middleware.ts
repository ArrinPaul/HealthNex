import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTService } from '@/lib/jwt';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/health-data', '/community-reports', '/water-quality', '/settings', '/profile', '/alerts'];

// API routes that require authentication
const PROTECTED_API_PREFIX = '/api/';
const PUBLIC_API_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/health'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  // 1. Handle Protected Frontend Routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!token || !JWTService.verifyToken(token)) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // 2. Handle Protected API Routes
  if (pathname.startsWith(PROTECTED_API_PREFIX)) {
    if (!PUBLIC_API_ROUTES.some(route => pathname === route)) {
      if (!token || !JWTService.verifyToken(token)) {
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