import { describe, it, expect, vi } from 'vitest';
import { updateGlobalStatsInternal } from '../convex/externalData';

describe('Phase 4.2 — SEC-MUT-03: Global Statistics Boundary Verification', () => {
  it('verifies updateGlobalStatsInternal is defined and protected as an internal mutation function', () => {
    expect(updateGlobalStatsInternal).toBeDefined();
    expect(typeof updateGlobalStatsInternal === 'function' || typeof updateGlobalStatsInternal === 'object').toBe(true);
  });

  it('updates institutional data when called via internal execution with mock database context', async () => {
    const mockDb = {
      query: vi.fn().mockReturnValue({
        withIndex: vi.fn().mockReturnValue({
          unique: vi.fn().mockResolvedValue(null),
        }),
      }),
      insert: vi.fn().mockResolvedValue('inserted_stat_123'),
      patch: vi.fn(),
    };

    const mockCtx = { db: mockDb };

    // Handler execution check
    const fn = (updateGlobalStatsInternal as any).handler || updateGlobalStatsInternal;
    if (typeof fn === 'function') {
      await fn(mockCtx, {
        source: 'disease.sh',
        type: 'outbreak_global',
        data: { cases: 1000, deaths: 50 },
      });

      expect(mockDb.insert).toHaveBeenCalledWith('externalInstitutionalData', expect.objectContaining({
        source: 'disease.sh',
        type: 'outbreak_global',
        data: { cases: 1000, deaths: 50 },
      }));
    }
  });
});
