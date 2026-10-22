# SEC-CRED-01: Health-Worker Credential Document Retention & Deletion
## Institutional Decision & Authorization Document

> [!IMPORTANT]  
> **STATUS: PENDING INSTITUTIONAL DECISION & APPROVAL**  
> This is a formal governance decision document prepared for the authorized institutional authority. **It is NOT an approved policy or authorization to execute deletions.** No automated deletion, schema changes, or background cleanup jobs may be implemented or activated until this document is formally executed, signed, and approved by the responsible institutional authority.

---

## 1. Context & Purpose

Under the **Digital Personal Data Protection Act, 2023 (DPDP Act, 2023)** and standard information security hygiene, personal health worker credentials (e.g., medical practice licenses, government photo IDs, and institutional credentials stored in private Convex blob storage) must be governed by an explicit, legally reviewed retention schedule.

HealthNex has established a technical reference-verified storage cleanup queue (`pendingStorageDeletions`, tracking under `SEC-STOR-02`), but the specific lifecycle boundaries for health-worker verification documents (`users.verificationDocStorageId`) require formal institutional determination.

This document presents the necessary governance decisions for completion by the authorized institutional authority.

---

## 2. Institutional Decision Form

Please complete each decision field below. **Do not leave any section blank.**

---

### Decision 1: Responsible Institutional Authority

| Field | Institutional Specification |
| :--- | :--- |
| **Legal Entity Name** | `[ __________________________________________________ ]` |
| **Governing Department / Division** | `[ __________________________________________________ ]` |
| **Authorizing Official Name & Title** | `[ __________________________________________________ ]` |
| **Official Contact / Email** | `[ __________________________________________________ ]` |
| **Date of Execution** | `[ YYYY-MM-DD ]` |

---

### Decision 2: Rejected Credential Retention Period

*A healthcare worker candidate submits credentials requesting the `health-worker` role, but an administrator rejects the application.*

**Candidate Proposal for Review:** Retain rejected credential binaries for **30 calendar days** from the administrative rejection timestamp to permit applicant appeal or review, after which the binary file is deleted while retaining metadata and audit logs.

#### Institution's Binding Decision:
- [ ] **Option A (Approved as proposed):** Delete binary documents exactly **30 days** following the administrative rejection timestamp.
- [ ] **Option B (Alternative retention window):** Delete binary documents after `[ _____ ]` calendar days following rejection.
- [ ] **Option C (Immediate deletion):** Delete binary documents immediately upon administrative rejection.
- [ ] **Option D (Permanent retention):** Retain rejected credentials indefinitely for forensic and anti-fraud purposes.

*Authorized Notes / Rationale:* `[ __________________________________________________ ]`

---

### Decision 3: Approved Health-Worker Credential Retention

*A healthcare worker candidate's credentials are verified, and the `health-worker` role is granted.*

#### Institution's Binding Decision:
- [ ] **Option A (Duration of active affiliation):** Retain credentials for the entire duration of the health worker's active verified status, plus `[ _____ ]` months following account deactivation or role revocation.
- [ ] **Option B (Statutory audit period):** Retain credentials for `[ _____ ]` years from the date of initial approval, in accordance with applicable clinical oversight regulations.
- [ ] **Option C (Alternative):** `[ __________________________________________________ ]`

*Calculation Event:* Measured from (e.g., `Date of verification approval` / `Date of role revocation`): `[ ____________________ ]`

---

### Decision 4: Pending Credential Applications (Unverified / Stalled)

*A user uploads verification documents, but the application is neither approved nor rejected (e.g., incomplete submission, orphaned applicant).*

#### Institution's Binding Decision:
- [ ] **Option A:** Retain pending applications for `[ _____ ]` days (suggested: 90 days), after which the applicant is notified and unverified documents are purged.
- [ ] **Option B:** Retain pending applications indefinitely until an administrator takes explicit action.
- [ ] **Option C (Alternative):** `[ __________________________________________________ ]`

---

### Decision 5: Appeals, Re-applications, and Active Inquiries

*An applicant whose credentials were rejected submits an appeal or re-application, or an account is under formal dispute.*

#### Institution's Binding Decision:
- [ ] **Approved Rule:** Filing an appeal or initiating a re-application **immediately suspends any scheduled deletion timer**, preserving the document until the appeal is formally concluded.
- [ ] **Alternative Rule:** `[ __________________________________________________ ]`

---

### Decision 6: Legal Holds and Regulatory Inquiries

*A court order, regulatory notice from the Data Protection Board of India, or law enforcement request requires preservation of user records.*

#### Institution's Binding Decision:
- [ ] **Approved Protocol:** Any account flagged with an administrative `legalHold: true` status is **exempt from all automated and scheduled deletion routines**.
- **Designated Official Authorized to Place Legal Holds:** `[ ________________________________________ ]`
- **Designated Official Authorized to Release Legal Holds:** `[ ________________________________________ ]`

---

### Decision 7: Post-Deletion Metadata & Audit Trail Retention

*When a credential binary file (`_storage` object) is deleted to fulfill data minimization:*

#### Institution's Binding Decision:
- [ ] **Option A (Recommended):** Purge the binary storage object, but permanently retain non-binary audit history (`auditLogs`: user ID, applicant name, sanitized filename, submission date, rejection date, administrator notes).
- [ ] **Option B:** Retain metadata for `[ _____ ]` years following binary deletion, then purge metadata.
- [ ] **Option C (Alternative):** `[ __________________________________________________ ]`

---

### Decision 8: Handling Storage Deletion Failures

*When Convex storage deletion fails due to network outage, storage provider timeout, or infrastructure fault:*

#### Institution's Binding Decision:
- [ ] **Approved Protocol:** Enqueue the failed storage ID in the existing `pendingStorageDeletions` table with automatic exponential retry up to 5 attempts. If exhausted, retain in the queue with status `exhausted` and alert system administrators for manual diagnostic intervention.
- [ ] **Alternative Protocol:** `[ __________________________________________________ ]`

---

### Decision 9: Authorized Roles for Execution and Exceptions

| Action | Permitted Roles | Specific Approver Required |
| :--- | :--- | :--- |
| **Triggering Manual Document Deletion** | `[ ] Administrator only` | `[ ____________________ ]` |
| **Granting Individual Retention Exceptions** | `[ ] Compliance Officer / Legal Counsel` | `[ ____________________ ]` |
| **Reviewing Queue & Deletion Audits** | `[ ] Administrator / Auditor` | `[ ____________________ ]` |

---

### Decision 10: Effective Date and Review Cadence

- **Target Effective Date:** `[ YYYY-MM-DD ]`
- **Mandatory Policy Review Cadence:**
  - [ ] Annually (Recommended)
  - [ ] Biennially
  - [ ] Upon commencement of subsequent DPDP Act subordinate rules

---

## 3. Formal Implementation Gate & Preconditions

Implementation of automated or scheduled deletion for `SEC-CRED-01` in the HealthNex codebase **must not begin** until all of the following conditions are met:

1. **Executed Approval:** Sections 1 and 2 of this document are completed and signed by an authorized institutional representative.
2. **Legal Alignment:** The selected periods are confirmed by institutional counsel to comply with the DPDP Act, 2023 and relevant healthcare licensing regulations.
3. **Dedicated Implementation Task:** A separately authorized implementation phase is scheduled to:
   - Add schema tracking for `verificationRejectedAt` and `legalHold` flags.
   - Implement reference-verified deletion integrated with `pendingStorageDeletions`.
   - Implement comprehensive boundary tests (covering before, at, and after the approved retention window).
   - Verify that approved health-worker documents are never deleted by stale jobs.

---

## 4. Institutional Sign-Off Block

*By signing below, the undersigned confirms that they possess the requisite legal and operational authority to establish binding data retention rules for HealthNex credential records:*

**Authorizing Signature:** __________________________________________________  
**Printed Name:** `[ __________________________________________________ ]`  
**Title:** `[ __________________________________________________ ]`  
**Organization / Institution:** `[ __________________________________________________ ]`  
**Date:** `[ YYYY-MM-DD ]`  
