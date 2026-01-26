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

## Phase 4: Performance & UI/UX (In Progress)
- [x] **Real-time Subscriptions**
  - [x] Standardized on Convex `useQuery` for real-time updates.
  - [x] Connected Disease Map, Stats, and Community Reports.
- [x] **Component Refactoring**
  - [x] Refactored Dashboard into atomic sub-components (`StatsGrid`, `ChartsSection`, `DistributionSection`).
  - [ ] Refactor Community Reports and Health Data pages.
- [x] **Cleanup**
  - [x] Removed redundant legacy scripts (`setup-realtime.ps1`, etc.).


---
*Last Updated: January 26, 2026*
