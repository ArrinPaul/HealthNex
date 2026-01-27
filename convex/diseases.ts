// Convex functions for disease outbreak tracking
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Report a disease outbreak
export const reportDisease = mutation({
  args: {
    disease: v.string(),
    cases: v.number(),
    location: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    symptoms: v.optional(v.array(v.string())),
    reportedBy: v.string(), // userId
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("diseaseOutbreaks", {
      ...args,
      timestamp: Date.now(),
      status: "active",
      confirmedCases: args.cases,
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
export const updateOutbreakStatus = mutation({
  args: {
    outbreakId: v.id("diseaseOutbreaks"),
    status: v.union(v.literal("active"), v.literal("contained"), v.literal("resolved")),
    confirmedCases: v.optional(v.number()),
    suspectedCases: v.optional(v.number()),
    deaths: v.optional(v.number()),
    recovered: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { outbreakId, ...updates } = args;
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
