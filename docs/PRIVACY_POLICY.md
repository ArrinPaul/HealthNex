# HealthNex Privacy Policy

**Effective Date:** 23 October 2026  
**Document Version:** 1.0  
**Status:** Approved for Implementation & Release Readiness Rehearsal

---

## 1. Introduction

HealthNex ("we", "us", or "our") is an open-source, community-driven health intelligence and disease surveillance platform designed to assist public health authorities, verified health workers, and local communities in monitoring, reporting, and responding to localized disease outbreaks and environmental health hazards.

This Privacy Policy explains how personal data, sensitive health records, and technical telemetry are collected, processed, stored, and protected when you interact with the HealthNex web platform and associated API endpoints.

---

## 2. Applicable Legal Framework

HealthNex is designed and operated primarily for users and public health jurisdictions in India. This policy is structured to align with applicable Indian data protection law, specifically:

- The **Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)**, including core principles of notice, purpose limitation, data minimization, user rights, and reasonable security safeguards.
- The **Information Technology Act, 2000** and the **Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 (SPDI Rules)**.

> [!NOTE]  
> Certain operational modalities and subordinate rules under the DPDP Act, 2023 (such as operationalization of the Data Protection Board of India and specific consent manager protocols) await formal commencement notification by the Government of India. HealthNex enforces verified technical security baselines immediately while reserving organizational processes to align with finalized subordinate rules.

---

## 3. Information We Collect and Process

HealthNex strictly limits data collection to what is necessary to fulfill public health monitoring and platform operation:

### A. Account & Authentication Information
- **Account Registration:** Full name, valid email address, and securely salted and hashed passwords (using bcrypt with cost factor 12). Plaintext passwords are never logged or stored.
- **Role Identity:** Assigned role (`public-user`, `health-worker`, or `admin`).
- **Profile & Onboarding (Optional):** Date of birth, gender, broad geographic region (state, district, latitude, longitude), blood group, medical conditions, and occupation.

### B. Health Worker Professional Credentials
- **Verification Documents:** For users requesting the `health-worker` role, we collect professional medical licenses or institutional credentials (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.webp`, up to 5 MB).
- **Storage:** Stored in dedicated private object storage, accessible strictly to authenticated administrators and the uploading professional.

### C. Personal Health Vault Records
- **Self-Reported Health Metrics:** Vitals, symptoms, medications, and water quality observations submitted by users for personal health tracking.
- **Attachment Files:** Supporting laboratory reports or documents stored privately and isolated from public access.

### D. Community Outbreak & Environmental Reports
- **Community Submissions:** Outbreak summaries, location coordinates, symptoms observed, severity levels, and optional photo attachments (`.jpg`, `.jpeg`, `.png`, `.webp`, up to 5 MB).
- **Public Privacy Safeguards:** Community reports are visible to the public or health workers for epidemiological intelligence, but **raw storage identifiers and direct object URLs are stripped**. Attachments are accessible only through authenticated, access-controlled streaming endpoints that verify ownership or role privileges.

### E. Support Inquiries
- **Support Tickets:** Name, email address, subject, and message submitted through the rate-limited support gateway.
- **Protection:** Guarded against automated submission abuse via rate limiting (10 tickets per IP per hour) and internal server secret authentication.

### F. Technical Data & Telemetry
- **HTTP Request Headers:** IP addresses (used ephemerally for rate limiting and DDoS protection; not retained permanently in database tables), User-Agent, and timestamps.
- **Audit Logs:** Administrative actions (such as verification status changes, user role updates, and record deletions) are recorded with the actor ID, target entity, timestamp, and action summary.

---

## 4. Purposes of Data Processing

We process collected information exclusively for the following purposes:
1. **Epidemiological Surveillance:** Aggregating anonymous community outbreak reports to detect regional disease clusters and waterborne contamination risks.
2. **Account Provisioning & Security:** Authenticating users, issuing cryptographically signed JSON Web Tokens (JWT), and enforcing Role-Based Access Control (RBAC).
3. **Health Worker Verification:** Reviewing credentials of licensed health workers before granting clinical reporting privileges.
4. **AI-Assisted Diagnostic Guidance:** Providing contextual symptom analysis, outbreak probability forecasts, and health queries via AI language models.
5. **Operational Integrity:** Preventing automated abuse, rate limiting unauthorized requests, and maintaining immutable audit trails.

---

## 5. Health Information and AI-Assisted Features

HealthNex provides artificial intelligence features powered by Google Gemini and Groq LLM integrations:

- **Informational Purpose Only:** AI outputs (including symptom checker analysis and predictive health forecasts) are strictly informational and **do not constitute medical diagnoses, prescriptions, or clinical treatment plans**.
- **No Fabricated Fallbacks:** In accordance with platform safety protocols, if an external AI provider is unavailable, HealthNex returns an explicit `503 Service Unavailable` status and never fabricates diagnostic assessments or synthetic confidence scores.
- **Data Minimization in Prompts:** Only symptom text, category data, and non-identifying health parameters are forwarded to AI inference APIs. Direct personal identifiers (such as names, emails, and account passwords) are never transmitted to AI providers.

---

## 6. Third-Party Providers and Infrastructure

HealthNex utilizes trusted third-party infrastructure components:

| Provider | Purpose | Data Transmitted |
| :--- | :--- | :--- |
| **Convex Cloud** | Backend database and secure blob storage | Encrypted database records, private credentials, and attachments |
| **Google Gemini API** | Symptom analysis and health assistant inference | Non-identifying symptom queries |
| **Groq Cloud API** | Fast LLM inference for chatbot and fallback queries | Non-identifying query text |
| **Open-Meteo & Nominatim** | Weather intelligence and open geocoding | Non-identifying geographic coordinates |

We do not sell, rent, monetize, or trade personal data or health metrics with commercial data brokers, advertising networks, or third-party marketing services.

---

## 7. Security Safeguards

HealthNex enforces defense-in-depth technical and organizational safeguards:

- **Cryptographic Access Tokens:** Authenticated sessions use cryptographically verified HS256 JWT tokens with HMAC-SHA256 signature verification.
- **Strict Role-Based Access Control (RBAC):** Access to private health records, pending credentials, and audit logs is enforced at the database query/mutation layer using verified server identity.
- **Cache-Control Protections:** All sensitive API routes emit `Cache-Control: private, no-store, no-cache, max-age=0, must-revalidate` and `Pragma: no-cache` headers to prevent browser and intermediary proxy caching of personal health information.
- **Anti-IDOR Verification:** Storage upload objects are verified against active records across all collections before linking, preventing Insecure Direct Object Reference (IDOR) attacks.
- **Durable Cleanup & Reference Verification:** Storage deletions check cross-table active references before purging files, preventing accidental deletion of referenced documents.
- **Password Hashing:** Passwords are salted and hashed using bcrypt (cost factor 12).

---

## 8. Data Retention and Deletion

HealthNex handles data lifecycle management according to the following principles:

1. **User-Initiated Deletion:** Users may delete their personal Health Vault entries or community reports at any time. When deleted, associated storage files are unlinked and queued for storage cleanup.
2. **Account Deletion:** Users may request account termination by submitting a request to the designated Privacy Contact.
3. **Storage Cleanup Queue:** Failed storage file deletions are tracked in a durable recovery queue (`pendingStorageDeletions`) and re-verified against active references before automated or administrative retry.
4. **Health Worker Credential Retention:** 
   - Approved health worker credentials are retained for the duration of the professional's active affiliation.
   - Proposed automated deletion of rejected credential documents (e.g., after 30 days) is currently **pending formal institutional approval** and is not automatically executed by the system.
5. **Detailed Procedures:** Full lifecycle rules and recovery procedures are documented in [`docs/DATA_RETENTION_POLICY.md`](/docs/DATA_RETENTION_POLICY.md).

---

## 9. User Rights and Requests

Under the DPDP Act, 2023 and applicable privacy standards, users possess the following rights regarding their digital personal data:

- **Right to Access & Summary:** You have the right to request a summary of personal data processed by HealthNex.
- **Right to Correction & Updating:** You may update profile fields or request correction of incomplete or inaccurate data.
- **Right to Erasure:** You may request the deletion of your personal data, subject to legal compliance and public health statutory retention obligations.
- **Right of Grievance Redressal:** You have the right to submit a complaint regarding the handling of your data to our designated Privacy Contact.

To exercise any of these rights, contact our Privacy Contact as described in Section 13.

---

## 10. Cookies, Browser Storage, and Offline Functionality

- **Session Cookies:** HealthNex uses secure HTTP cookies exclusively for maintaining authenticated session tokens (`token`).
- **Local Browser Storage:** Progressive Web App (PWA) service workers cache static application shell assets (`_next/static`) for offline reliability. Personal health records and community attachments are **not permanently stored in unencrypted browser storage**.

---

## 11. Children's Data and Third-Party Submissions

HealthNex is not directed toward unsupervised children under 18 years of age. Community disease reports concerning minors must only be submitted by parents, legal guardians, or verified institutional healthcare workers.

When submitting a community outbreak report, reporters must not include private names, telephone numbers, or identifying domestic addresses of third parties without explicit authorization.

---

## 12. Policy Updates

We may update this Privacy Policy from time to time to reflect technological improvements, security hardening, or updates to statutory data protection frameworks. Any modifications will be posted on this page with an updated Effective Date.

---

## 13. Privacy Contact and Grievance Redressal

For questions, data access requests, or privacy grievances regarding HealthNex, please reach out via our Help & Support Portal:

- **Support Portal:** Accessible at `/help` (Rate-limited support ticketing)
- **Designated Inquiries:** Privacy & Compliance Communications Desk
- **Organization:** HealthNex Open Source Health Intelligence Initiative
