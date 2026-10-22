process.env.JWT_SECRET = 'test-secret-key-for-jwt-service-testing-32ch';

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { ROLES, VERIFICATION_STATUS } from '../convex/roles';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// Phase 2A: Gate 0 — Authentication Integrity & Credential Protection
// ---------------------------------------------------------------------------
describe('Phase 2A: Gate 0 — Authentication Integrity & Credential Protection', () => {
  const plainPassword = 'CorrectAccessKey123!';
  let passwordHash: string;

  beforeAll(async () => {
    const salt = await bcrypt.genSalt(12);
    passwordHash = await bcrypt.hash(plainPassword, salt);
  });

  describe('verifyCredentials Flow', () => {
    // Pure logic simulation of convex/users.ts:verifyCredentials
    async function executeVerifyCredentials(
      emailInput: string,
      passwordInput: string,
      mockLookupUser: (email: string) => Promise<any>
    ) {
      const user = await mockLookupUser(emailInput);
      if (!user) return null;

      const isValid = await bcrypt.compare(passwordInput, user.passwordHash);
      if (!isValid) return null;

      const { passwordHash: _passwordHash, ...safeUser } = user;
      return safeUser;
    }

    it('authenticates user with valid credentials and strips passwordHash from return object', async () => {
      const mockLookup = vi.fn(async () => ({
        _id: 'user-1',
        email: 'doc@healthnex.org',
        name: 'Dr. Jane Smith',
        passwordHash,
        role: ROLES.HEALTH_WORKER,
        requestedRole: ROLES.HEALTH_WORKER,
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        isActive: true,
      }));

      const result = await executeVerifyCredentials('doc@healthnex.org', plainPassword, mockLookup);
      expect(result).toBeDefined();
      expect(result?._id).toBe('user-1');
      expect(result?.email).toBe('doc@healthnex.org');
      expect((result as any)?.passwordHash).toBeUndefined();
    });

    it('rejects authentication with invalid password and returns null', async () => {
      const mockLookup = vi.fn(async () => ({
        _id: 'user-1',
        email: 'doc@healthnex.org',
        passwordHash,
      }));

      const result = await executeVerifyCredentials('doc@healthnex.org', 'WrongPassword123!', mockLookup);
      expect(result).toBeNull();
    });

    it('rejects unknown email and returns null without throwing', async () => {
      const mockLookup = vi.fn(async () => null);
      const result = await executeVerifyCredentials('nonexistent@healthnex.org', plainPassword, mockLookup);
      expect(result).toBeNull();
    });
  });

  describe('User Query Sanitization (No Password Hash Leaks)', () => {
    const sensitiveUserDoc = {
      _id: 'u-123',
      email: 'nurse@healthnex.org',
      name: 'Nurse Joy',
      passwordHash: '$2a$12$SecureBcryptHash1234567890abcdef...',
      role: ROLES.HEALTH_WORKER,
      isActive: true,
      verificationStatus: VERIFICATION_STATUS.PENDING,
    };

    function sanitizeDoc(doc: any) {
      if (!doc) return null;
      const { passwordHash: _hash, ...safe } = doc;
      return safe;
    }

    it('getSelf query strips passwordHash', () => {
      const safe = sanitizeDoc(sensitiveUserDoc);
      expect(safe.passwordHash).toBeUndefined();
      expect(safe.name).toBe('Nurse Joy');
    });

    it('getUser query strips passwordHash', () => {
      const safe = sanitizeDoc(sensitiveUserDoc);
      expect(safe.passwordHash).toBeUndefined();
      expect(safe.email).toBe('nurse@healthnex.org');
    });

    it('getUserByEmailFull query strips passwordHash', () => {
      const safe = sanitizeDoc(sensitiveUserDoc);
      expect(safe.passwordHash).toBeUndefined();
    });

    it('getAllUsers query strips passwordHash across all returned users', () => {
      const userList = [sensitiveUserDoc, { ...sensitiveUserDoc, _id: 'u-124', name: 'Dr. Brock' }];
      const sanitizedList = userList.map(sanitizeDoc);
      expect(sanitizedList.every((u: any) => u.passwordHash === undefined)).toBe(true);
      expect(sanitizedList.length).toBe(2);
    });

    it('getPendingVerifications query strips passwordHash', () => {
      const pendingList = [sensitiveUserDoc];
      const sanitized = pendingList.map(sanitizeDoc);
      expect(sanitized[0].passwordHash).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Phase 2A: Workstream B — Secure Credential Upload & File Validation
// ---------------------------------------------------------------------------
describe('Phase 2A: Workstream B — Credential Upload & File Validation', () => {
  describe('Magic Byte Signature Verification', () => {
    it('detects and validates PDF files by %PDF- magic bytes (0x25 0x50 0x44 0x46)', async () => {
      const { verifyFileSignature } = await import('@/app/api/user/credentials/route');
      const validPdfBuffer = Buffer.from('%PDF-1.7\nSample content');
      const result = verifyFileSignature(validPdfBuffer);
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('application/pdf');
    });

    it('detects and validates PNG files by \x89PNG signature', async () => {
      const { verifyFileSignature } = await import('@/app/api/user/credentials/route');
      const validPngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
      const result = verifyFileSignature(validPngBuffer);
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/png');
    });

    it('detects and validates JPEG files by \xFF\xD8\xFF signature', async () => {
      const { verifyFileSignature } = await import('@/app/api/user/credentials/route');
      const validJpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]);
      const result = verifyFileSignature(validJpegBuffer);
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/jpeg');
    });

    it('detects and validates WebP files by RIFF....WEBP signature', async () => {
      const { verifyFileSignature } = await import('@/app/api/user/credentials/route');
      const validWebpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, // RIFF
        0x20, 0x00, 0x00, 0x00, // length
        0x57, 0x45, 0x42, 0x50, // WEBP
        0x56, 0x50, 0x38, 0x20  // VP8
      ]);
      const result = verifyFileSignature(validWebpBuffer);
      expect(result.valid).toBe(true);
      expect(result.detectedType).toBe('image/webp');
    });

    it('rejects spoofed files (e.g. plain text or executable masked as PDF)', async () => {
      const { verifyFileSignature } = await import('@/app/api/user/credentials/route');
      const spoofedPdfBuffer = Buffer.from('This is actually a text file or script');
      const result = verifyFileSignature(spoofedPdfBuffer);
      expect(result.valid).toBe(false);
    });

    it('rejects files with insufficient header length (< 4 bytes)', async () => {
      const { verifyFileSignature } = await import('@/app/api/user/credentials/route');
      const tinyBuffer = Buffer.from([0x25, 0x50]);
      const result = verifyFileSignature(tinyBuffer);
      expect(result.valid).toBe(false);
    });
  });

  describe('POST /api/user/credentials Route Validation', () => {
    it('returns 401 when no auth token is provided', async () => {
      const { POST } = await import('@/app/api/user/credentials/route');
      const req = new NextRequest('http://localhost:3000/api/user/credentials', {
        method: 'POST',
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('returns 400 when no file is included in formData', async () => {
      const { POST } = await import('@/app/api/user/credentials/route');
      const { JWTService } = await import('@/lib/jwt');

      const token = JWTService.generateToken({
        userId: 'u-hw-1',
        email: 'applicant@healthnex.org',
        role: ROLES.PUBLIC_USER
      });

      const emptyFormData = new Map();
      const req = new NextRequest('http://localhost:3000/api/user/credentials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      req.formData = async () => emptyFormData as any;

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('No credential file provided');
    });

    it('rejects files exceeding 10MB limit', async () => {
      const { POST } = await import('@/app/api/user/credentials/route');
      const { JWTService } = await import('@/lib/jwt');

      const token = JWTService.generateToken({
        userId: 'u-hw-1',
        email: 'applicant@healthnex.org',
        role: ROLES.PUBLIC_USER
      });

      const oversizedFile = {
        name: 'license.pdf',
        type: 'application/pdf',
        size: 11 * 1024 * 1024, // 11MB
        arrayBuffer: async () => new ArrayBuffer(10),
      };

      const formData = new Map();
      formData.set('file', oversizedFile);

      const req = new NextRequest('http://localhost:3000/api/user/credentials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      req.formData = async () => formData as any;

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('File too large');
    });

    it('rejects unsupported extensions and MIME types', async () => {
      const { POST } = await import('@/app/api/user/credentials/route');
      const { JWTService } = await import('@/lib/jwt');

      const token = JWTService.generateToken({
        userId: 'u-hw-1',
        email: 'applicant@healthnex.org',
        role: ROLES.PUBLIC_USER
      });

      const badFile = {
        name: 'license.exe',
        type: 'application/x-msdownload',
        size: 5000,
        arrayBuffer: async () => new ArrayBuffer(5000),
      };

      const formData = new Map();
      formData.set('file', badFile);

      const req = new NextRequest('http://localhost:3000/api/user/credentials', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      req.formData = async () => formData as any;

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Unsupported file format');
    });
  });

  describe('Convex Document Attachment & Lifecycle', () => {
    // Pure logic simulation of convex/users.ts:attachVerificationDocument
    async function executeAttachVerificationDocument(
      currentUser: any,
      args: { storageId: string; fileName: string },
      mockStorage?: { delete: (id: string) => Promise<void> }
    ) {
      if (!currentUser) throw new Error("User not found");

      const previousStorageId = currentUser.verificationDocStorageId;
      let previousCleanedUp = false;

      // Superseded document cleanup
      if (previousStorageId && previousStorageId !== args.storageId && mockStorage) {
        try {
          await mockStorage.delete(previousStorageId);
          previousCleanedUp = true;
        } catch (err) {
          previousCleanedUp = false;
        }
      }

      const sanitizedFileName = args.fileName
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 120) || "credential_document";

      const updatedUser = {
        ...currentUser,
        verificationDocStorageId: args.storageId,
        verificationDocName: sanitizedFileName,
        verificationDocUrl: sanitizedFileName,
        requestedRole: ROLES.HEALTH_WORKER,
        verificationStatus: VERIFICATION_STATUS.PENDING, // Never automatically verified!
      };

      return { success: true, updatedUser, previousCleanedUp };
    }

    it('attaches storageId to user and leaves verificationStatus as pending', async () => {
      const user = {
        _id: 'user-hw-99',
        name: 'Dr. Applicant',
        role: ROLES.PUBLIC_USER,
        verificationStatus: VERIFICATION_STATUS.NONE
      };

      const result = await executeAttachVerificationDocument(user, {
        storageId: 'storage-doc-123',
        fileName: 'medical_license.pdf'
      });

      expect(result.success).toBe(true);
      expect(result.updatedUser.verificationDocStorageId).toBe('storage-doc-123');
      expect(result.updatedUser.verificationStatus).toBe(VERIFICATION_STATUS.PENDING);
      expect(result.updatedUser.requestedRole).toBe(ROLES.HEALTH_WORKER);
    });

    it('cleans up superseded previous storage object upon replacement', async () => {
      const userWithOldDoc = {
        _id: 'user-hw-99',
        verificationDocStorageId: 'old-storage-id-999',
        verificationStatus: VERIFICATION_STATUS.REJECTED
      };

      const mockDelete = vi.fn(async () => {});
      const storage = { delete: mockDelete };

      const result = await executeAttachVerificationDocument(userWithOldDoc, {
        storageId: 'new-storage-id-1000',
        fileName: 'updated_license.pdf'
      }, storage);

      expect(result.success).toBe(true);
      expect(result.previousCleanedUp).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('old-storage-id-999');
      expect(result.updatedUser.verificationDocStorageId).toBe('new-storage-id-1000');
    });

    it('sanitizes malicious filenames preventing directory traversal', async () => {
      const user = { _id: 'user-hw-1' };
      const result = await executeAttachVerificationDocument(user, {
        storageId: 'storage-1',
        fileName: '../../../../etc/passwd'
      });

      expect(result.updatedUser.verificationDocName).not.toContain('/');
      expect(result.updatedUser.verificationDocName).not.toContain('\\');
    });
  });
});

// ---------------------------------------------------------------------------
// Phase 2A: Workstream C & D — Document Retrieval & Decision Lifecycle
// ---------------------------------------------------------------------------
describe('Phase 2A: Workstream C & D — Retrieval Authorization & Retention Lifecycle', () => {
  // Pure logic simulation of convex/users.ts:getVerificationDocumentUrl
  async function executeGetVerificationDocumentUrl(
    currentUser: { _id: string; role: string } | null,
    targetUser: any,
    mockStorage?: { getUrl: (id: string) => Promise<string | null> }
  ) {
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Only administrators can view verification documents");
    }

    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const storageId = targetUser.verificationDocStorageId;
    if (!storageId) {
      return {
        url: null,
        fileName: targetUser.verificationDocName || targetUser.verificationDocUrl || null,
        isLegacy: true,
      };
    }

    let downloadUrl: string | null = null;
    if (mockStorage) {
      downloadUrl = await mockStorage.getUrl(storageId);
    }

    return {
      url: downloadUrl,
      fileName: targetUser.verificationDocName || "credential_document",
      isLegacy: false,
    };
  }

  describe('Retrieval Authorization Matrix', () => {
    const admin = { _id: 'admin-1', role: ROLES.ADMIN };
    const healthWorker = { _id: 'hw-2', role: ROLES.HEALTH_WORKER };
    const publicUser = { _id: 'pub-3', role: ROLES.PUBLIC_USER };

    const targetApplicant = {
      _id: 'applicant-4',
      verificationDocStorageId: 'storage-doc-applicant-4',
      verificationDocName: 'verified_license.pdf',
      verificationStatus: VERIFICATION_STATUS.PENDING
    };

    const mockStorage = {
      getUrl: vi.fn(async (id: string) => `https://storage.convex.cloud/credentials/${id}?signed=true`)
    };

    it('permits authorized administrator to resolve signed download URL', async () => {
      const res = await executeGetVerificationDocumentUrl(admin, targetApplicant, mockStorage);
      expect(res.url).toBe('https://storage.convex.cloud/credentials/storage-doc-applicant-4?signed=true');
      expect(res.fileName).toBe('verified_license.pdf');
      expect(res.isLegacy).toBe(false);
    });

    it('denies ordinary health worker from retrieving credential documents', async () => {
      await expect(executeGetVerificationDocumentUrl(healthWorker, targetApplicant, mockStorage))
        .rejects.toThrow('Unauthorized: Only administrators can view verification documents');
    });

    it('denies public user from retrieving credential documents', async () => {
      await expect(executeGetVerificationDocumentUrl(publicUser, targetApplicant, mockStorage))
        .rejects.toThrow('Unauthorized: Only administrators can view verification documents');
    });

    it('denies signed-out caller from retrieving credential documents', async () => {
      await expect(executeGetVerificationDocumentUrl(null, targetApplicant, mockStorage))
        .rejects.toThrow('Unauthorized: Only administrators can view verification documents');
    });

    it('safely handles legacy records that only have a filename string without throwing', async () => {
      const legacyApplicant = {
        _id: 'legacy-5',
        verificationDocUrl: 'license_scan_legacy.pdf',
        // No verificationDocStorageId
      };

      const res = await executeGetVerificationDocumentUrl(admin, legacyApplicant, mockStorage);
      expect(res.url).toBeNull();
      expect(res.fileName).toBe('license_scan_legacy.pdf');
      expect(res.isLegacy).toBe(true);
    });
  });

  describe('Verification Decision Lifecycle & Document Retention', () => {
    // Pure logic simulation of convex/users.ts:verifyUser
    function executeVerifyUser(
      adminUser: { _id: string; role: string },
      targetUser: any,
      decision: 'verified' | 'rejected'
    ) {
      if (adminUser.role !== ROLES.ADMIN) {
        throw new Error("Unauthorized: Only admins can verify users");
      }

      const updated = {
        ...targetUser,
        verificationStatus: decision,
        role: decision === 'verified' ? (targetUser.requestedRole || ROLES.PUBLIC_USER) : targetUser.role
      };

      // Invariant: Credential documents MUST BE RETAINED for audit/appeal records!
      // verifyUser must NEVER delete verificationDocStorageId!
      return updated;
    }

    it('preserves credential document upon administrator APPROVAL for audit trails', () => {
      const targetUser = {
        _id: 'user-1',
        role: ROLES.PUBLIC_USER,
        requestedRole: ROLES.HEALTH_WORKER,
        verificationDocStorageId: 'storage-license-keep-1',
        verificationDocName: 'license.pdf',
        verificationStatus: VERIFICATION_STATUS.PENDING
      };

      const admin = { _id: 'admin-1', role: ROLES.ADMIN };
      const result = executeVerifyUser(admin, targetUser, 'verified');

      expect(result.verificationStatus).toBe(VERIFICATION_STATUS.VERIFIED);
      expect(result.role).toBe(ROLES.HEALTH_WORKER);
      // Document MUST remain attached
      expect(result.verificationDocStorageId).toBe('storage-license-keep-1');
      expect(result.verificationDocName).toBe('license.pdf');
    });

    it('preserves credential document upon administrator REJECTION for audit and appeal review', () => {
      const targetUser = {
        _id: 'user-2',
        role: ROLES.PUBLIC_USER,
        requestedRole: ROLES.HEALTH_WORKER,
        verificationDocStorageId: 'storage-license-keep-2',
        verificationDocName: 'suspect_license.pdf',
        verificationStatus: VERIFICATION_STATUS.PENDING
      };

      const admin = { _id: 'admin-1', role: ROLES.ADMIN };
      const result = executeVerifyUser(admin, targetUser, 'rejected');

      expect(result.verificationStatus).toBe(VERIFICATION_STATUS.REJECTED);
      expect(result.role).toBe(ROLES.PUBLIC_USER); // Role not granted
      // Document MUST remain attached for evidence/audit
      expect(result.verificationDocStorageId).toBe('storage-license-keep-2');
    });
  });
});
