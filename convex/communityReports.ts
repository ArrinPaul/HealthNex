// Convex functions for community health reports
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth } from "./lib/withAuth";

// Create a new community report
export const createReport = mutationWithAuth({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(v.literal("water"), v.literal("health"), v.literal("outbreak"), v.literal("environmental"), v.literal("safety")),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string()
    }),
    severity: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5)),
  },
  handler: async (ctx: any, args: any) => {
    // userId is injected by mutationWithAuth
    const { userId } = args as any;
    
    const reportId = await ctx.db.insert("communityReports", {
      ...args,
      userId: userId,
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
// ... (rest of getReports)

export const getReportById = query({
  args: { reportId: v.id("communityReports") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.reportId);
  },
});

// Update report status
export const updateReportStatus = mutationWithAuth({
  args: {
    reportId: v.id("communityReports"),
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved")),
  },
  handler: async (ctx: any, args: any) => {
    // Ideally we should check if the user is an admin or the owner
    // For now we just require auth
    await ctx.db.patch(args.reportId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
