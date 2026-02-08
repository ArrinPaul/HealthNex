# HealthNex Project Roadmap 🚀

This roadmap outlines the planned improvements for the HealthNex Public Health Surveillance System.

## Phase 1: Foundation & Cleanup (Complete ✅)
- [x] **Consolidate Backend Stack**
  - [x] Remove redundant libraries (`mongoose`, `supabase`, `drizzle`).
  - [x] Standardize all data operations on Convex.
  - [x] Clean up `package.json` and prune unused dependencies.
- [x] **Robust Validation**
  - [x] Implement Zod schemas for all API routes.
  - [x] Added request body validation using Zod.
- [x] **Environment & Configuration**
  - [x] Centralized `.env` management.
  - [x] Fixed JWT and AI API key configurations.

## Phase 2: Real AI Integration (Complete ✅)
- [x] **Data-Driven Predictions**
  - [x] Replaced `Math.random()` in `/api/predict` with Gemini analysis.
  - [x] Connected symptom analysis and health queries to real AI.
- [x] **Advanced Health Assistant**
  - [x] Implemented streaming responses for the Chatbot.
  - [x] Added document processing (OCR) for health reports using Gemini Vision.

## Phase 3: Developer Experience & Global Reach (Complete ✅)
- [x] **Standardized i18n**
  - [x] Moved translations to JSON locale files (English, Hindi, Bengali).
  - [x] Integrated `i18next-http-backend` for dynamic loading.
- [x] **Eliminate manual translation switch-cases**
  - [x] Standardized Chatbot, Dashboard, Reports, Health Data, Water Quality, and Education pages.
- [x] **Testing Infrastructure**
  - [x] Set up Vitest for unit testing.
  - [x] Implemented initial test suite for utilities.

## Phase 4: Performance & UI/UX (Complete ✅)
- [x] **Real-time Subscriptions**
  - [x] Standardized on Convex `useQuery` for real-time updates.
  - [x] Connected Disease Map, Stats, and Community Reports.
- [x] **Component Refactoring**
  - [x] Refactored Dashboard into atomic sub-components.
  - [x] Refactored Community Reports, Health Data, and Water Quality pages.
- [x] **Cleanup**
  - [x] Removed redundant legacy scripts.

## Phase 5: Security & Production Readiness (In Progress)
- [x] **Secret Integrity Check**
  - [x] Implement environment variable validator.
  - [x] Create secure .env template.
- [x] **Auth Hardening**
  - [x] Move to secure HTTP-only cookies for sessions.
  - [x] Implemented Edge Middleware for global route protection.
  - [ ] Implement CSRF protection for API routes.
- [ ] **Database Hardening**
  - [x] Strict schema validation with literal unions.
  - [ ] **Critical:** Implement Row-Level Security (RLS) for `getUserHealthData` and other queries (currently allow arbitrary `userId` access).

## Phase 6: API Verification & Scalability (In Progress)
- [ ] **AI Key Validation**
  - [ ] Automatic health-check for Gemini API key status at startup.
- [ ] **Usage Monitoring**
  - [x] Usage tracking table in Convex.
  - [ ] Admin dashboard for API cost/token monitoring.
- [ ] **Deployment Readiness**
  - [ ] Optimize Edge Runtime for AI routes (Add `export const runtime = 'edge'`).
  - [ ] Finalize Vercel deployment configuration.

## Phase 7: New Features (Experimental)
- [ ] **Visual Editing**
  - [x] `visual-edits` folder structure established.
  - [ ] Integrate visual component editing fully.
- [ ] **Simple Test Mode**
  - [x] `simple-test` route established.

---
*Last Updated: January 30, 2026*