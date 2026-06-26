import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, getClientIp } from './rateLimit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Reset by using a unique key each test
  });

  it('allows first request', () => {
    const result = checkRateLimit('test-unique-1', 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('tracks request count correctly', () => {
    const key = 'test-count-tracking';
    checkRateLimit(key, 5, 60000);
    checkRateLimit(key, 5, 60000);
    const result = checkRateLimit(key, 5, 60000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('blocks after max requests', () => {
    const key = 'test-block-max';
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key, 5, 60000);
    }
    const result = checkRateLimit(key, 5, 60000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('uses different keys independently', () => {
    const key1 = 'test-independent-a';
    const key2 = 'test-independent-b';
    for (let i = 0; i < 5; i++) {
      checkRateLimit(key1, 5, 60000);
    }
    const result1 = checkRateLimit(key1, 5, 60000);
    const result2 = checkRateLimit(key2, 5, 60000);
    expect(result1.allowed).toBe(false);
    expect(result2.allowed).toBe(true);
  });

  it('resets after window expires', async () => {
    const key = 'test-reset-window';
    checkRateLimit(key, 2, 100);
    checkRateLimit(key, 2, 100);
    const blocked = checkRateLimit(key, 2, 100);
    expect(blocked.allowed).toBe(false);

    await new Promise(resolve => setTimeout(resolve, 150));
    const afterReset = checkRateLimit(key, 2, 100);
    expect(afterReset.allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('returns x-forwarded-for header value', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }
    });
    expect(getClientIp(request)).toBe('1.2.3.4');
  });

  it('returns x-real-ip header value', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '9.8.7.6' }
    });
    expect(getClientIp(request)).toBe('9.8.7.6');
  });

  it('returns 127.0.0.1 as fallback', () => {
    const request = new Request('http://localhost');
    expect(getClientIp(request)).toBe('127.0.0.1');
  });
});
