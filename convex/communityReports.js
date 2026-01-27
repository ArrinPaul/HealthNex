"use strict";
// Convex functions for community health reports
// Run: npx convex dev to generate the server code
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReportStatus = exports.getReports = exports.createReport = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Create a new community report
exports.createReport = (0, server_1.mutation)({
    args: {
        userId: values_1.v.optional(values_1.v.id("users")),
        title: values_1.v.string(),
        description: values_1.v.string(),
        category: values_1.v.string(), // "water", "health", "outbreak", etc.
        location: values_1.v.object({
            latitude: values_1.v.number(),
            longitude: values_1.v.number(),
            address: values_1.v.string()
        }),
        severity: values_1.v.number(),
    },
    handler: async (ctx, args) => {
        const reportId = await ctx.db.insert("communityReports", {
            ...args,
            userId: args.userId || (await ctx.db.query("users").first())?._id, // Fallback for demo
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
exports.getReports = (0, server_1.query)({
    args: {
        category: values_1.v.optional(values_1.v.string()),
        limit: values_1.v.optional(values_1.v.number()),
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
exports.updateReportStatus = (0, server_1.mutation)({
    args: {
        reportId: values_1.v.id("communityReports"),
        status: values_1.v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.reportId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});
