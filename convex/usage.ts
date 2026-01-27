// Convex functions for usage tracking
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Track feature usage
export const trackUsage = mutation({
  args: {
    userId: v.optional(v.id("users")),
    feature: v.string(),
    status: v.string(),
    tokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("usageTracking", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Get usage statistics
export const getUsageStats = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAgo = Date.now() - (args.days || 7) * 24 * 60 * 60 * 1000;
    
    const logs = await ctx.db
      .query("usageTracking")
      .filter((q) => q.gte(q.field("timestamp"), daysAgo))
      .collect();
    
    return {
      totalCalls: logs.length,
      successCount: logs.filter(l => l.status === "success").length,
      errorCount: logs.filter(l => l.status === "error").length,
      byFeature: logs.reduce((acc, log) => {
        acc[log.feature] = (acc[log.feature] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});
