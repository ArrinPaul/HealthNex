// Convex server functions for health data management
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add health data
export const addHealthData = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("symptom"), v.literal("medication"), v.literal("vitals"), v.literal("water_test")),
    data: v.any(),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string())
    })),
    severity: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("healthData", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Get health data for user
export const getUserHealthData = query({
  args: {
    userId: v.id("users"),
    type: v.optional(v.union(v.literal("symptom"), v.literal("medication"), v.literal("vitals"), v.literal("water_test"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("healthData")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));
    
    if (args.type) {
      query = ctx.db
        .query("healthData")
        .withIndex("by_user_and_type", (q) => 
          q.eq("userId", args.userId).eq("type", args.type)
        );
    }

    const results = await query
      .order("desc")
      .take(args.limit || 50);
    
    return results;
  },
});

// Get recent health data (for dashboard)
export const getRecentHealthData = query({
  args: {
    userId: v.id("users"),
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hoursAgo = Date.now() - (args.hours || 24) * 60 * 60 * 1000;
    
    return await ctx.db
      .query("healthData")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("timestamp"), hoursAgo))
      .order("desc")
      .take(100);
  },
});