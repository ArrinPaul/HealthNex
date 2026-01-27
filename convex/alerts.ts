// Convex functions for health alerts
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new alert
export const createAlert = mutation({
  args: {
    type: v.union(v.literal("health_alert"), v.literal("weather_warning"), v.literal("water_quality"), v.literal("outbreak")),
    title: v.string(),
    message: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      radius: v.number(),
    })),
    expiresAt: v.optional(v.number()),
    source: v.union(v.literal("system"), v.literal("admin"), v.literal("ai_prediction")),
  },
  handler: async (ctx, args) => {
    const alertId = await ctx.db.insert("alerts", {
      ...args,
      createdAt: Date.now(),
      isActive: true,
    });
    return alertId;
  },
});

// Get active alerts
export const getActiveAlerts = query({
  args: {
    type: v.optional(v.string()),
    severity: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("alerts")
      .withIndex("by_active", (q) => q.eq("isActive", true));

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    if (args.severity) {
      query = query.filter((q) => q.eq(q.field("severity"), args.severity));
    }

    const alerts = await query
      .order("desc")
      .take(args.limit || 50);

    return alerts;
  },
});

// Deactivate an alert
export const deactivateAlert = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { isActive: false });
  },
});
