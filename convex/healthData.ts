// Convex server functions for health data management
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";

// Add health data
export const addHealthData = mutationWithAuth({
  args: {
    // userId is extracted from token
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
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("healthData", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Get health data for user
export const getUserHealthData = queryWithAuth({
// ... (rest of getUserHealthData)

export const getHealthDataById = query({
  args: { id: v.id("healthData") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get recent health data (for dashboard)
export const getRecentHealthData = queryWithAuth({
  args: {
    hours: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    // userId is injected by queryWithAuth
    const { userId } = args as any;
    const hoursAgo = Date.now() - (args.hours || 24) * 60 * 60 * 1000;
    
    return await ctx.db
      .query("healthData")
        .withIndex("by_user", (q: any) => q.eq("userId", userId))
        .filter((q: any) => q.gte(q.field("timestamp"), hoursAgo))
      .order("desc")
      .take(100);
  },
});