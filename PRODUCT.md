# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three roles, hierarchical:

- **Public users** — citizens who submit community health/water/environmental reports, view the dashboard, use AI health features, and find nearby hospitals. Get immediate access on registration (not gated by verification unless they've requested promotion to health worker).
- **Health workers** — verified professionals who broadcast alerts, update outbreak status, and use AI diagnostic features. Promotion from public user requires admin-approved credential verification.
- **Admins** — top-tier role managing users, verification queue, audit logs, support tickets, and usage stats. Can modify anyone, including other admins.

Target deployment is a real institutional context (health department / NGO), not a portfolio piece — the audience includes non-technical field health workers and citizen reporters, not only administrators.

## Product Purpose

HealthNex standardizes health response for a region by combining decentralized, ground-level community reporting with AI-assisted analysis (Google Gemini) and institutional tools for verification, alert broadcasting, and outbreak tracking. Success means health officials get real-time regional visibility they can act on, and citizens/health workers have a fast, trustworthy channel to report and get help.

## Positioning

Most health-surveillance tooling is top-down (institution-authored data only) or citizen-only (no verified institutional response loop). HealthNex's mechanism is the two-way loop: every user is a reporting "node," AI (Gemini) triages and forecasts from that ground-level signal, and verified health workers/admins act on it through the same real-time system (Convex), with an immutable audit trail and RBAC enforcing who can see and do what at each tier.

## Operating Context

- Citizens and field health workers reporting from mobile devices, often in the field — reports include location, category (water/health/outbreak/environmental/safety), and severity.
- Health officials monitoring a live dashboard (stats grid, geospatial map, trend charts, disease distribution) and broadcasting multi-channel alerts (health alert, weather warning, water quality, outbreak) by severity and radius.
- Admins running verification queues, role management, audit review, and support tickets.
- AI-assisted flows: symptom analysis, health Q&A chatbot, medical document/report OCR, voice input (English, Hindi, Bengali via Web Speech API), and outbreak prediction.
- First-time users complete a 4-step onboarding (location, personal info, health conditions, review) that then powers location-aware features like the hospital finder.
- External data integrations: disease.sh (disease stats), OpenStreetMap/Overpass (hospitals/pharmacies), Nominatim (geocoding), water-quality API.

## Capabilities and Constraints

- Stack: Next.js 15 (App Router) + React 19 + Convex (real-time backend, 11 tables) + Gemini 2.0 Flash AI + Tailwind CSS 4.
- Zero-trust architecture: JWT verification, CSRF protection, route guards at the middleware layer.
- RBAC hierarchy strictly enforced server-side: a role can only modify strictly-lower roles; no self-promotion above current level. All role changes are logged immutably.
- Multilingual support (i18next) with voice input in English, Hindi, and Bengali.
- Data is a mix of real and demo/seed: some integrations are live (disease.sh, OpenStreetMap), but there is no confirmed real institutional partner or production user base yet — future work must not present seed/demo data, testimonials, or partner claims as real without confirmation.

## Evidence on Hand

No confirmed real testimonials, named partner organizations, or production case studies. Live third-party data sources (disease.sh, OpenStreetMap/Overpass, Nominatim) are real and may be cited as real integrations. Do not fabricate institutional partners, pilot results, or user counts.

## Product Principles

1. Every citizen is a sensor node — the reporting flow must stay fast and low-friction, especially for non-technical field users on constrained connections.
2. Verification and audit trails are load-bearing, not decorative — role changes, alerts, and status updates must always be traceable to who did them and when.
3. AI assists triage; it does not replace institutional judgment — AI outputs (diagnosis, forecasts) should read as advisory, not authoritative.
4. Real-time visibility over static reporting — dashboards and alerts should reflect live backend state, not batch snapshots.
5. Access is role-scoped by default — never surface admin/health-worker-only actions or data to a public user, even visually.

## Accessibility & Inclusion

WCAG 2.1 AA baseline required. Multilingual and voice-input support (English, Hindi, Bengali) are existing product commitments, not aspirational.
