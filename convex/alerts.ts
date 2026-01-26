// Convex functions for health alerts
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new alert
export const createAlert = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    message: v.string(),
    severity: v.string(),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      radius: v.number(),
    })),
    expiresAt: v.optional(v.number()),
    source: v.string(),
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
