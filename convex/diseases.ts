// Convex functions for disease outbreak tracking
// Run: npx convex dev to generate the server code

import { mutation, query, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES, ROLE_HIERARCHY, UserRole } from "./roles";
import { internal } from "./_generated/api";

// Report a disease outbreak
export const reportDisease = mutationWithAuth({
  args: {
    disease: v.string(),
    cases: v.number(),
    location: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    symptoms: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, ...reportArgs } = args;
    const id = await ctx.db.insert("diseaseOutbreaks", {
      ...reportArgs,
      reportedBy: userId,
      timestamp: Date.now(),
      status: "pending",
      confirmedCases: reportArgs.cases,
      suspectedCases: 0,
      deaths: 0,
      recovered: 0,
    });
    return id;
  },
});

// Get disease outbreaks by region or all
export const getDiseaseOutbreaks = query({
  args: {
    region: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("contained"), v.literal("resolved"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("diseaseOutbreaks");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    } else {
      query = query.filter((q) => q.neq(q.field("status"), "pending"));
    }
    
    if (args.region) {
      query = query.filter((q) => q.eq(q.field("location"), args.region));
    }
    
    const outbreaks = await query
      .order("desc")
      .take(args.limit || 50);
    
    return outbreaks;
  },
});

// Get disease statistics
export const getDiseaseStats = query({
  args: {
    timeRange: v.optional(v.string()), // "24h", "7d", "30d"
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    let cutoffTime = now - 30 * 24 * 60 * 60 * 1000; // 30 days default
    
    if (args.timeRange === "24h") {
      cutoffTime = now - 24 * 60 * 60 * 1000;
    } else if (args.timeRange === "7d") {
      cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
    }
    
    const outbreaks = await ctx.db
      .query("diseaseOutbreaks")
      .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
      .collect();
    
    // Calculate statistics
    const stats = {
      totalOutbreaks: outbreaks.length,
      totalCases: outbreaks.reduce((sum, o) => sum + o.confirmedCases, 0),
      totalDeaths: outbreaks.reduce((sum, o) => sum + (o.deaths || 0), 0),
      totalRecovered: outbreaks.reduce((sum, o) => sum + (o.recovered || 0), 0),
      activeOutbreaks: outbreaks.filter(o => o.status === "active").length,
      criticalOutbreaks: outbreaks.filter(o => o.severity === "critical").length,
      byDisease: {} as Record<string, number>,
      byLocation: {} as Record<string, number>,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
    };
    
    outbreaks.forEach(outbreak => {
      stats.byDisease[outbreak.disease] = (stats.byDisease[outbreak.disease] || 0) + outbreak.confirmedCases;
      stats.byLocation[outbreak.location] = (stats.byLocation[outbreak.location] || 0) + outbreak.confirmedCases;
      stats.bySeverity[outbreak.severity]++;
    });
    
    return stats;
  },
});

// Update outbreak status
export const updateOutbreakStatus = mutationWithAuth({
  args: {
    outbreakId: v.id("diseaseOutbreaks"),
    status: v.union(v.literal("active"), v.literal("contained"), v.literal("resolved")),
    confirmedCases: v.optional(v.number()),
    suspectedCases: v.optional(v.number()),
    deaths: v.optional(v.number()),
    recovered: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, outbreakId, ...updates } = args;

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.HEALTH_WORKER)) {
      throw new Error("Unauthorized: Only admins and health workers can update outbreak status");
    }

    await ctx.db.patch(outbreakId, updates);
  },
});

// Get outbreaks near a location
export const getOutbreaksNearLocation = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    radiusKm: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const radius = args.radiusKm || 50; // 50km default
    
    const allOutbreaks = await ctx.db
      .query("diseaseOutbreaks")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
    
    // Filter by distance (simple approximation)
    const nearbyOutbreaks = allOutbreaks.filter(outbreak => {
      const latDiff = Math.abs(outbreak.latitude - args.latitude);
      const lonDiff = Math.abs(outbreak.longitude - args.longitude);
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // approx km
      return distance <= radius;
    });
    
    return nearbyOutbreaks;
  },
});

// Seed real historical outbreaks from IDSP report bulletins (admin only)
export const seedHistoricalOutbreaks = mutationWithAuth({
  args: {
    force: v.optional(v.boolean()),
    csvData: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const userId: string = args.userId;
    const force: boolean | undefined = args.force;
    const csvData: string | undefined = args.csvData;

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Only admins can seed historical outbreaks");
    }

    const existingCount = (await ctx.db.query("diseaseOutbreaks").collect()).length;
    if (existingCount > 0 && !force) {
      return { success: false, message: "Outbreaks already seeded. Use force: true to overwrite." };
    }

    // Clear existing outbreaks if force is set
    if (force) {
      const allOutbreaks = await ctx.db.query("diseaseOutbreaks").collect();
      for (const outbreak of allOutbreaks) {
        await ctx.db.delete(outbreak._id);
      }
    }

    let realOutbreaks: any[] = [];

    if (csvData) {
      // Parse CSV Data
      const lines = csvData.trim().split("\n");
      if (lines.length > 1) {
        const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ''));
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Custom CSV line parser handling double-quoted strings
          const values: string[] = [];
          let currentVal = "";
          let insideQuotes = false;
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
              currentVal = "";
            } else {
              currentVal += char;
            }
          }
          values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

          const outbreak: any = {};
          headers.forEach((header, index) => {
            const val = values[index];
            if (val === undefined) return;
            
            if (
              header === "cases" || 
              header === "latitude" || 
              header === "longitude" || 
              header === "confirmedCases" || 
              header === "suspectedCases" || 
              header === "deaths" || 
              header === "recovered" || 
              header === "timestamp"
            ) {
              outbreak[header] = Number(val);
            } else if (header === "symptoms") {
              outbreak[header] = val ? val.split(";").map(s => s.trim()) : [];
            } else {
              outbreak[header] = val;
            }
          });

          // Ensure mandatory types and fields
          outbreak.disease = outbreak.disease || "Unknown";
          outbreak.cases = outbreak.cases || 0;
          outbreak.location = outbreak.location || "Unknown";
          outbreak.latitude = outbreak.latitude || 0;
          outbreak.longitude = outbreak.longitude || 0;
          outbreak.reportedBy = outbreak.reportedBy || "system";
          outbreak.timestamp = outbreak.timestamp || Date.now();
          
          // Enforce severity types
          const sev = outbreak.severity;
          if (sev === "low" || sev === "medium" || sev === "high" || sev === "critical") {
            outbreak.severity = sev;
          } else {
            outbreak.severity = "medium";
          }

          // Enforce status types
          const stat = outbreak.status;
          if (stat === "active" || stat === "contained" || stat === "resolved") {
            outbreak.status = stat;
          } else {
            outbreak.status = "resolved";
          }

          outbreak.confirmedCases = outbreak.confirmedCases || outbreak.cases || 0;
          outbreak.suspectedCases = outbreak.suspectedCases || 0;
          outbreak.deaths = outbreak.deaths || 0;
          outbreak.recovered = outbreak.recovered || 0;

          realOutbreaks.push(outbreak);
        }
      }
    }

    // Throw an error if no valid CSV data is provided
    if (realOutbreaks.length === 0) {
      return { success: false, message: "No valid CSV data provided. Hardcoded fallback data has been permanently removed." };
    }
    for (const outbreak of realOutbreaks) {
      await ctx.db.insert("diseaseOutbreaks", outbreak);
    }

    return { success: true, count: realOutbreaks.length };
  }
});

function requireCronSecret(secret: string | undefined) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    throw new Error("CRON_SECRET is not configured on this Convex deployment");
  }
  if (secret !== expected) {
    throw new Error("Unauthorized: invalid cron secret");
  }
}

// Cron-only mutation to clear historical seed data. Requires CRON_SECRET
// (set via `npx convex env set CRON_SECRET <value>`) to match the value the
// scraper route sends, so it can't be called by an arbitrary Convex client.
export const clearHistoricalData = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    requireCronSecret(args.secret);
    const historicalOutbreaks = await ctx.db
      .query("diseaseOutbreaks")
      .filter((q) => q.eq(q.field("reportedBy"), "system") || q.eq(q.field("reportedBy"), "SYSTEM_CRON_AUTO_SYNC"))
      .collect();

    for (const outbreak of historicalOutbreaks) {
      await ctx.db.delete(outbreak._id);
    }
  }
});

// Cron-only mutation to safely write the fetched data to the DB
export const insertAutomatedDailyData = mutation({
  args: {
    secret: v.string(),
    disease: v.string(),
    cases: v.number(),
    deaths: v.number(),
    recovered: v.number(),
    latitude: v.number(),
    longitude: v.number(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    requireCronSecret(args.secret);
    const existingOutbreak = await ctx.db
      .query("diseaseOutbreaks")
      .filter((q) => q.eq(q.field("reportedBy"), "SYSTEM_CRON_AUTO_SYNC"))
      .filter((q) => q.eq(q.field("disease"), args.disease))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    const severity = args.cases > 5000 ? "critical" : args.cases > 1000 ? "high" : "medium";

    if (existingOutbreak) {
      await ctx.db.patch(existingOutbreak._id, {
        cases: args.cases,
        confirmedCases: args.cases,
        deaths: args.deaths,
        recovered: args.recovered,
        severity: severity,
        timestamp: Date.now(),
      });
    } else {
      await ctx.db.insert("diseaseOutbreaks", {
        disease: args.disease,
        cases: args.cases,
        confirmedCases: args.cases,
        suspectedCases: 0,
        deaths: args.deaths,
        recovered: args.recovered,
        latitude: args.latitude,
        longitude: args.longitude,
        location: args.location,
        severity: severity,
        status: "active",
        timestamp: Date.now(),
        reportedBy: "SYSTEM_CRON_AUTO_SYNC",
        notes: "AI-Ingested from live global unstructured news telemetry.",
      });
    }
  }
});



export const getPendingOutbreaks = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("diseaseOutbreaks")
      .filter((q: any) => q.eq(q.field("status"), "pending"))
      .order("desc")
      .collect();
  }
});

export const approvePendingOutbreak = mutationWithAuth({
  args: {
    outbreakId: v.id("diseaseOutbreaks"),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, outbreakId } = args;
    
    // Auth check
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.HEALTH_WORKER)) {
      throw new Error("Unauthorized");
    }

    const pending = await ctx.db.get(outbreakId);
    if (!pending || pending.status !== "pending") {
      throw new Error("Outbreak not found or not pending");
    }

    const existingActive = await ctx.db
      .query("diseaseOutbreaks")
      .filter((q: any) => q.eq(q.field("status"), "active"))
      .filter((q: any) => q.eq(q.field("disease"), pending.disease))
      .filter((q: any) => q.eq(q.field("location"), pending.location))
      .first();

    if (existingActive) {
      await ctx.db.patch(existingActive._id, {
        cases: existingActive.cases + pending.cases,
        confirmedCases: existingActive.confirmedCases + pending.cases,
        timestamp: Date.now(),
      });
      await ctx.db.delete(pending._id);
    } else {
      await ctx.db.patch(pending._id, {
        status: "active",
        timestamp: Date.now(),
      });
    }
  }
});
