import { describe, it, expect } from 'vitest';

// Pure logic validator mirroring convex/diseases.ts:reportDisease boundary
function validateAndPrepareDiseaseReport(args: {
  disease: any;
  cases: any;
  location: any;
  latitude: any;
  longitude: any;
  severity: string;
  userId: string;
}) {
  const { userId, ...reportArgs } = args;

  if (typeof reportArgs.latitude !== 'number' || reportArgs.latitude < -90 || reportArgs.latitude > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90');
  }
  if (typeof reportArgs.longitude !== 'number' || reportArgs.longitude < -180 || reportArgs.longitude > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180');
  }
  if (typeof reportArgs.cases !== 'number' || reportArgs.cases < 1 || !Number.isInteger(reportArgs.cases) || reportArgs.cases > 1000000) {
    throw new Error('Invalid cases: must be a positive integer between 1 and 1,000,000');
  }
  const disease = String(reportArgs.disease || '').trim().slice(0, 150);
  const location = String(reportArgs.location || '').trim().slice(0, 200);
  if (!disease) throw new Error('Disease name is required');
  if (!location) throw new Error('Location is required');

  return {
    ...reportArgs,
    disease,
    location,
    reportedBy: userId,
    timestamp: Date.now(),
    status: 'pending',
    confirmedCases: reportArgs.cases,
    suspectedCases: 0,
    deaths: 0,
    recovered: 0,
  };
}

describe('Phase 3: Convex Mutation Boundaries & Input Validation', () => {
  it('rejects latitude out of bounds (< -90 or > 90)', () => {
    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: 'Cholera',
        cases: 10,
        location: 'Zone A',
        latitude: 95,
        longitude: 45,
        severity: 'high',
      })
    ).toThrow(/Invalid latitude/i);

    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: 'Cholera',
        cases: 10,
        location: 'Zone A',
        latitude: -95,
        longitude: 45,
        severity: 'high',
      })
    ).toThrow(/Invalid latitude/i);
  });

  it('rejects longitude out of bounds (< -180 or > 180)', () => {
    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: 'Cholera',
        cases: 10,
        location: 'Zone A',
        latitude: 25,
        longitude: 190,
        severity: 'high',
      })
    ).toThrow(/Invalid longitude/i);

    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: 'Cholera',
        cases: 10,
        location: 'Zone A',
        latitude: 25,
        longitude: -190,
        severity: 'high',
      })
    ).toThrow(/Invalid longitude/i);
  });

  it('rejects non-positive, non-integer, or out-of-range cases', () => {
    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: 'Cholera',
        cases: 0,
        location: 'Zone A',
        latitude: 25,
        longitude: 45,
        severity: 'high',
      })
    ).toThrow(/Invalid cases/i);

    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: 'Cholera',
        cases: 3.5,
        location: 'Zone A',
        latitude: 25,
        longitude: 45,
        severity: 'high',
      })
    ).toThrow(/Invalid cases/i);

    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: 'Cholera',
        cases: 2000000,
        location: 'Zone A',
        latitude: 25,
        longitude: 45,
        severity: 'high',
      })
    ).toThrow(/Invalid cases/i);
  });

  it('rejects empty disease name or location strings', () => {
    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: '   ',
        cases: 5,
        location: 'Zone A',
        latitude: 25,
        longitude: 45,
        severity: 'high',
      })
    ).toThrow(/Disease name is required/i);

    expect(() =>
      validateAndPrepareDiseaseReport({
        userId: 'users_123',
        disease: 'Cholera',
        cases: 5,
        location: '   ',
        latitude: 25,
        longitude: 45,
        severity: 'high',
      })
    ).toThrow(/Location is required/i);
  });

  it('successfully sanitizes inputs and prepares validated outbreak document', () => {
    const res = validateAndPrepareDiseaseReport({
      userId: 'users_123',
      disease: '  Malaria  ',
      cases: 12,
      location: '  Sector 4  ',
      latitude: 12.9716,
      longitude: 77.5946,
      severity: 'medium',
    });

    expect(res).toMatchObject({
      disease: 'Malaria',
      location: 'Sector 4',
      cases: 12,
      confirmedCases: 12,
      latitude: 12.9716,
      longitude: 77.5946,
      severity: 'medium',
      reportedBy: 'users_123',
      status: 'pending',
    });
  });
});
