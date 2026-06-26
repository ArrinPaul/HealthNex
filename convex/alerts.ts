import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

export const broadcastAlert = mutationWithAuth({
  args: {
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("health_alert"), v.literal("weather_warning"), v.literal("water_quality"), v.literal("outbreak")),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    radius: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, radius, ...alertData } = args as any;
    
    // Check if user is health-worker or above
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.HEALTH_WORKER && user.role !== ROLES.ADMIN && user.role !== ROLES.SUPER_ADMIN)) {
      throw new Error("Unauthorized to broadcast alerts");
    }

    const alertId = await ctx.db.insert("alerts", {
      ...alertData,
      isActive: true,
      createdAt: Date.now(),
      source: user.role === ROLES.HEALTH_WORKER ? "system" : "admin",
      location: radius ? {
        latitude: 20.5937, // Default baseline center coordinates of India
        longitude: 78.9629,
        radius: radius
      } : undefined
    });

    // AUDIT LOG
    await ctx.db.insert("auditLogs", {
      userId,
      targetId: alertId,
      action: "ALERT_BROADCAST",
      details: `${user.name} broadcasted a ${args.severity} severity alert: ${args.title}`,
      timestamp: Date.now(),
    });

    return alertId;
  },
});

export const getActiveAlerts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .order("desc")
      .collect();
  },
});
