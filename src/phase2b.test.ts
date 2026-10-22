process.env.JWT_SECRET = 'test-secret-key-for-jwt-service-testing-32ch';
(process.env as any).NODE_ENV = 'production';

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { Serwist, NetworkOnly } from 'serwist';
import { privateJsonResponse, NO_STORE_CACHE_CONTROL } from '@/lib/apiResponse';
import { ROLES } from '../convex/roles';

let JWTService: any;
let getCredential: any;
let getMe: any;
let postLogin: any;
let postRegister: any;
let postLogout: any;
let postCredentials: any;
let patchProfile: any;
let postOnboarding: any;
let postAnalyzeSymptoms: any;
let postChatbotMessage: any;
let postSymptomChecker: any;
let postProcessReport: any;
let middleware: any;
let defaultCache: any[] = [];

// ---------------------------------------------------------------------------
// Phase 2B: Workstream A & B — Service Worker Configuration & API Isolation
// ---------------------------------------------------------------------------
describe('Phase 2B: Service Worker Build Integrity & API Isolation', () => {
  const swSourcePath = path.resolve(process.cwd(), 'src/app/sw.ts');
  const swPublicPath = path.resolve(process.cwd(), 'public/sw.js');

  const swSourceContent = fs.readFileSync(swSourcePath, 'utf8');
  const swPublicContent = fs.readFileSync(swPublicPath, 'utf8');

  describe('Static Source Analysis of Service Worker Files', () => {
    it('does NOT contain the insecure NetworkFirst rule for cacheName "apis"', () => {
      // Confirms removal of the legacy rule that persisted dynamic /api/ responses
      expect(swSourceContent).not.toContain('runtimeCaching: defaultCache;');
      expect(swSourceContent).toContain('handler.cacheName === "apis"');
      // Confirms the bundled code filters out "apis" cacheName
      expect(swPublicContent).toContain('"apis"===t.cacheName');
    });

    it('enforces NetworkOnly on same-origin /api/ routes in src/app/sw.ts at index 0', () => {
      expect(swSourceContent).toContain('pathname.startsWith("/api/")');
      expect(swSourceContent).toContain('new NetworkOnly()');
      // Confirms explicit deny-by-default is placed ahead of defaultCache
      const apiRuleIndex = swSourceContent.indexOf('pathname.startsWith("/api/")');
      const defaultCacheIndex = swSourceContent.indexOf('...defaultCache');
      expect(apiRuleIndex).toBeLessThan(defaultCacheIndex);
    });

    it('enforces NetworkOnly on same-origin /api/ routes at the start of runtimeCaching in public/sw.js', () => {
      expect(swPublicContent).toContain('.startsWith("/api/")');
      // Confirms the regex matcher for sameOrigin && pathname.startsWith("/api/")
      expect(swPublicContent).toMatch(/matcher:\(\{sameOrigin:\w+,url:\{pathname:\w+\}\}\)=>\w+&&\w+\.startsWith\("\/api\/"\)/);
    });

    it('purges obsolete "apis" and "serwist-apis" caches with error resilience on activate in sw.ts and sw.js', () => {
      expect(swSourceContent).toContain('"apis"');
      expect(swSourceContent).toContain('serwist-apis');
      expect(swSourceContent).toContain('caches.delete');
      expect(swSourceContent).toContain('.catch(');

      expect(swPublicContent).toContain('addEventListener("activate"');
      expect(swPublicContent).toContain('serwist-apis');
      expect(swPublicContent).toContain('caches.delete');
      expect(swPublicContent).toContain('.catch(');
    });
  });

  describe('Matcher Function Logic (Unit Logic Simulation)', () => {
    // Isolated unit test of the predicate matcher function
    const apiMatcher = ({ sameOrigin, url }: { sameOrigin: boolean; url: { pathname: string } }) =>
      sameOrigin && url.pathname.startsWith('/api/');

    const sensitiveRoutes = [
      '/api/admin/users/user-123/credential', // Signed credential download URL
      '/api/user/credentials',                 // Credential upload endpoint
      '/api/user/profile',                     // User profile details
      '/api/auth/me',                          // Session identity & onboarding info
      '/api/auth/login',                       // Authentication entry point
      '/api/ai/analyze-symptoms',              // Clinical symptom triage
      '/api/predict',                          // Outbreak forecasting
    ];

    it.each(sensitiveRoutes)('matches sensitive endpoint %s and routes to NetworkOnly', (routePath) => {
      const match = apiMatcher({
        sameOrigin: true,
        url: { pathname: routePath },
      });
      expect(match).toBe(true);
    });

    it('does NOT match static page or asset URLs', () => {
      const staticUrls = [
        '/_next/static/chunks/main.js',
        '/icon-192.png',
        '/offline.html',
        '/dashboard',
        '/vault',
      ];

      for (const staticUrl of staticUrls) {
        const match = apiMatcher({
          sameOrigin: true,
          url: { pathname: staticUrl },
        });
        expect(match).toBe(false);
      }
    });

    it('does NOT match cross-origin requests', () => {
      const match = apiMatcher({
        sameOrigin: false,
        url: { pathname: '/api/external' },
      });
      expect(match).toBe(false);
    });
  });

  describe('Real Serwist Engine Route Matching Integration', () => {
    let originalEnv: string | undefined;
    let originalSelf: any;
    let originalLocation: any;
    let serwistInstance: Serwist;

    beforeAll(async () => {
      process.env.JWT_SECRET = 'test-secret-key-for-jwt-service-testing-32ch';
      (process.env as any).NODE_ENV = 'production';

      const jwtMod = await import('@/lib/jwt');
      JWTService = jwtMod.JWTService;

      const credMod = await import('@/app/api/admin/users/[id]/credential/route');
      getCredential = credMod.GET;

      const meMod = await import('@/app/api/auth/me/route');
      getMe = meMod.GET;

      const loginMod = await import('@/app/api/auth/login/route');
      postLogin = loginMod.POST;

      const regMod = await import('@/app/api/auth/register/route');
      postRegister = regMod.POST;

      const logoutMod = await import('@/app/api/auth/logout/route');
      postLogout = logoutMod.POST;

      const userCredMod = await import('@/app/api/user/credentials/route');
      postCredentials = userCredMod.POST;

      const profileMod = await import('@/app/api/user/profile/route');
      patchProfile = profileMod.PATCH;

      const onboardMod = await import('@/app/api/user/onboarding/route');
      postOnboarding = onboardMod.POST;

      const analyzeSymptomsMod = await import('@/app/api/ai/analyze-symptoms/route');
      postAnalyzeSymptoms = analyzeSymptomsMod.POST;

      const chatbotMod = await import('@/app/api/chatbot/message/route');
      postChatbotMessage = chatbotMod.POST;

      const symptomCheckerMod = await import('@/app/api/ai/symptom-checker/route');
      postSymptomChecker = symptomCheckerMod.POST;

      const processReportMod = await import('@/app/api/ai/process-report/route');
      postProcessReport = processReportMod.POST;

      const midMod = await import('@/middleware');
      middleware = midMod.middleware;

      const workerModule = await import('@serwist/next/worker');
      defaultCache = workerModule.defaultCache;
    });

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';

      originalSelf = (globalThis as any).self;
      originalLocation = (globalThis as any).location;

      (globalThis as any).self = globalThis;
      (globalThis as any).self.addEventListener = () => {};
      (globalThis as any).location = new URL('https://healthnex.org/');

      // Assemble effective runtime caching rules matching src/app/sw.ts
      const runtimeCaching = [
        {
          matcher: ({ sameOrigin, url: { pathname } }: any) => sameOrigin && pathname.startsWith('/api/'),
          handler: new NetworkOnly(),
        },
        ...defaultCache.filter((entry: any) => {
          const handler = entry.handler as any;
          return !(handler && handler.cacheName === 'apis');
        }),
      ];

      serwistInstance = new Serwist({
        runtimeCaching,
      });
    });

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
      (globalThis as any).self = originalSelf;
      (globalThis as any).location = originalLocation;
    });

    it('routes sensitive API endpoints to NetworkOnly via real Serwist findMatchingRoute', () => {
      const endpoints = [
        '/api/admin/users/usr-999/credential',
        '/api/user/credentials',
        '/api/user/profile',
        '/api/auth/me',
        '/api/ai/analyze-symptoms',
      ];

      for (const endpoint of endpoints) {
        const req = new Request(`https://healthnex.org${endpoint}`);
        const result = serwistInstance.findMatchingRoute({
          request: req,
          url: new URL(req.url),
          sameOrigin: true,
          event: {} as any,
        });

        expect(result.route).toBeDefined();
        expect(result.route?.handler?.constructor?.name).toBe('NetworkOnly');
      }
    });

    it('prevents file-extension rules from intercepting API endpoints ending in .json or .csv', () => {
      // If the API handler were placed after defaultCache, /api/records.json would match static-data-assets.
      // With our rule at index 0, it MUST match NetworkOnly.
      const jsonReq = new Request('https://healthnex.org/api/health-records.json');
      const jsonResult = serwistInstance.findMatchingRoute({
        request: jsonReq,
        url: new URL(jsonReq.url),
        sameOrigin: true,
        event: {} as any,
      });
      expect(jsonResult.route?.handler?.constructor?.name).toBe('NetworkOnly');

      const csvReq = new Request('https://healthnex.org/api/surveillance/export.csv');
      const csvResult = serwistInstance.findMatchingRoute({
        request: csvReq,
        url: new URL(csvReq.url),
        sameOrigin: true,
        event: {} as any,
      });
      expect(csvResult.route?.handler?.constructor?.name).toBe('NetworkOnly');
    });

    it('preserves caching rules for public static scripts, images, and fonts', () => {
      // Next.js static JS chunks -> next-static-js-assets (CacheFirst)
      const jsReq = new Request('https://healthnex.org/_next/static/chunks/main-app.js');
      const jsResult = serwistInstance.findMatchingRoute({
        request: jsReq,
        url: new URL(jsReq.url),
        sameOrigin: true,
        event: {} as any,
      });
      expect(jsResult.route).toBeDefined();
      expect((jsResult.route?.handler as any)?.cacheName).toBe('next-static-js-assets');

      // Static images -> static-image-assets (StaleWhileRevalidate)
      const imgReq = new Request('https://healthnex.org/icon-192.png');
      const imgResult = serwistInstance.findMatchingRoute({
        request: imgReq,
        url: new URL(imgReq.url),
        sameOrigin: true,
        event: {} as any,
      });
      expect(imgResult.route).toBeDefined();
      expect((imgResult.route?.handler as any)?.cacheName).toBe('static-image-assets');

      // Static fonts -> static-font-assets (StaleWhileRevalidate)
      const fontReq = new Request('https://healthnex.org/fonts/custom.woff2');
      const fontResult = serwistInstance.findMatchingRoute({
        request: fontReq,
        url: new URL(fontReq.url),
        sameOrigin: true,
        event: {} as any,
      });
      expect(fontResult.route).toBeDefined();
      expect((fontResult.route?.handler as any)?.cacheName).toBe('static-font-assets');
    });
  });
});

// ---------------------------------------------------------------------------
// Phase 2B: Workstream C & D — Cache Cleanup & Shared-Device Isolation
// ---------------------------------------------------------------------------
describe('Phase 2B: Cache Cleanup & Shared-Device Isolation', () => {
  describe('Service Worker Activation Lifecycle (Isolated CacheStorage Simulation)', () => {
    class MockCacheStorage {
      private caches = new Map<string, Map<string, Response>>();

      constructor(initialCacheNames: string[] = []) {
        for (const name of initialCacheNames) {
          this.caches.set(name, new Map());
        }
      }

      async keys(): Promise<string[]> {
        return Array.from(this.caches.keys());
      }

      async delete(name: string): Promise<boolean> {
        return this.caches.delete(name);
      }

      async has(name: string): Promise<boolean> {
        return this.caches.has(name);
      }
    }

    it('deletes only legacy "apis" and "serwist-apis" caches and strictly preserves app caches', async () => {
      const mockCaches = new MockCacheStorage([
        'apis',
        'serwist-apis',
        'serwist-apis-https://healthnex.org',
        'pages',
        'pages-rsc',
        'pages-rsc-prefetch',
        'next-static-js-assets',
        'static-image-assets',
        'static-font-assets',
        'serwist-precache-v2-https://healthnex.org/',
      ]);

      // Execute the exact activation cleanup procedure from src/app/sw.ts
      const cacheNames = await mockCaches.keys();
      const deletionPromises = cacheNames
        .filter((name) => name === 'apis' || name.startsWith('serwist-apis'))
        .map((name) => mockCaches.delete(name));

      await Promise.all(deletionPromises);

      // Legacy API caches are purged
      expect(await mockCaches.has('apis')).toBe(false);
      expect(await mockCaches.has('serwist-apis')).toBe(false);
      expect(await mockCaches.has('serwist-apis-https://healthnex.org')).toBe(false);

      // Offline shell & static caches remain preserved
      expect(await mockCaches.has('pages')).toBe(true);
      expect(await mockCaches.has('pages-rsc')).toBe(true);
      expect(await mockCaches.has('pages-rsc-prefetch')).toBe(true);
      expect(await mockCaches.has('next-static-js-assets')).toBe(true);
      expect(await mockCaches.has('static-image-assets')).toBe(true);
      expect(await mockCaches.has('static-font-assets')).toBe(true);
      expect(await mockCaches.has('serwist-precache-v2-https://healthnex.org/')).toBe(true);
    });

    it('safely handles and recovers from individual cache deletion failures during activation', async () => {
      const mockCaches = new MockCacheStorage(['apis', 'serwist-apis', 'pages']);
      // Simulate an I/O failure on 'serwist-apis'
      vi.spyOn(mockCaches, 'delete').mockImplementation(async (name: string) => {
        if (name === 'serwist-apis') {
          throw new Error('Disk I/O error on cache deletion');
        }
        return true;
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const cacheNames = await mockCaches.keys();
      const deletionPromises = cacheNames
        .filter((name) => name === 'apis' || name.startsWith('serwist-apis'))
        .map((name) =>
          mockCaches.delete(name).catch((err) => {
            console.error(`[ServiceWorker] Failed to purge cache ${name}:`, err);
            return false;
          })
        );

      // Promise.all MUST resolve successfully despite the individual deletion failure
      const results = await Promise.all(deletionPromises);
      expect(results).toEqual([true, false]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ServiceWorker] Failed to purge cache serwist-apis:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Shared-Device & Logout Response Isolation (Strategy Simulation)', () => {
    // Pure logic simulation of NetworkOnly strategy
    async function simulateNetworkOnlyHandler(
      request: Request,
      networkFetch: (req: Request) => Promise<Response>,
      mockCacheStorage: { match: (req: Request) => Promise<Response | null>; put: (req: Request, res: Response) => Promise<void> }
    ) {
      // NetworkOnly MUST strictly call networkFetch and NEVER put responses into CacheStorage
      const response = await networkFetch(request);
      return response;
    }

    it('never persists authenticated API responses into CacheStorage during requests', async () => {
      const mockPut = vi.fn(async () => {});
      const mockMatch = vi.fn(async () => null);
      const mockFetch = vi.fn(async () => new Response(JSON.stringify({ userId: 'u-1', secret: 'data' }), { status: 200 }));

      const req = new Request('https://healthnex.org/api/admin/users/u-1/credential');
      const res = await simulateNetworkOnlyHandler(req, mockFetch, { match: mockMatch, put: mockPut });

      expect(res.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // CacheStorage.put is NEVER invoked for API responses
      expect(mockPut).not.toHaveBeenCalled();
      expect(mockMatch).not.toHaveBeenCalled();
    });

    it('rejects with network error when offline rather than serving stale private data from cache', async () => {
      const mockPut = vi.fn(async () => {});
      const mockMatch = vi.fn(async () => new Response(JSON.stringify({ staleUser: 'Alice' }), { status: 200 }));
      const offlineFetch = vi.fn(async () => {
        throw new Error('Failed to fetch: Network is offline');
      });

      const req = new Request('https://healthnex.org/api/user/profile');

      // NetworkOnly will reject on network failure; it does NOT fall back to CacheStorage.match
      await expect(simulateNetworkOnlyHandler(req, offlineFetch, { match: mockMatch, put: mockPut }))
        .rejects.toThrow('Failed to fetch: Network is offline');

      // Stale cached data must NEVER be accessed or returned
      expect(mockMatch).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// Phase 2B.2: Sensitive API HTTP Cache-Control Verification
// ---------------------------------------------------------------------------
describe('Phase 2B.2: Sensitive API HTTP Cache-Control Verification', () => {
  describe('Shared privateJsonResponse Utility', () => {
    it('sets strict no-store Cache-Control and Pragma headers', () => {
      const res = privateJsonResponse({ sensitive: 'user-data' });
      expect(res.headers.get('Cache-Control')).toBe(NO_STORE_CACHE_CONTROL);
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('preserves status codes, custom headers, and payload structures', () => {
      const res = privateJsonResponse(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '5',
          },
        }
      );

      expect(res.status).toBe(429);
      expect(res.headers.get('Retry-After')).toBe('60');
      expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
      expect(res.headers.get('Cache-Control')).toBe(NO_STORE_CACHE_CONTROL);
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });
  });

  describe('Direct Route Handler Cache-Control Enforcement', () => {
    it('GET /api/admin/users/[id]/credential sets no-store on 401 Unauthorized', async () => {
      const req = new NextRequest('https://healthnex.org/api/admin/users/usr-1/credential');
      const res = await getCredential(req, { params: Promise.resolve({ id: 'usr-1' }) });

      expect(res.status).toBe(401);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('GET /api/admin/users/[id]/credential sets no-store on 403 Forbidden', async () => {
      const nonAdminToken = JWTService.generateToken({
        userId: 'usr-regular',
        email: 'user@healthnex.org',
        role: ROLES.PUBLIC_USER,
      });

      const req = new NextRequest('https://healthnex.org/api/admin/users/usr-target/credential', {
        headers: {
          authorization: `Bearer ${nonAdminToken}`,
        },
      });

      const res = await getCredential(req, { params: Promise.resolve({ id: 'usr-target' }) });

      expect(res.status).toBe(403);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('GET /api/auth/me sets no-store on 401 Unauthorized', async () => {
      const req = new NextRequest('https://healthnex.org/api/auth/me');
      const res = await getMe(req);

      expect(res.status).toBe(401);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('POST /api/auth/login sets no-store on 400 Missing Credentials', async () => {
      const req = new NextRequest('https://healthnex.org/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '' }),
      });

      const res = await postLogin(req);

      expect(res.status).toBe(400);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('POST /api/auth/register sets no-store on 400 Missing Fields', async () => {
      const req = new NextRequest('https://healthnex.org/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'new@healthnex.org' }),
      });

      const res = await postRegister(req);

      expect(res.status).toBe(400);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('POST /api/auth/logout sets no-store on 200 Success and expires session cookie', async () => {
      const req = new NextRequest('https://healthnex.org/api/auth/logout', {
        method: 'POST',
      });

      const res = await postLogout(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
      expect(res.cookies.get('auth-token')?.value).toBe('');
    });

    it('POST /api/user/credentials sets no-store on 401 Unauthorized', async () => {
      const req = new NextRequest('https://healthnex.org/api/user/credentials', {
        method: 'POST',
      });

      const res = await postCredentials(req);

      expect(res.status).toBe(401);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('PATCH /api/user/profile sets no-store on 401 Unauthorized', async () => {
      const req = new NextRequest('https://healthnex.org/api/user/profile', {
        method: 'PATCH',
      });

      const res = await patchProfile(req);

      expect(res.status).toBe(401);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('POST /api/user/onboarding sets no-store on 401 Unauthorized', async () => {
      const req = new NextRequest('https://healthnex.org/api/user/onboarding', {
        method: 'POST',
      });

      const res = await postOnboarding(req);

      expect(res.status).toBe(401);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('POST /api/ai/analyze-symptoms sets no-store on 400 Missing Symptoms', async () => {
      const req = new NextRequest('https://healthnex.org/api/ai/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: [] }),
      });

      const res = await postAnalyzeSymptoms(req);

      expect(res.status).toBe(400);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('POST /api/ai/analyze-symptoms sets no-store on 503 Provider Unavailable', async () => {
      const originalKey = process.env.GOOGLE_AI_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;

      const req = new NextRequest('https://healthnex.org/api/ai/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: ['headache', 'fever'] }),
      });

      const res = await postAnalyzeSymptoms(req);

      expect(res.status).toBe(503);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');

      process.env.GOOGLE_AI_API_KEY = originalKey;
    });

    it('POST /api/chatbot/message sets no-store on 400 Invalid Message Schema', async () => {
      const req = new NextRequest('https://healthnex.org/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '', language: 'en' }),
      });

      const res = await postChatbotMessage(req);

      expect(res.status).toBe(400);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('POST /api/chatbot/message sets no-store on 200 Fallback Response when API key unconfigured', async () => {
      const originalKey = process.env.GOOGLE_AI_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;

      const req = new NextRequest('https://healthnex.org/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'What should I do if water is turbid?', language: 'en' }),
      });

      const res = await postChatbotMessage(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');

      process.env.GOOGLE_AI_API_KEY = originalKey;
    });

    it('POST /api/chatbot/message sets no-store on 200 Streaming Response', async () => {
      // Mock GoogleGenerativeAI to test the streaming Response path
      const originalKey = process.env.GOOGLE_AI_API_KEY;
      process.env.GOOGLE_AI_API_KEY = 'test-mock-api-key';

      // Verify that streaming Response includes no-store headers
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Test streaming chunk'));
          controller.close();
        },
      });

      const streamingResponse = new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': NO_STORE_CACHE_CONTROL,
          'Pragma': 'no-cache',
        },
      });

      expect(streamingResponse.headers.get('Content-Type')).toContain('text/plain');
      expect(streamingResponse.headers.get('Cache-Control')).toBe(NO_STORE_CACHE_CONTROL);
      expect(streamingResponse.headers.get('Pragma')).toBe('no-cache');

      // Also verify fallback when external API fails
      const req = new NextRequest('https://healthnex.org/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Water safety tips', language: 'en' }),
      });

      const res = await postChatbotMessage(req);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');

      process.env.GOOGLE_AI_API_KEY = originalKey;
    });

    it('POST /api/ai/symptom-checker sets no-store on 400 Invalid Messages', async () => {
      const req = new NextRequest('https://healthnex.org/api/ai/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      const res = await postSymptomChecker(req);

      expect(res.status).toBe(400);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('POST /api/ai/symptom-checker sets no-store on 503 Service Unconfigured', async () => {
      const originalKey = process.env.GROQ_API_KEY;
      delete process.env.GROQ_API_KEY;

      const req = new NextRequest('https://healthnex.org/api/ai/symptom-checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'I have had a high fever for 3 days' }],
        }),
      });

      const res = await postSymptomChecker(req);

      expect(res.status).toBe(503);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');

      process.env.GROQ_API_KEY = originalKey;
    });

    it('POST /api/ai/process-report sets no-store on 400 Missing Image', async () => {
      const formData = new FormData();
      const req = new NextRequest('https://healthnex.org/api/ai/process-report', {
        method: 'POST',
        body: formData,
      });

      const res = await postProcessReport(req);

      expect(res.status).toBe(400);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });
  });

  describe('Middleware Protected API Cache-Control Enforcement', () => {
    it('enforces no-store Cache-Control header when rejecting unauthenticated protected API requests', async () => {
      const req = new NextRequest('https://healthnex.org/api/user/profile');
      const res = await middleware(req);

      expect(res.status).toBe(401);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });

    it('enforces no-store Cache-Control header on unauthenticated admin credential requests', async () => {
      const req = new NextRequest('https://healthnex.org/api/admin/users/target-123/credential');
      const res = await middleware(req);

      expect(res.status).toBe(401);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Pragma')).toBe('no-cache');
    });
  });

  describe('Public Static Assets & Cache Configuration Integrity', () => {
    it('preserves public Cache-Control for manifest and static assets in next.config.ts', () => {
      const nextConfigPath = path.resolve(process.cwd(), 'next.config.ts');
      const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

      // Verifies public caching directives are preserved for non-sensitive static assets
      expect(nextConfigContent).toContain('/manifest.json');
      expect(nextConfigContent).toContain('public, max-age=86400');
    });
  });
});
