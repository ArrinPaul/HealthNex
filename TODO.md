# HealthNex TODO List

## Completed Tasks ✅

### 1. Security & Auth Hardening (Phase 5)
- [x] **Secure Convex Queries:** Refactored `getUserHealthData`, `getRecentHealthData`, `createReport`, `updateReportStatus`, `createAlert`, `deactivateAlert` to use `queryWithAuth` / `mutationWithAuth`.
- [x] **CSRF Protection:** Implemented Origin/Referer check in `middleware.ts`.
- [x] **Auth Token Validation:** Verified `jwt.ts` logic and integrated token passing in `AuthContext` and services.

### 2. API & AI Optimization (Phase 6)
- [x] **Edge Runtime:** Added `export const runtime = 'edge'` to:
  - `src/app/api/chatbot/message/route.ts`
  - `src/app/api/predict/route.ts`
  - `src/app/api/suggestions/generate/route.ts`
  - `src/app/api/suggestions/contextual/route.ts`
  - `src/app/api/suggestions/health-trends/route.ts`
  - `src/app/api/health/route.ts`
- [x] **AI Key Health Check:** Updated `src/app/api/health/route.ts` to perform a lightweight validation of the Gemini API key.

### 3. UI/UX & Experimental (Phase 7)
- [x] **Visual Editing Integration:** Integrated `VisualEditsMessenger` into `src/components/AppLayout.tsx`.
- [x] **Admin Dashboard:** Created `src/app/admin/page.tsx` and `src/components/admin/UsageStats.tsx` visualizing real-time usage stats.

### 4. Maintenance & Cleanup
- [x] **Sitemap Generation:** `next-sitemap.config.js` verified.
- [x] **Global Error Boundary:** `src/app/global-error.tsx` verified as a safe fallback.