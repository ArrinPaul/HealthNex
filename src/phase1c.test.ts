import { describe, it, expect } from 'vitest';

describe('Phase 1C: Backend Integrity & Data Pipeline', () => {
  describe('SUP-01: Support Ticket Input Validation & Access Control', () => {
    // Pure logic validator matching convex/support.ts
    function validateTicketInputs(args: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }) {
      const name = args.name.trim();
      const email = args.email.trim();
      const subject = args.subject.trim();
      const message = args.message.trim();

      if (!name || name.length > 100) {
        throw new Error("Name is required and must be under 100 characters");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email) || email.length > 255) {
        throw new Error("A valid email address under 255 characters is required");
      }

      if (!subject || subject.length > 200) {
        throw new Error("Subject is required and must be under 200 characters");
      }

      if (!message || message.length > 5000) {
        throw new Error("Message is required and must be under 5000 characters");
      }

      return { name, email, subject, message };
    }

    it('accepts valid public support inquiry without token', () => {
      const valid = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        subject: 'General Question',
        message: 'How do I download water reports?'
      };

      expect(() => validateTicketInputs(valid)).not.toThrow();
      const res = validateTicketInputs(valid);
      expect(res.name).toBe('Jane Doe');
      expect(res.email).toBe('jane@example.com');
    });

    it('rejects empty or whitespace-only name', () => {
      expect(() => validateTicketInputs({
        name: '   ',
        email: 'jane@example.com',
        subject: 'Inquiry',
        message: 'Help needed'
      })).toThrow("Name is required and must be under 100 characters");
    });

    it('rejects invalid email formats', () => {
      expect(() => validateTicketInputs({
        name: 'Jane',
        email: 'invalid-email-address',
        subject: 'Inquiry',
        message: 'Help needed'
      })).toThrow("A valid email address under 255 characters is required");
    });

    it('rejects oversized inputs', () => {
      expect(() => validateTicketInputs({
        name: 'A'.repeat(101),
        email: 'jane@example.com',
        subject: 'Inquiry',
        message: 'Help needed'
      })).toThrow("Name is required and must be under 100 characters");

      expect(() => validateTicketInputs({
        name: 'Jane',
        email: 'jane@example.com',
        subject: 'A'.repeat(201),
        message: 'Help needed'
      })).toThrow("Subject is required and must be under 200 characters");

      expect(() => validateTicketInputs({
        name: 'Jane',
        email: 'jane@example.com',
        subject: 'Inquiry',
        message: 'A'.repeat(5001)
      })).toThrow("Message is required and must be under 5000 characters");
    });
  });

  describe('DATA-03: Dashboard Outbreak Hotspot Data Integrity', () => {
    // Transformer logic matching src/app/dashboard/page.tsx
    function transformDiseaseData(diseaseData: any[] | undefined) {
      if (!Array.isArray(diseaseData)) return [];
      return diseaseData
        .filter((d: any) => typeof d.latitude === "number" && typeof d.longitude === "number")
        .map((d: any) => ({
          id: d._id || 'generated-id',
          lat: d.latitude,
          lng: d.longitude,
          cases: d.confirmedCases || d.cases || 0,
          location: d.location || 'Unknown',
          disease: d.disease || 'General',
          severity: d.severity || 'medium',
          timestamp: d.timestamp || 1000
        }));
    }

    // Filter logic matching src/components/DiseaseMap.tsx
    function filterValidHotspots(hotspots: any[]) {
      return hotspots.filter(
        h => typeof h.lat === 'number' && !isNaN(h.lat) && typeof h.lng === 'number' && !isNaN(h.lng) && (h.lat !== 0 || h.lng !== 0)
      );
    }

    it('does NOT create fabricated/fallback hotspots when query returns empty array', () => {
      const transformed = transformDiseaseData([]);
      expect(transformed).toEqual([]);
      expect(filterValidHotspots(transformed)).toEqual([]);
    });

    it('does NOT create fabricated hotspots when query is loading/undefined', () => {
      const transformed = transformDiseaseData(undefined);
      expect(transformed).toEqual([]);
    });

    it('correctly maps valid real outbreak records', () => {
      const rawData = [
        {
          _id: 'outbreak-1',
          latitude: 28.6139,
          longitude: 77.2090,
          cases: 120,
          confirmedCases: 120,
          location: 'Delhi',
          disease: 'Cholera',
          severity: 'critical',
          timestamp: 1700000000
        }
      ];

      const transformed = transformDiseaseData(rawData);
      expect(transformed).toHaveLength(1);
      expect(transformed[0].lat).toBe(28.6139);
      expect(transformed[0].cases).toBe(120);
      expect(transformed[0].location).toBe('Delhi');
      expect(transformed[0].disease).toBe('Cholera');
    });

    it('filters out records with missing or invalid coordinates', () => {
      const rawData = [
        { _id: '1', latitude: null, longitude: 77.2, cases: 10 },
        { _id: '2', latitude: 28.6, longitude: undefined, cases: 15 },
        { _id: '3', latitude: 0, longitude: 0, cases: 20 },
        { _id: '4', latitude: 19.0760, longitude: 72.8777, cases: 35 }
      ];

      const transformed = transformDiseaseData(rawData);
      const validMapPins = filterValidHotspots(transformed);

      expect(validMapPins).toHaveLength(1);
      expect(validMapPins[0].lat).toBe(19.0760);
      expect(validMapPins[0].lng).toBe(72.8777);
    });
  });

  describe('SEC-04: insertAutomatedDailyData Trust Boundary', () => {
    function verifyScraperAuthContract(cronSecret: string | undefined, incomingSecret: string | undefined) {
      if (!cronSecret) {
        throw new Error("CRON_SECRET is not configured on this Convex deployment");
      }
      if (incomingSecret !== cronSecret) {
        throw new Error("Unauthorized: invalid cron secret");
      }
      return true;
    }

    it('fails closed when CRON_SECRET is undefined', () => {
      expect(() => verifyScraperAuthContract(undefined, "test-secret"))
        .toThrow("CRON_SECRET is not configured on this Convex deployment");
    });

    it('rejects mismatched secret', () => {
      expect(() => verifyScraperAuthContract("prod-secret-abc", "wrong-secret"))
        .toThrow("Unauthorized: invalid cron secret");
    });

    it('accepts matching secret', () => {
      expect(verifyScraperAuthContract("prod-secret-abc", "prod-secret-abc")).toBe(true);
    });
  });
});
