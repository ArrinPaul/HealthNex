"use strict";
// Convex server functions for health data management
// Run: npx convex dev to generate the server code
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentHealthData = exports.getUserHealthData = exports.addHealthData = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Add health data
exports.addHealthData = (0, server_1.mutation)({
    args: {
        userId: values_1.v.id("users"),
        type: values_1.v.string(),
        data: values_1.v.any(),
        location: values_1.v.optional(values_1.v.object({
            latitude: values_1.v.number(),
            longitude: values_1.v.number(),
            address: values_1.v.optional(values_1.v.string())
        })),
        severity: values_1.v.optional(values_1.v.number()),
        notes: values_1.v.optional(values_1.v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("healthData", {
            ...args,
            timestamp: Date.now(),
        });
    },
});
// Get health data for user
exports.getUserHealthData = (0, server_1.query)({
    args: {
        userId: values_1.v.id("users"),
        type: values_1.v.optional(values_1.v.string()),
        limit: values_1.v.optional(values_1.v.number()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db
            .query("healthData")
            .withIndex("by_user", (q) => q.eq("userId", args.userId));
        if (args.type) {
            query = ctx.db
                .query("healthData")
                .withIndex("by_user_and_type", (q) => q.eq("userId", args.userId).eq("type", args.type));
        }
        const results = await query
            .order("desc")
            .take(args.limit || 50);
        return results;
    },
});
// Get recent health data (for dashboard)
exports.getRecentHealthData = (0, server_1.query)({
    args: {
        userId: values_1.v.id("users"),
        hours: values_1.v.optional(values_1.v.number()),
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
