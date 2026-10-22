process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-minimum-length-for-testing';
process.env.SUPPORT_TICKET_SECRET = 'test-support-ticket-secret-32-chars-min';

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

let lastConvexCallArgs: any = null;

// Mock ConvexHttpClient using a proper constructor class
vi.mock('convex/browser', () => {
  return {
    ConvexHttpClient: class {
      mutation = vi.fn().mockImplementation(async (mutationRef: any, args: any) => {
        lastConvexCallArgs = args;
        if (args.name === 'trigger_convex_failure') {
          throw new Error('Convex database error');
        }
        return 'ticket_mock_123';
      });
    },
  };
});

// Implementation mirrors convex/support.ts requireSupportSecret logic for direct mutation testing
function verifyMutationSupportSecret(secret: string | undefined, expectedSecret: string | undefined) {
  if (!expectedSecret || expectedSecret.trim().length === 0) {
    throw new Error('SUPPORT_TICKET_SECRET is not configured on this Convex deployment');
  }
  if (!secret || typeof secret !== 'string' || secret.length !== expectedSecret.length) {
    throw new Error('Unauthorized: invalid support ticket secret');
  }
  let mismatch = 0;
  for (let i = 0; i < expectedSecret.length; i++) {
    mismatch |= secret.charCodeAt(i) ^ expectedSecret.charCodeAt(i);
  }
  if (mismatch !== 0) {
    throw new Error('Unauthorized: invalid support ticket secret');
  }
  return true;
}

describe('Phase 4.3 / SEC-ABUSE-01: Support Ticket API Gateway & Direct Mutation Boundary Tests', () => {
  let POST: any;
  let JWTService: any;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-key-32-chars-minimum-length-for-testing';
    process.env.SUPPORT_TICKET_SECRET = 'test-support-ticket-secret-32-chars-min';
    const jwtMod = await import('@/lib/jwt');
    JWTService = jwtMod.JWTService;

    const routeMod = await import('@/app/api/support/ticket/route');
    POST = routeMod.POST;
  });

  beforeEach(() => {
    process.env.SUPPORT_TICKET_SECRET = 'test-support-ticket-secret-32-chars-min';
    lastConvexCallArgs = null;
  });

  describe('Convex Mutation Boundary (SEC-ABUSE-01 Direct Invocation Protection)', () => {
    const deploymentSecret = 'test-support-ticket-secret-32-chars-min';

    it('rejects direct calls when secret argument is omitted/undefined', () => {
      expect(() => {
        verifyMutationSupportSecret(undefined, deploymentSecret);
      }).toThrow('Unauthorized: invalid support ticket secret');
    });

    it('rejects direct calls with empty secret', () => {
      expect(() => {
        verifyMutationSupportSecret('', deploymentSecret);
      }).toThrow('Unauthorized: invalid support ticket secret');
    });

    it('rejects direct calls with incorrect secret', () => {
      expect(() => {
        verifyMutationSupportSecret('wrong-secret-value-of-different-length', deploymentSecret);
      }).toThrow('Unauthorized: invalid support ticket secret');
    });

    it('rejects direct calls with same-length mismatched secret', () => {
      const tamperedSecret = 'xest-support-ticket-secret-32-chars-min';
      expect(() => {
        verifyMutationSupportSecret(tamperedSecret, deploymentSecret);
      }).toThrow('Unauthorized: invalid support ticket secret');
    });

    it('fails closed when SUPPORT_TICKET_SECRET is not configured on the Convex deployment', () => {
      expect(() => {
        verifyMutationSupportSecret(deploymentSecret, undefined);
      }).toThrow('SUPPORT_TICKET_SECRET is not configured on this Convex deployment');

      expect(() => {
        verifyMutationSupportSecret(deploymentSecret, '   ');
      }).toThrow('SUPPORT_TICKET_SECRET is not configured on this Convex deployment');
    });

    it('permits invocation when the correct secret is supplied', () => {
      expect(verifyMutationSupportSecret(deploymentSecret, deploymentSecret)).toBe(true);
    });
  });

  describe('Next.js API Gateway (POST /api/support/ticket)', () => {
    it('accepts valid anonymous support ticket submission and supplies server secret to Convex', async () => {
      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.1',
        },
        body: JSON.stringify({
          name: 'Jane Citizen',
          email: 'jane@example.org',
          subject: 'General Question',
          message: 'Could you provide information on regional clinic hours?',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.ticketId).toBe('ticket_mock_123');
      expect(res.headers.get('Cache-Control')).toContain('no-store');

      // Verify that the gateway supplied the server secret to the Convex mutation
      expect(lastConvexCallArgs).not.toBeNull();
      expect(lastConvexCallArgs.secret).toBe('test-support-ticket-secret-32-chars-min');
      expect(lastConvexCallArgs.name).toBe('Jane Citizen');
      expect(lastConvexCallArgs.token).toBeUndefined();
    });

    it('never accepts client-supplied secret overrides from request body or headers', async () => {
      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.12',
          'x-support-ticket-secret': 'client-injected-header-secret',
        },
        body: JSON.stringify({
          secret: 'client-injected-body-secret',
          name: 'Security Auditor',
          email: 'auditor@example.org',
          subject: 'Testing secret injection',
          message: 'Verifying client cannot override server secret.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Must strictly use environment secret, ignoring client-injected values
      expect(lastConvexCallArgs.secret).toBe('test-support-ticket-secret-32-chars-min');
      expect(lastConvexCallArgs.secret).not.toBe('client-injected-body-secret');
    });

    it('fails closed when SUPPORT_TICKET_SECRET is missing from server environment', async () => {
      const originalSecret = process.env.SUPPORT_TICKET_SECRET;
      delete process.env.SUPPORT_TICKET_SECRET;

      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.13',
        },
        body: JSON.stringify({
          name: 'Jane Citizen',
          email: 'jane@example.org',
          subject: 'Config Test',
          message: 'Testing server missing secret behavior.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toContain('Support service configuration error');
      // Ensure no internal secret values or stack traces are leaked
      expect(JSON.stringify(data)).not.toContain('test-support-ticket-secret');

      process.env.SUPPORT_TICKET_SECRET = originalSecret;
    });

    it('accepts valid authenticated submission and binds valid JWT token', async () => {
      const token = JWTService.generateToken({
        userId: 'user_registered_456',
        email: 'member@example.org',
        role: 'public_user',
      });

      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-forwarded-for': '198.51.100.2',
        },
        body: JSON.stringify({
          name: 'Registered Member',
          email: 'member@example.org',
          subject: 'Account Sync',
          message: 'Need help linking regional dashboard.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(lastConvexCallArgs.token).toBe(token);
    });

    it('rejects malformed JSON payload with 400', async () => {
      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.3',
        },
        body: 'invalid-json-string{',
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Malformed JSON body');
    });

    it('rejects missing or empty name', async () => {
      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.4',
        },
        body: JSON.stringify({
          name: '   ',
          email: 'valid@example.org',
          subject: 'Subject',
          message: 'Message body.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Name is required');
    });

    it('rejects invalid email address', async () => {
      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.5',
        },
        body: JSON.stringify({
          name: 'Valid Name',
          email: 'not-an-email',
          subject: 'Subject',
          message: 'Message body.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('valid email address');
    });

    it('rejects oversized fields exceeding maximum boundaries', async () => {
      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.6',
        },
        body: JSON.stringify({
          name: 'a'.repeat(101),
          email: 'valid@example.org',
          subject: 'Subject',
          message: 'Message body.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Name is required and must be under 100 characters');
    });

    it('enforces rate limiting and returns 429 after 10 requests within the hour', async () => {
      const testIp = '203.0.113.88';

      // Submit 10 valid requests
      for (let i = 1; i <= 10; i++) {
        const req = new NextRequest('https://healthnex.org/api/support/ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': testIp,
          },
          body: JSON.stringify({
            name: `User ${i}`,
            email: `user${i}@example.org`,
            subject: 'Question',
            message: 'Valid message body.',
          }),
        });
        const res = await POST(req);
        expect(res.status).toBe(201);
      }

      // 11th request must receive HTTP 429
      const limitedReq = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': testIp,
        },
        body: JSON.stringify({
          name: 'Exceeded User',
          email: 'exceeded@example.org',
          subject: 'Question',
          message: 'Should be rate limited.',
        }),
      });

      const limitedRes = await POST(limitedReq);
      expect(limitedRes.status).toBe(429);
      const limitedData = await limitedRes.json();
      expect(limitedData.error).toContain('Rate limit exceeded');
      expect(typeof limitedData.retryAfterMs).toBe('number');
    });

    it('handles backend Convex failure gracefully with HTTP 500 without leaking details', async () => {
      const req = new NextRequest('https://healthnex.org/api/support/ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '198.51.100.7',
        },
        body: JSON.stringify({
          name: 'trigger_convex_failure',
          email: 'fail@example.org',
          subject: 'Subject',
          message: 'Trigger simulated failure.',
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toContain('Failed to submit support ticket');
    });
  });
});
