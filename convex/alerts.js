"use strict";
// Convex functions for health alerts
// Run: npx convex dev to generate the server code
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateAlert = exports.getActiveAlerts = exports.createAlert = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Create a new alert
exports.createAlert = (0, server_1.mutation)({
    args: {
        type: values_1.v.string(),
        title: values_1.v.string(),
        message: values_1.v.string(),
        severity: values_1.v.string(),
        location: values_1.v.optional(values_1.v.object({
            latitude: values_1.v.number(),
            longitude: values_1.v.number(),
            radius: values_1.v.number(),
        })),
        expiresAt: values_1.v.optional(values_1.v.number()),
        source: values_1.v.string(),
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
exports.getActiveAlerts = (0, server_1.query)({
    args: {
        type: values_1.v.optional(values_1.v.string()),
        severity: values_1.v.optional(values_1.v.string()),
        limit: values_1.v.optional(values_1.v.number()),
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
exports.deactivateAlert = (0, server_1.mutation)({
    args: { alertId: values_1.v.id("alerts") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.alertId, { isActive: false });
    },
});
