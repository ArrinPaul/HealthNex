# HealthNex — Staging Rehearsal & Release Gate Checklist

**Document Version:** 1.0  
**Effective Date:** 23 October 2026  
**Status:** Pre-Staging Verification  
**Gate Condition:** Formal rehearsal requires an isolated staging deployment. No live browser test is marked `PASS` until executed against the provisioned staging environment.

---

## 1. Staging Environment Prerequisites

Before live browser rehearsal commences, the following dedicated staging infrastructure must be established:

| Prerequisite | Required Specification | Current Status |
| :--- | :--- | :--- |
| **Isolated Convex Deployment** | Separate deployment (e.g., `staging:healthnex-staging`) isolated from `dev:enduring-crane-208` and production. | **BLOCKED (Not Provisioned)** |
| **Staging Web Host** | Dedicated staging host/subdomain (e.g., `https://staging.healthnex.app`) with HTTPS termination. | **BLOCKED (Not Provisioned)** |
| **Isolated JWT Secret** | Dedicated 32+ character `JWT_SECRET` generated exclusively for staging. | **BLOCKED (Awaiting Staging Env)** |
| **Isolated Support Secret** | Staging-only `SUPPORT_TICKET_SECRET` configured in both Next.js and Convex deployment. | **BLOCKED (Awaiting Staging Env)** |
| **Isolated Cron Secret** | Staging-only `CRON_SECRET` configured in both Next.js and Convex deployment. | **BLOCKED (Awaiting Staging Env)** |
| **Staging AI Credentials** | Staging API keys for `GOOGLE_AI_API_KEY` (Gemini 2.0 Flash) and `GROQ_API_KEY`. | **BLOCKED (Awaiting Staging Env)** |
| **Clean Database Seed** | Staging database seeded with 1 Admin user, 1 verified Health Worker, and 1 Public User. | **BLOCKED (Awaiting Staging Env)** |

---

## 2. Interactive Staging Rehearsal Matrix

*Legend:*  
- **PASS**: Executed and verified directly against the live staging deployment.  
- **FAIL**: Executed against staging and failed expected assertion.  
- **BLOCKED**: Cannot be executed until staging environment is provisioned or prerequisite is met.  
- **NOT RUN**: Environment ready, but test has not yet been triggered.

---

### Phase A: Registration, Authentication & Session Behavior

| ID | Test Scenario | Acceptance Criteria | Staging Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **STG-AUTH-01** | Public User Registration | User registers with valid email, name, password; gets immediate public-user role. | **BLOCKED** | Staging environment not provisioned. |
| **STG-AUTH-02** | Password Policy Enforcement | Registration rejects passwords < 8 chars or missing uppercase/lowercase/numbers. | **BLOCKED** | Staging environment not provisioned. |
| **STG-AUTH-03** | User Login & JWT Issuance | Valid credentials issue HttpOnly `token` cookie; bcrypt password hash never returned. | **BLOCKED** | Staging environment not provisioned. |
| **STG-AUTH-04** | Invalid Login Handling | Bad credentials return 401 with generic message, avoiding email enumeration. | **BLOCKED** | Staging environment not provisioned. |
| **STG-AUTH-05** | Logout & Session Cleared | Logout clears session cookie; client redirects to `/login`. | **BLOCKED** | Staging environment not provisioned. |
| **STG-AUTH-06** | Session Expiry / Tampering | Expired or forged JWT triggers redirection to `/login` from protected routes. | **BLOCKED** | Staging environment not provisioned. |

---

### Phase B: Health-Worker Credential Upload & Admin Verification

| ID | Test Scenario | Acceptance Criteria | Staging Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **STG-CRED-01** | Credential File Upload | Candidate uploads PDF/image license during registration or role upgrade. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CRED-02** | Magic Byte File Verification | Upload rejects non-PDF/JPEG/PNG files disguised with fake extensions. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CRED-03** | Admin Verification Queue | Admin inspects pending verification queue at `/admin/users`. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CRED-04** | Admin View Credential Document | Admin clicks "View Credential"; route validates admin JWT before resolving document. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CRED-05** | Admin Approve Credential | User role promoted to `health-worker`; audit log recorded immutably. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CRED-06** | Admin Reject Credential | Verification status updated to `rejected`; audit log recorded; document preserved. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CRED-07** | Credential Retention Safety | No automatic deletion executes; `SEC-CRED-01` remains blocked pending policy sign-off. | **BLOCKED** | Staging environment not provisioned. |

---

### Phase C: Health Vault Upload, Download & Ownership Boundaries

| ID | Test Scenario | Acceptance Criteria | Staging Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **STG-VAULT-01** | Vault Record Creation | Public user creates vital record with optional medical attachment file. | **BLOCKED** | Staging environment not provisioned. |
| **STG-VAULT-02** | Owner Download Access | Record owner can retrieve and view their own uploaded document. | **BLOCKED** | Staging environment not provisioned. |
| **STG-VAULT-03** | IDOR Protection (Non-Owner) | Other public users cannot view, query, or download non-owned vault records (403/404). | **BLOCKED** | Staging environment not provisioned. |
| **STG-VAULT-04** | Staff Access Privileges | Verified health workers and admins can view vault records when clinical access is required. | **BLOCKED** | Staging environment not provisioned. |
| **STG-VAULT-05** | Vault Record Deletion | Owner deletes record; storage object deleted; re-reference check prevents deleting shared blobs. | **BLOCKED** | Staging environment not provisioned. |

---

### Phase D: Community Reports & Attachment Streaming Gateway

| ID | Test Scenario | Acceptance Criteria | Staging Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **STG-REP-01** | Create Report with Attachment | User submits outbreak report with photo attachment (water, health, outbreak). | **BLOCKED** | Staging environment not provisioned. |
| **STG-REP-02** | Public Query Sanity | Public queries (`getReports`, `getReportById`) strip raw `attachmentStorageId`. | **BLOCKED** | Staging environment not provisioned. |
| **STG-REP-03** | Attachment Streaming Proxy | `GET /api/community-reports/[id]/attachment` streams binary with JWT auth. | **BLOCKED** | Staging environment not provisioned. |
| **STG-REP-04** | Zero Bearer URL Leakage | Neither API response nor DOM contains raw `*.convex.site` bearer URLs. | **BLOCKED** | Staging environment not provisioned. |
| **STG-REP-05** | Unauthorized Attachment Access | Unauthenticated request to attachment endpoint receives 401 Unauthorized. | **BLOCKED** | Staging environment not provisioned. |
| **STG-REP-06** | IDOR Cross-User Attachment Access | Non-owner, non-staff user receives 403 Forbidden attempting to access private attachment. | **BLOCKED** | Staging environment not provisioned. |

---

### Phase E: Network, Caching & Security Headers

| ID | Test Scenario | Acceptance Criteria | Staging Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **STG-CACHE-01** | Service Worker API Bypass | Service worker Rule 0 (`NetworkOnly` on `/api/*`) ensures sensitive APIs are never cached. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CACHE-02** | Cache-Control Header Check | All `/api/` endpoints emit `Cache-Control: private, no-store, no-cache, must-revalidate`. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CACHE-03** | Security Headers Inspection | Responses include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`. | **BLOCKED** | Staging environment not provisioned. |
| **STG-CACHE-04** | Offline Fallback Behavior | PWA serves `/offline.html` when network disconnects; sensitive data remains uncached. | **BLOCKED** | Staging environment not provisioned. |

---

### Phase F: Support Ticket Gateway & Abuse Rate Limiting

| ID | Test Scenario | Acceptance Criteria | Staging Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **STG-SUPP-01** | Legitimate Support Ticket | Anonymous or authenticated user submits ticket; stored in Convex via gateway route. | **BLOCKED** | Staging environment not provisioned. |
| **STG-SUPP-02** | Rate Limit Enforcement | More than 5 submissions per minute from single IP receives 429 Too Many Requests. | **BLOCKED** | Staging environment not provisioned. |
| **STG-SUPP-03** | Secret Verification Path | Next.js server validates `SUPPORT_TICKET_SECRET` with Convex; external direct call rejected. | **BLOCKED** | Staging environment not provisioned. |
| **STG-SUPP-04** | Input Sanitization | Ticket fields (subject, message, email) enforce strict schema boundaries and trim lengths. | **BLOCKED** | Staging environment not provisioned. |

---

### Phase G: Storage Cleanup Queue & Admin Recovery Visibility

| ID | Test Scenario | Acceptance Criteria | Staging Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **STG-STOR-01** | Deletion Failure Tracking | Simulated storage timeout enqueues entry in `pendingStorageDeletions` table. | **BLOCKED** | Staging environment not provisioned. |
| **STG-STOR-02** | Admin Queue Visibility | Admin can inspect pending/exhausted cleanup records; non-admin blocked with 403. | **BLOCKED** | Staging environment not provisioned. |
| **STG-STOR-03** | Re-reference Protection | If a file is re-referenced, retry mutation aborts deletion and marks superseded. | **BLOCKED** | Staging environment not provisioned. |
| **STG-STOR-04** | Error Sanitization | Stored error diagnostics in queue omit raw URLs, bearer tokens, or internal credentials. | **BLOCKED** | Staging environment not provisioned. |

---

### Phase H: Browser Health, Console, Mobile Usability & Session Handling

| ID | Test Scenario | Acceptance Criteria | Staging Status | Evidence / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **STG-UX-01** | Clean Browser Console | No unhandled exceptions, hydration mismatches, or missing resource 404s on load. | **BLOCKED** | Staging environment not provisioned. |
| **STG-UX-02** | Mobile Viewport Usability | Navigation, report submission, and symptom checker render cleanly on mobile viewport. | **BLOCKED** | Staging environment not provisioned. |
| **STG-UX-03** | Network Disconnect Resilience | Application gracefully handles temporary network drop without crashing React tree. | **BLOCKED** | Staging environment not provisioned. |
| **STG-UX-04** | Multilingual Toggle | Language switcher (English, Hindi, Bengali) loads correct translations across routes. | **BLOCKED** | Staging environment not provisioned. |

---

## 3. Execution Summary

- **Total Staging Checks**: 38  
- **Passed**: 0  
- **Failed**: 0  
- **Blocked**: 38 (Pending Staging Environment Provisioning)  
- **Not Run**: 0  

*Gate Conclusion:* Automated unit and regression suites (272/272 tests) pass locally, but staging rehearsal remains **BLOCKED** until a dedicated staging environment (hosting + separate Convex instance) is provisioned.
