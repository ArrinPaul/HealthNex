/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig, RuntimeCaching } from "serwist";
import { Serwist, NetworkOnly } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Filter out any default runtimeCaching rule that caches same-origin /api/ responses.
// By default, Serwist's defaultCache includes a NetworkFirst rule for GET /api/* using the "apis" cache.
// For public health surveillance and clinical data security, authenticated and dynamic API responses
// must NEVER be cached in browser storage or shared across sessions.
const runtimeCaching: RuntimeCaching[] = [
  // 1. Explicit NetworkOnly handler for all same-origin API routes (Deny-by-default)
  {
    matcher: ({ sameOrigin, url: { pathname } }) => sameOrigin && pathname.startsWith("/api/"),
    handler: new NetworkOnly(),
  },
  // 2. Retain all non-API caching rules (static assets, fonts, images, pages, etc.)
  ...defaultCache.filter((entry) => {
    const handler = entry.handler as any;
    return !(handler && handler.cacheName === "apis");
  }),
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

// Purge obsolete and deprecated API runtime caches upon service worker activation
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name === "apis" || name.startsWith("serwist-apis"))
          .map((name) => {
            console.log(`[ServiceWorker] Purging deprecated API cache: ${name}`);
            return caches.delete(name).catch((err) => {
              console.error(`[ServiceWorker] Failed to purge cache ${name}:`, err);
              return false;
            });
          })
      );
    })
  );
});

serwist.addEventListeners();
