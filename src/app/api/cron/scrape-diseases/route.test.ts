import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, parseHeadlineCases } from "./route";

// Mock convex/nextjs
const mockFetchMutation = vi.fn();
vi.mock("convex/nextjs", () => ({
  fetchMutation: (...args: any[]) => mockFetchMutation(...args),
}));

// Mock api
vi.mock("../../../../../convex/_generated/api", () => ({
  api: {
    diseases: {
      clearHistoricalData: "diseases:clearHistoricalData",
      insertAutomatedDailyData: "diseases:insertAutomatedDailyData",
    },
  },
}));

describe("scrape-diseases route", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("Authentication (SEC-03)", () => {
    it("returns 500 when CRON_SECRET is not configured", async () => {
      delete process.env.CRON_SECRET;

      const req = new NextRequest("http://localhost:3000/api/cron/scrape-diseases", {
        method: "GET",
        headers: {
          authorization: "Bearer some-token",
        },
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(500);
      expect(json.error).toBe("Cron secret is not configured");
      expect(mockFetchMutation).not.toHaveBeenCalled();
    });

    it("returns 401 when Authorization header is missing", async () => {
      process.env.CRON_SECRET = "super-secret-key-123";

      const req = new NextRequest("http://localhost:3000/api/cron/scrape-diseases", {
        method: "GET",
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
      expect(mockFetchMutation).not.toHaveBeenCalled();
    });

    it("returns 401 when Authorization header contains incorrect secret", async () => {
      process.env.CRON_SECRET = "super-secret-key-123";

      const req = new NextRequest("http://localhost:3000/api/cron/scrape-diseases", {
        method: "GET",
        headers: {
          authorization: "Bearer wrong-secret",
        },
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
      expect(mockFetchMutation).not.toHaveBeenCalled();
    });

    it("does not call clearHistoricalData when request succeeds", async () => {
      process.env.CRON_SECRET = "super-secret-key-123";

      // Mock fetch for RSS
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => "<rss><channel><item><title>Mock News</title></item></channel></rss>",
      } as any);

      const req = new NextRequest("http://localhost:3000/api/cron/scrape-diseases", {
        method: "GET",
        headers: {
          authorization: "Bearer super-secret-key-123",
        },
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);

      // Verify clearHistoricalData was never called
      const clearCalls = mockFetchMutation.mock.calls.filter(
        call => call[0] === "diseases:clearHistoricalData"
      );
      expect(clearCalls.length).toBe(0);

      global.fetch = originalFetch;
    });
  });

  describe("Case Extraction Logic (DATA-01)", () => {
    const casesRegex = /([0-9,]+)\s*(cases|infections|deaths|patients)/i;

    it("returns parsed integer for valid numeric case matches", () => {
      const match = "450 cases reported in Kerala".match(casesRegex);
      expect(parseHeadlineCases(match)).toBe(450);
    });

    it("correctly parses numbers with commas", () => {
      const match = "Over 1,250 cases detected".match(casesRegex);
      expect(parseHeadlineCases(match)).toBe(1250);
    });

    it("returns null when regex match is null (no number or case keyword)", () => {
      const match = "Cholera outbreak reported in Delhi".match(casesRegex);
      expect(match).toBeNull();
      expect(parseHeadlineCases(match)).toBeNull();
    });

    it("returns null for non-positive or invalid numbers", () => {
      const fakeMatch = ["0 cases", "0", "cases"] as unknown as RegExpMatchArray;
      expect(parseHeadlineCases(fakeMatch)).toBeNull();
    });

    it("does NOT insert records when headline lacks numeric case counts", async () => {
      process.env.CRON_SECRET = "super-secret-key-123";

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => `
          <rss>
            <channel>
              <item><title>Dengue outbreak hits Delhi hospital</title></item>
              <item><title>Cholera alert in Mumbai after flood</title></item>
            </channel>
          </rss>
        `,
      } as any);

      const req = new NextRequest("http://localhost:3000/api/cron/scrape-diseases", {
        method: "GET",
        headers: {
          authorization: "Bearer super-secret-key-123",
        },
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.extractedCount).toBe(0);
      expect(mockFetchMutation).not.toHaveBeenCalled();

      global.fetch = originalFetch;
    });

    it("inserts record with exact numeric case count and clean disease name without false labels", async () => {
      process.env.CRON_SECRET = "super-secret-key-123";

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => `
          <rss>
            <channel>
              <title>Google News</title>
              <item><title>Dengue: 320 cases reported across Delhi</title></item>
            </channel>
          </rss>
        `,
      } as any);

      const req = new NextRequest("http://localhost:3000/api/cron/scrape-diseases", {
        method: "GET",
        headers: {
          authorization: "Bearer super-secret-key-123",
        },
      });

      const res = await GET(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.extractedCount).toBe(1);
      expect(mockFetchMutation).toHaveBeenCalledWith(
        "diseases:insertAutomatedDailyData",
        expect.objectContaining({
          disease: "Dengue", // Must NOT contain "(Verified News)"
          cases: 320,        // Must match exact headline number, not random
          location: "DELHI",
        })
      );

      global.fetch = originalFetch;
    });
  });
});
