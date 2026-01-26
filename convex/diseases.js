"use strict";
// Convex functions for disease outbreak tracking
// Run: npx convex dev to generate the server code
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutbreaksNearLocation = exports.updateOutbreakStatus = exports.getDiseaseStats = exports.getDiseaseOutbreaks = exports.reportDisease = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Report a disease outbreak
exports.reportDisease = (0, server_1.mutation)({
    args: {
        disease: values_1.v.string(),
        cases: values_1.v.number(),
        location: values_1.v.string(),
        latitude: values_1.v.number(),
        longitude: values_1.v.number(),
        severity: values_1.v.union(values_1.v.literal("low"), values_1.v.literal("medium"), values_1.v.literal("high"), values_1.v.literal("critical")),
        symptoms: values_1.v.optional(values_1.v.array(values_1.v.string())),
        reportedBy: values_1.v.string(), // userId
        notes: values_1.v.optional(values_1.v.string()),
    },
    handler: async (ctx, args) => {
        const id = await ctx.db.insert("diseaseOutbreaks", {
            ...args,
            timestamp: Date.now(),
            status: "active",
            confirmedCases: args.cases,
            suspectedCases: 0,
            deaths: 0,
            recovered: 0,
        });
        return id;
    },
});
// Get disease outbreaks by region or all
exports.getDiseaseOutbreaks = (0, server_1.query)({
    args: {
        region: values_1.v.optional(values_1.v.string()),
        status: values_1.v.optional(values_1.v.string()),
        limit: values_1.v.optional(values_1.v.number()),
    },
    handler: async (ctx, args) => {
        let query = ctx.db.query("diseaseOutbreaks");
        if (args.status) {
            query = query.filter((q) => q.eq(q.field("status"), args.status));
        }
        if (args.region) {
            query = query.filter((q) => q.eq(q.field("location"), args.region));
        }
        const outbreaks = await query
            .order("desc")
            .take(args.limit || 50);
        return outbreaks;
    },
});
// Get disease statistics
exports.getDiseaseStats = (0, server_1.query)({
    args: {
        timeRange: values_1.v.optional(values_1.v.string()), // "24h", "7d", "30d"
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        let cutoffTime = now - 30 * 24 * 60 * 60 * 1000; // 30 days default
        if (args.timeRange === "24h") {
            cutoffTime = now - 24 * 60 * 60 * 1000;
        }
        else if (args.timeRange === "7d") {
            cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        }
        const outbreaks = await ctx.db
            .query("diseaseOutbreaks")
            .filter((q) => q.gte(q.field("timestamp"), cutoffTime))
            .collect();
        // Calculate statistics
        const stats = {
            totalOutbreaks: outbreaks.length,
            totalCases: outbreaks.reduce((sum, o) => sum + o.confirmedCases, 0),
            totalDeaths: outbreaks.reduce((sum, o) => sum + (o.deaths || 0), 0),
            totalRecovered: outbreaks.reduce((sum, o) => sum + (o.recovered || 0), 0),
            activeOutbreaks: outbreaks.filter(o => o.status === "active").length,
            criticalOutbreaks: outbreaks.filter(o => o.severity === "critical").length,
            byDisease: {},
            byLocation: {},
            bySeverity: {
                low: 0,
                medium: 0,
                high: 0,
                critical: 0,
            },
        };
        outbreaks.forEach(outbreak => {
            stats.byDisease[outbreak.disease] = (stats.byDisease[outbreak.disease] || 0) + outbreak.confirmedCases;
            stats.byLocation[outbreak.location] = (stats.byLocation[outbreak.location] || 0) + outbreak.confirmedCases;
            stats.bySeverity[outbreak.severity]++;
        });
        return stats;
    },
});
// Update outbreak status
exports.updateOutbreakStatus = (0, server_1.mutation)({
    args: {
        outbreakId: values_1.v.id("diseaseOutbreaks"),
        status: values_1.v.union(values_1.v.literal("active"), values_1.v.literal("contained"), values_1.v.literal("resolved")),
        confirmedCases: values_1.v.optional(values_1.v.number()),
        suspectedCases: values_1.v.optional(values_1.v.number()),
        deaths: values_1.v.optional(values_1.v.number()),
        recovered: values_1.v.optional(values_1.v.number()),
    },
    handler: async (ctx, args) => {
        const { outbreakId, ...updates } = args;
        await ctx.db.patch(outbreakId, updates);
    },
});
// Get outbreaks near a location
exports.getOutbreaksNearLocation = (0, server_1.query)({
    args: {
        latitude: values_1.v.number(),
        longitude: values_1.v.number(),
        radiusKm: values_1.v.optional(values_1.v.number()),
    },
    handler: async (ctx, args) => {
        const radius = args.radiusKm || 50; // 50km default
        const allOutbreaks = await ctx.db
            .query("diseaseOutbreaks")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();
        // Filter by distance (simple approximation)
        const nearbyOutbreaks = allOutbreaks.filter(outbreak => {
            const latDiff = Math.abs(outbreak.latitude - args.latitude);
            const lonDiff = Math.abs(outbreak.longitude - args.longitude);
            const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 111; // approx km
            return distance <= radius;
        });
        return nearbyOutbreaks;
    },
});
