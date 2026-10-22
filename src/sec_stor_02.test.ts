process.env.JWT_SECRET = 'fallback-dev-secret-key-change-in-production-minimum-32-chars';

import { describe, it, expect, vi, beforeAll } from 'vitest';
import {
  isStorageIdReferenced,
  recordFailedStorageDeletion,
  retryPendingStorageDeletion,
  getPendingStorageDeletions,
} from '../convex/storageCleanup';

describe('SEC-STOR-02: Storage Cleanup & Durable Retry Queue Unit Tests', () => {
  let JWTService: any;
  let adminToken: string;
  let regularToken: string;
  let healthWorkerToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'fallback-dev-secret-key-change-in-production-minimum-32-chars';
    const jwtMod = await import('@/lib/jwt');
    JWTService = jwtMod.JWTService;

    adminToken = JWTService.generateToken({
      userId: 'admin_user_1',
      email: 'admin@healthnex.org',
      role: 'admin',
    });

    regularToken = JWTService.generateToken({
      userId: 'user_regular',
      email: 'user@healthnex.org',
      role: 'public-user',
    });

    healthWorkerToken = JWTService.generateToken({
      userId: 'user_health_worker',
      email: 'hw@healthnex.org',
      role: 'health-worker',
    });
  });

  it('identifies storage ID referenced in communityReports', async () => {
    const mockCtx = {
      db: {
        query: vi.fn().mockImplementation((table: string) => {
          if (table === 'communityReports') {
            return {
              filter: vi.fn().mockReturnValue({
                first: vi.fn().mockResolvedValue({ _id: 'report_1', attachmentStorageId: 'store_123' }),
              }),
            };
          }
          return {
            filter: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(null),
            }),
          };
        }),
      },
    };

    const referenced = await isStorageIdReferenced(mockCtx, 'store_123');
    expect(referenced).toBe(true);
  });

  it('identifies storage ID referenced in users verification documents', async () => {
    const mockCtx = {
      db: {
        query: vi.fn().mockImplementation((table: string) => {
          if (table === 'users') {
            return {
              filter: vi.fn().mockReturnValue({
                first: vi.fn().mockResolvedValue({ _id: 'user_1', verificationDocStorageId: 'store_cred_456' }),
              }),
            };
          }
          return {
            filter: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(null),
            }),
          };
        }),
      },
    };

    const referenced = await isStorageIdReferenced(mockCtx, 'store_cred_456');
    expect(referenced).toBe(true);
  });

  it('identifies storage ID referenced in healthData records', async () => {
    const mockCtx = {
      db: {
        query: vi.fn().mockImplementation((table: string) => {
          if (table === 'healthData') {
            return {
              filter: vi.fn().mockReturnValue({
                first: vi.fn().mockResolvedValue({ _id: 'health_1', fileStorageId: 'store_health_789' }),
              }),
            };
          }
          return {
            filter: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(null),
            }),
          };
        }),
      },
    };

    const referenced = await isStorageIdReferenced(mockCtx, 'store_health_789');
    expect(referenced).toBe(true);
  });

  it('returns false when storage ID is unreferenced across all tables', async () => {
    const mockCtx = {
      db: {
        query: vi.fn().mockReturnValue({
          filter: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(null),
          }),
        }),
      },
    };

    const referenced = await isStorageIdReferenced(mockCtx, 'store_orphaned_000');
    expect(referenced).toBe(false);
  });

  it('records initial failed deletion with pending status and sanitized error', async () => {
    const mockInsert = vi.fn().mockResolvedValue('pending_entry_1');
    const mockCtx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(null),
          }),
        }),
        insert: mockInsert,
      },
    };

    const id = await recordFailedStorageDeletion(mockCtx, {
      storageId: 'storage_fail_1',
      originTable: 'communityReports',
      originRecordId: 'report_fail_1',
      requestedBy: 'user_123',
      errorMessage: 'Network timeout to storage cluster at https://internal-storage-cluster.domain/api/v1?key=supersecret123',
    });

    expect(id).toBe('pending_entry_1');
    expect(mockInsert).toHaveBeenCalledWith('pendingStorageDeletions', expect.objectContaining({
      storageId: 'storage_fail_1',
      originTable: 'communityReports',
      attempts: 1,
      status: 'pending',
      lastError: expect.not.stringContaining('supersecret123'),
    }));
    expect(mockInsert.mock.calls[0][1].lastError).toContain('[REDACTED_URL]');
  });

  it('increments attempts on existing queue entry and marks exhausted after threshold', async () => {
    const mockPatch = vi.fn().mockResolvedValue(undefined);
    const mockCtx = {
      db: {
        query: vi.fn().mockReturnValue({
          withIndex: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue({
              _id: 'pending_entry_existing',
              storageId: 'storage_fail_repeat',
              attempts: 4,
              status: 'pending',
            }),
          }),
        }),
        patch: mockPatch,
      },
    };

    const id = await recordFailedStorageDeletion(mockCtx, {
      storageId: 'storage_fail_repeat',
      originTable: 'healthData',
      errorMessage: 'Continuous failure',
    });

    expect(id).toBe('pending_entry_existing');
    expect(mockPatch).toHaveBeenCalledWith('pending_entry_existing', expect.objectContaining({
      attempts: 5,
      status: 'exhausted',
      lastError: 'Continuous failure',
    }));
  });

  describe('Authorization and Controlled Admin Recovery', () => {
    it('rejects unauthenticated calls without token', async () => {
      const mockCtx = { db: { get: vi.fn() } };
      const handler = (getPendingStorageDeletions as any)._handler || (getPendingStorageDeletions as any);
      await expect(handler(mockCtx, {})).rejects.toThrow('Unauthorized: Invalid or expired token');
    });

    it('rejects non-admin users from viewing pending storage deletion queue', async () => {
      const mockCtx = {
        db: {
          get: vi.fn().mockResolvedValue({ _id: 'user_regular', role: 'public-user' }),
        },
      };

      const handler = (getPendingStorageDeletions as any)._handler || (getPendingStorageDeletions as any);
      await expect(handler(mockCtx, { token: regularToken })).rejects.toThrow('Unauthorized: Only administrators');
    });

    it('rejects non-admin users from executing retryPendingStorageDeletion', async () => {
      const mockCtx = {
        db: {
          get: vi.fn().mockResolvedValue({ _id: 'user_health_worker', role: 'health-worker' }),
        },
      };

      const handler = (retryPendingStorageDeletion as any)._handler || (retryPendingStorageDeletion as any);
      await expect(handler(mockCtx, { token: healthWorkerToken })).rejects.toThrow('Unauthorized: Only administrators');
    });

    it('successfully processes retry deletion for unreferenced files as Admin', async () => {
      const mockStorageDelete = vi.fn().mockResolvedValue(undefined);
      const mockDbDelete = vi.fn().mockResolvedValue(undefined);
      const mockAuditInsert = vi.fn().mockResolvedValue('audit_1');

      const mockCtx = {
        storage: {
          delete: mockStorageDelete,
        },
        db: {
          get: vi.fn().mockImplementation((id: string) => {
            if (id === 'admin_user_1') return Promise.resolve({ _id: 'admin_user_1', name: 'Admin One', role: 'admin' });
            if (id === 'del_entry_1') return Promise.resolve({
              _id: 'del_entry_1',
              storageId: 'store_clean_1',
              originTable: 'communityReports',
              attempts: 1,
              status: 'pending',
            });
            return Promise.resolve(null);
          }),
          query: vi.fn().mockReturnValue({
            filter: vi.fn().mockReturnValue({
              first: vi.fn().mockResolvedValue(null), // Unreferenced
            }),
          }),
          delete: mockDbDelete,
          insert: mockAuditInsert,
        },
      };

      const handler = (retryPendingStorageDeletion as any)._handler || (retryPendingStorageDeletion as any);
      const result = await handler(mockCtx, { token: adminToken, deletionId: 'del_entry_1' });

      expect(result.processed).toBe(1);
      expect(result.results[0].outcome).toBe('deleted');
      expect(mockStorageDelete).toHaveBeenCalledWith('store_clean_1');
      expect(mockDbDelete).toHaveBeenCalledWith('del_entry_1');
      expect(mockAuditInsert).toHaveBeenCalledWith('auditLogs', expect.objectContaining({
        action: 'STORAGE_CLEANUP_SUCCESS',
      }));
    });

    it('aborts deletion and updates status if file became re-referenced before retry', async () => {
      const mockStorageDelete = vi.fn();
      const mockPatch = vi.fn().mockResolvedValue(undefined);

      const mockCtx = {
        storage: {
          delete: mockStorageDelete,
        },
        db: {
          get: vi.fn().mockImplementation((id: string) => {
            if (id === 'admin_user_1') return Promise.resolve({ _id: 'admin_user_1', name: 'Admin One', role: 'admin' });
            if (id === 'del_entry_2') return Promise.resolve({
              _id: 'del_entry_2',
              storageId: 'store_rereferenced',
              originTable: 'healthData',
              attempts: 1,
              status: 'pending',
            });
            return Promise.resolve(null);
          }),
          query: vi.fn().mockImplementation((table: string) => {
            if (table === 'healthData') {
              return {
                filter: vi.fn().mockReturnValue({
                  first: vi.fn().mockResolvedValue({ _id: 'new_active_health_record' }),
                }),
              };
            }
            return {
              filter: vi.fn().mockReturnValue({
                first: vi.fn().mockResolvedValue(null),
              }),
            };
          }),
          patch: mockPatch,
        },
      };

      const handler = (retryPendingStorageDeletion as any)._handler || (retryPendingStorageDeletion as any);
      const result = await handler(mockCtx, { token: adminToken, deletionId: 'del_entry_2' });

      expect(result.processed).toBe(1);
      expect(result.results[0].outcome).toBe('re_referenced_aborted');
      // Must NOT delete from storage
      expect(mockStorageDelete).not.toHaveBeenCalled();
      expect(mockPatch).toHaveBeenCalledWith('del_entry_2', expect.objectContaining({
        status: 'superseded_or_referenced',
      }));
    });
  });
});
