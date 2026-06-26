// Convex functions for community health reports
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

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
    const { userId, title, description, category, location, severity } = args;
    
    const reportId = await ctx.db.insert("communityReports", {
      userId,
      title,
      description,
      category,
      location,
      severity,
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
    category: v.optional(v.union(v.literal("water"), v.literal("health"), v.literal("outbreak"), v.literal("environmental"), v.literal("safety"))),
    status: v.optional(v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    let q;
    if (args.category) {
      q = ctx.db.query("communityReports").withIndex("by_category", (q) => q.eq("category", args.category!));
    } else {
      q = ctx.db.query("communityReports");
    }
    
    if (args.status) {
      q = q.filter((query) => query.eq(query.field("status"), args.status));
    }
    
    return await q.order("desc").collect();
  },
});

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
    const { userId, reportId, status } = args as any;
    
    // Auth check
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN && user.role !== ROLES.HEALTH_WORKER)) {
      throw new Error("Unauthorized to update reports");
    }

    const report = await ctx.db.get(reportId);
    if (!report) throw new Error("Report not found");

    await ctx.db.patch(reportId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // AUDIT LOG
    await ctx.db.insert("auditLogs", {
      userId,
      targetId: reportId,
      action: "REPORT_STATUS_CHANGE",
      details: `${user.name} changed status of report "${report.title}" to ${status}`,
      timestamp: Date.now(),
    });
  },
});
