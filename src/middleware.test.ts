import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

process.env.JWT_SECRET = 'test-jwt-secret-key-for-middleware-tests-min32chars';

const { middleware } = await import('./middleware');
const { JWTService } = await import('./lib/jwt');

describe('Middleware Route Protection & Access Control (ROUTE-01, ROUTE-02)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test-jwt-secret-key-for-middleware-tests-min32chars' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createRequest = (path: string, token?: string) => {
    const url = `http://localhost:3000${path}`;
    const headers = new Headers();
    if (token) {
      headers.set('cookie', `auth-token=${token}`);
    }
    return new NextRequest(url, { headers });
  };

  describe('Public Informational Pages (ROUTE-01)', () => {
    const publicPages = [
      '/',
      '/surveillance',
      '/neural-engine',
      '/documentation',
      '/privacy',
      '/privacy-code',
      '/mission-state',
      '/organization',
      '/help',
    ];

    publicPages.forEach((path) => {
      it(`allows unauthenticated access to ${path} without redirect`, async () => {
        const req = createRequest(path);
        const res = await middleware(req);

        // Should NOT redirect to /login
        expect(res.status).toBe(200);
        expect(res.headers.get('location')).toBeNull();
      });
    });
  });

  describe('Protected Application Pages (ROUTE-02)', () => {
    const protectedPages = [
      '/dashboard',
      '/profile',
      '/settings',
      '/admin',
      '/admin/audit-logs',
      '/user-management',
      '/community-reports',
      '/health-data',
      '/water-quality',
      '/ai-features',
      '/vault',
      '/resources',
    ];

    protectedPages.forEach((path) => {
      it(`redirects unauthenticated visitor from ${path} to /login with callbackUrl`, async () => {
        const req = createRequest(path);
        const res = await middleware(req);

        expect(res.status).toBe(307); // Next.js NextResponse.redirect default status
        const location = res.headers.get('location');
        expect(location).toContain('/login');
        expect(location).toContain(`callbackUrl=${encodeURIComponent(path)}`);
      });

      it(`redirects visitor with invalid/expired token from ${path} to /login`, async () => {
        const req = createRequest(path, 'invalid.jwt.token');
        const res = await middleware(req);

        expect(res.status).toBe(307);
        const location = res.headers.get('location');
        expect(location).toContain('/login');
      });

      it(`allows visitor with valid JWT token to access ${path}`, async () => {
        const validToken = JWTService.generateToken({
          userId: 'user-123',
          email: 'user@example.com',
          role: 'admin',
        });

        const req = createRequest(path, validToken);
        const res = await middleware(req);

        expect(res.status).toBe(200);
        expect(res.headers.get('location')).toBeNull();
      });
    });
  });
});
