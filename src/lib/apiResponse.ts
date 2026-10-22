import { NextResponse } from 'next/server';

export const NO_STORE_CACHE_CONTROL = 'no-store, no-cache, must-revalidate, proxy-revalidate';

/**
 * Creates a NextResponse with Cache-Control and Pragma headers strictly configured
 * to prevent browsers, CDNs, and intermediate proxies from storing private or authenticated data.
 */
export function privateJsonResponse(
  data: any,
  init?: ResponseInit
): NextResponse {
  const response = NextResponse.json(data, init);
  response.headers.set('Cache-Control', NO_STORE_CACHE_CONTROL);
  response.headers.set('Pragma', 'no-cache');
  return response;
}
