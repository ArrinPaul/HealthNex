import { describe, it, expect, vi, beforeEach } from 'vitest';

process.env.JWT_SECRET = 'test-secret-key-for-jwt-service-testing-32ch';

const jwt = await import('jsonwebtoken');

describe('JWTService', () => {
  let JWTService: any;

  beforeEach(async () => {
    const mod = await import('./jwt');
    JWTService = mod.JWTService;
  });

  describe('generateToken', () => {
    it('returns a string token', () => {
      const token = JWTService.generateToken({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin'
      });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('encodes userId and email in payload', () => {
      const token = JWTService.generateToken({
        userId: 'user-456',
        email: 'admin@test.com',
        role: 'health-worker'
      });
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe('user-456');
      expect(decoded.email).toBe('admin@test.com');
      expect(decoded.role).toBe('health-worker');
    });
  });

  describe('verifyToken', () => {
    it('returns decoded payload for valid token', () => {
      const payload = { userId: 'u1', email: 'a@b.com', role: 'admin' };
      const token = JWTService.generateToken(payload);
      const decoded = JWTService.verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe('u1');
      expect(decoded?.email).toBe('a@b.com');
    });

    it('returns null for invalid token', () => {
      const result = JWTService.verifyToken('invalid.token.here');
      expect(result).toBeNull();
    });

    it('returns null for token signed with wrong secret', () => {
      const wrongToken = jwt.default.sign(
        { userId: 'x', email: 'x@x.com' },
        'completely-different-secret-32-chars-long!!',
        { expiresIn: '1h' }
      );
      const result = JWTService.verifyToken(wrongToken);
      expect(result).toBeNull();
    });

    it('returns null for expired token', () => {
      const expiredToken = jwt.default.sign(
        { userId: 'u1', email: 'a@b.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '0s' }
      );
      const result = JWTService.verifyToken(expiredToken);
      expect(result).toBeNull();
    });
  });
});
