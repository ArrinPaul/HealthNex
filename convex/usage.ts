// Convex functions for usage tracking
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

// Track feature usage
export const trackUsage = mutationWithAuth({
  args: {
    feature: v.string(),
    status: v.string(),
    tokens: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, feature, status, tokens } = args;

    await ctx.db.insert("usageTracking", {
      userId,
      feature,
      status,
      tokens,
      timestamp: Date.now(),
    });
  },
});

// Get usage statistics (admin only)
export const getUsageStats = queryWithAuth({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, days } = args;

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view usage stats");
    }

    const daysAgo = Date.now() - (days || 7) * 24 * 60 * 60 * 1000;
    
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
