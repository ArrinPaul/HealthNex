// Convex functions for community health reports
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new community report
export const createReport = mutation({
  args: {
    userId: v.optional(v.id("users")),
    title: v.string(),
    description: v.string(),
    category: v.string(), // "water", "health", "outbreak", etc.
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string()
    }),
    severity: v.number(),
  },
  handler: async (ctx, args) => {
    const reportId = await ctx.db.insert("communityReports", {
      ...args,
      userId: args.userId || (await ctx.db.query("users").first())?._id as any, // Fallback for demo
      status: "open",
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return reportId;
  },
});

// Get all community reports
export const getReports = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("communityReports");

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    const reports = await query
      .order("desc")
      .take(args.limit || 50);

    return reports;
  },
});

// Update report status
export const updateReportStatus = mutation({
  args: {
    reportId: v.id("communityReports"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reportId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
