process.env.JWT_SECRET = 'test-secret-key-for-jwt-service-testing-32ch';

import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { ROLES } from '../convex/roles';

// ---------------------------------------------------------------------------
// PROFILE-01: Profile and Onboarding Persistence & Privilege Protection
// ---------------------------------------------------------------------------
describe('Phase 1E — PROFILE-01: User Profile & Onboarding Persistence', () => {
  describe('Profile Update Authorization & Privileged Field Protection', () => {
    // Pure logic validator matching convex/users.ts:updateProfile
    function applyProfilePatch(currentUser: any, patchArgs: {
      name?: string;
      locationAddress?: string;
      newPasswordHash?: string;
      bloodGroup?: string;
      occupation?: string;
      // Malicious/attacker attempts to inject privileged fields:
      role?: string;
      requestedRole?: string;
      verificationStatus?: string;
      isActive?: boolean;
    }) {
      if (!currentUser) throw new Error("User not found");

      const patch: any = {};
      if (typeof patchArgs.name === "string") {
        const trimmed = patchArgs.name.trim();
        if (!trimmed || trimmed.length > 100) {
          throw new Error("Name is required and must be under 100 characters");
        }
        patch.name = trimmed;
      }

      if (typeof patchArgs.locationAddress === "string") {
        const trimmedLoc = patchArgs.locationAddress.trim().slice(0, 200);
        patch.location = {
          latitude: currentUser.location?.latitude ?? 0,
          longitude: currentUser.location?.longitude ?? 0,
          address: trimmedLoc,
          state: currentUser.location?.state,
          district: currentUser.location?.district,
        };
      }

      if (typeof patchArgs.bloodGroup === "string") {
        patch.bloodGroup = patchArgs.bloodGroup.trim().slice(0, 10);
      }

      if (typeof patchArgs.occupation === "string") {
        patch.occupation = patchArgs.occupation.trim().slice(0, 100);
      }

      if (typeof patchArgs.newPasswordHash === "string" && patchArgs.newPasswordHash.length > 0) {
        patch.passwordHash = patchArgs.newPasswordHash;
      }

      // Security invariant: Privileged fields are strictly ignored / omitted from patch
      return {
        ...currentUser,
        ...patch
      };
    }

    it('successfully updates name and location for authenticated user', () => {
      const user = {
        _id: 'user-123',
        name: 'Original Name',
        email: 'user@example.com',
        role: ROLES.PUBLIC_USER,
        location: { address: 'Old Address', latitude: 12, longitude: 77 }
      };

      const updated = applyProfilePatch(user, {
        name: 'Jane Smith',
        locationAddress: 'New District A, Sector 4'
      });

      expect(updated.name).toBe('Jane Smith');
      expect(updated.location.address).toBe('New District A, Sector 4');
      expect(updated.email).toBe('user@example.com');
      expect(updated.role).toBe(ROLES.PUBLIC_USER);
    });

    it('rejects empty name or name exceeding 100 characters', () => {
      const user = { _id: 'user-123', name: 'Valid Name' };

      expect(() => applyProfilePatch(user, { name: '   ' }))
        .toThrow('Name is required and must be under 100 characters');

      expect(() => applyProfilePatch(user, { name: 'A'.repeat(101) }))
        .toThrow('Name is required and must be under 100 characters');
    });

    it('NEVER permits privilege escalation (role, verificationStatus, isActive) via profile updates', () => {
      const user = {
        _id: 'user-123',
        name: 'Regular User',
        role: ROLES.PUBLIC_USER,
        verificationStatus: 'none',
        isActive: true
      };

      // Attacker attempts to grant themselves admin or change verificationStatus
      const updated = applyProfilePatch(user, {
        name: 'Hacker',
        role: ROLES.ADMIN,
        verificationStatus: 'verified',
        isActive: false
      } as any);

      expect(updated.name).toBe('Hacker');
      expect(updated.role).toBe(ROLES.PUBLIC_USER); // Role must remain unchanged
      expect(updated.verificationStatus).toBe('none');
      expect(updated.isActive).toBe(true);
    });

    it('updates password hash when valid hash is supplied', () => {
      const user = { _id: 'user-123', passwordHash: 'old-hash' };
      const updated = applyProfilePatch(user, { newPasswordHash: 'new-bcrypt-hashed-password' });
      expect(updated.passwordHash).toBe('new-bcrypt-hashed-password');
    });
  });

  describe('PATCH /api/user/profile Route Behavior', () => {
    it('returns 401 Unauthorized when auth token is missing', async () => {
      const { PATCH } = await import('@/app/api/user/profile/route');
      const req = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Name' })
      });

      const res = await PATCH(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toContain('Unauthorized');
    });

    it('returns 400 when invalid body payload is sent', async () => {
      const { PATCH } = await import('@/app/api/user/profile/route');
      const { JWTService } = await import('@/lib/jwt');

      const token = JWTService.generateToken({
        userId: 'user-123',
        email: 'test@example.com',
        role: 'public-user'
      });

      const req = new NextRequest('http://localhost:3000/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: '' })
      });

      const res = await PATCH(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Full name cannot be empty.');
    });
  });
});

// ---------------------------------------------------------------------------
// VAULT-01: Health Vault Access Matrix & Record Ownership
// ---------------------------------------------------------------------------
describe('Phase 1E — VAULT-01: Health Vault & Record Access Integrity', () => {
  // Pure logic matcher for getHealthDataById
  function authorizeGetHealthDataById(currentUser: any, record: any) {
    if (!record) return null;
    if (!currentUser) throw new Error("Unauthorized: Authentication required");

    const isOwner = record.userId === currentUser._id;
    const isPrivileged = currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.HEALTH_WORKER;

    if (!isOwner && !isPrivileged) {
      throw new Error("Unauthorized: You do not have permission to view this health record");
    }

    return record;
  }

  // Pure logic matcher for deleteHealthData
  function authorizeDeleteHealthData(currentUser: any, record: any) {
    if (!record) throw new Error("Record not found");
    if (!currentUser) throw new Error("Unauthorized: Authentication required");

    const isOwner = record.userId === currentUser._id;
    const isAdmin = currentUser.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new Error("Unauthorized: You do not have permission to delete this health record");
    }

    return { success: true };
  }

  // Pure logic matcher for getAllHealthData listing
  function filterHealthDataListing(currentUser: any, allRecords: any[]) {
    if (!currentUser) throw new Error("User not found");
    if (currentUser.role === ROLES.ADMIN) {
      return allRecords; // Admin sees all records
    }
    // Standard user and health worker only see their own records in vault
    return allRecords.filter(r => r.userId === currentUser._id);
  }

  describe('Health Record Access by ID (Owner & Privilege Access Matrix)', () => {
    const ownerUser = { _id: 'user-owner', role: ROLES.PUBLIC_USER };
    const strangerUser = { _id: 'user-stranger', role: ROLES.PUBLIC_USER };
    const healthWorker = { _id: 'hw-1', role: ROLES.HEALTH_WORKER };
    const adminUser = { _id: 'admin-1', role: ROLES.ADMIN };

    const sampleRecord = {
      _id: 'record-999',
      userId: 'user-owner',
      type: 'vitals',
      data: { bloodPressure: '120/80', heartRate: 72 },
      timestamp: 1700000000
    };

    it('ALLOWS the owner (public-user) to access their own health record by ID', () => {
      const result = authorizeGetHealthDataById(ownerUser, sampleRecord);
      expect(result).toBeDefined();
      expect(result._id).toBe('record-999');
      expect(result.data.bloodPressure).toBe('120/80');
    });

    it('BLOCKS another non-privileged user from accessing someone else\'s record by ID', () => {
      expect(() => authorizeGetHealthDataById(strangerUser, sampleRecord))
        .toThrow("Unauthorized: You do not have permission to view this health record");
    });

    it('ALLOWS a health worker to access health records by ID for clinical duties', () => {
      const result = authorizeGetHealthDataById(healthWorker, sampleRecord);
      expect(result).toBeDefined();
      expect(result._id).toBe('record-999');
    });

    it('ALLOWS an administrator to access health records by ID', () => {
      const result = authorizeGetHealthDataById(adminUser, sampleRecord);
      expect(result).toBeDefined();
      expect(result._id).toBe('record-999');
    });

    it('fails safely and returns null for non-existent record without leaking metadata', () => {
      const result = authorizeGetHealthDataById(ownerUser, null);
      expect(result).toBeNull();
    });

    it('BLOCKS signed-out callers from retrieving health records', () => {
      expect(() => authorizeGetHealthDataById(null, sampleRecord))
        .toThrow("Unauthorized: Authentication required");
    });
  });

  describe('Health Record Deletion Authorization', () => {
    const ownerUser = { _id: 'user-owner', role: ROLES.PUBLIC_USER };
    const strangerUser = { _id: 'user-stranger', role: ROLES.PUBLIC_USER };
    const adminUser = { _id: 'admin-1', role: ROLES.ADMIN };

    const sampleRecord = {
      _id: 'record-101',
      userId: 'user-owner',
      type: 'symptom'
    };

    it('ALLOWS the owner to delete their own record', () => {
      const res = authorizeDeleteHealthData(ownerUser, sampleRecord);
      expect(res.success).toBe(true);
    });

    it('ALLOWS an administrator to delete records for moderation or compliance', () => {
      const res = authorizeDeleteHealthData(adminUser, sampleRecord);
      expect(res.success).toBe(true);
    });

    it('BLOCKS another user from deleting someone else\'s record', () => {
      expect(() => authorizeDeleteHealthData(strangerUser, sampleRecord))
        .toThrow("Unauthorized: You do not have permission to delete this health record");
    });
  });

  describe('Scoped Health Records Listing', () => {
    const records = [
      { _id: 'r1', userId: 'user-A', type: 'vitals' },
      { _id: 'r2', userId: 'user-B', type: 'symptom' },
      { _id: 'r3', userId: 'user-A', type: 'medication' },
    ];

    it('scopes standard user record listing strictly to their own user ID', () => {
      const userA = { _id: 'user-A', role: ROLES.PUBLIC_USER };
      const userARecords = filterHealthDataListing(userA, records);
      expect(userARecords.length).toBe(2);
      expect(userARecords.every(r => r.userId === 'user-A')).toBe(true);
    });

    it('permits administrator to view global health records for public health surveillance', () => {
      const admin = { _id: 'admin-1', role: ROLES.ADMIN };
      const adminRecords = filterHealthDataListing(admin, records);
      expect(adminRecords.length).toBe(3);
    });
  });

  describe('File Upload Validation in /api/ai/process-report', () => {
    it('rejects oversized files exceeding 10MB limit', async () => {
      const { POST } = await import('@/app/api/ai/process-report/route');

      // Create a mock formData with an oversized file (11MB)
      const fakeFile = {
        name: 'test.png',
        type: 'image/png',
        size: 11 * 1024 * 1024,
      } as any;

      const mockFormData = new Map();
      mockFormData.set('image', fakeFile);

      const req = new NextRequest('http://localhost:3000/api/ai/process-report', {
        method: 'POST',
      });
      req.formData = async () => mockFormData as any;

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('File too large');
    });

    it('rejects disallowed MIME types (e.g., application/pdf or executables)', async () => {
      const { POST } = await import('@/app/api/ai/process-report/route');

      const fakeExe = {
        name: 'bad.exe',
        type: 'application/x-msdownload',
        size: 1024,
      } as any;

      const mockFormData = new Map();
      mockFormData.set('image', fakeExe);

      const req = new NextRequest('http://localhost:3000/api/ai/process-report', {
        method: 'POST',
      });
      req.formData = async () => mockFormData as any;

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid file type');
    });
  });
});
