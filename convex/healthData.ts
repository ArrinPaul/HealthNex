// Convex server functions for health data management
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

// Add health data
export const addHealthData = mutationWithAuth({
  args: {
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
    const { userId, type, data, location, severity, notes } = args;
    return await ctx.db.insert("healthData", {
      userId,
      type,
      data,
      location,
      severity,
      notes,
      timestamp: Date.now(),
    });
  },
});

// Get health data for user
export const getUserHealthData = queryWithAuth({
  args: {
    type: v.optional(v.union(v.literal("symptom"), v.literal("medication"), v.literal("vitals"), v.literal("water_test"))),
  },
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    let query = ctx.db.query("healthData")
      .withIndex("by_user", (q: any) => q.eq("userId", userId));
    
    if (args.type) {
      query = query.filter((q: any) => q.eq(q.field("type"), args.type));
    }
    
    return await query.order("desc").collect();
  },
});

export const getHealthDataById = queryWithAuth({
  args: { id: v.id("healthData") },
  handler: async (ctx: any, args: any) => {
    const { userId, id } = args;

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || (currentUser.role !== ROLES.SUPER_ADMIN && currentUser.role !== ROLES.ADMIN && currentUser.role !== ROLES.HEALTH_WORKER)) {
      throw new Error("Unauthorized: Only admins and health workers can view health data by ID");
    }

    return await ctx.db.get(id);
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

// Update an existing health data record
export const updateHealthData = mutationWithAuth({
  args: {
    id: v.id("healthData"),
    type: v.optional(v.union(v.literal("symptom"), v.literal("medication"), v.literal("vitals"), v.literal("water_test"))),
    data: v.any(),
    severity: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, id, type, data, severity, notes } = args;
    
    const record = await ctx.db.get(id);
    if (!record) {
      throw new Error("Record not found");
    }

    const currentUser = await ctx.db.get(userId);
    const isAdmin = currentUser && (currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === ROLES.ADMIN);
    
    if (record.userId !== userId && !isAdmin) {
      throw new Error("Unauthorized: You cannot edit another user's health records");
    }

    const updates: any = {};
    if (type !== undefined) updates.type = type;
    if (data !== undefined) updates.data = data;
    if (severity !== undefined) updates.severity = severity;
    if (notes !== undefined) updates.notes = notes;
    updates.timestamp = Date.now();

    await ctx.db.patch(id, updates);

    // AUDIT LOG
    await ctx.db.insert("auditLogs", {
      userId,
      targetId: id,
      action: "HEALTH_RECORD_UPDATE",
      details: `${currentUser?.name || "User"} (${currentUser?.role || "unknown"}) updated health record of type ${record.type}`,
      timestamp: Date.now(),
    });

    return id;
  },
});

// Get all health data (for admins) or user's own health data (for standard users)
export const getAllHealthData = queryWithAuth({
  args: {
    type: v.optional(v.union(v.literal("symptom"), v.literal("medication"), v.literal("vitals"), v.literal("water_test"))),
  },
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const currentUser = await ctx.db.get(userId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    const isAdmin = currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === ROLES.ADMIN;
    
    let query;
    if (isAdmin) {
      // Admins get all records
      query = ctx.db.query("healthData");
    } else {
      // Regular users get only their own
      query = ctx.db.query("healthData")
        .withIndex("by_user", (q: any) => q.eq("userId", userId));
    }

    if (args.type) {
      query = query.filter((q: any) => q.eq(q.field("type"), args.type));
    }

    const records = await query.order("desc").collect();
    
    // Resolve user details
    const recordsWithUser = [];
    for (const record of records) {
      const userDoc = await ctx.db.get(record.userId);
      recordsWithUser.push({
        ...record,
        userName: userDoc ? userDoc.name : "Unknown User",
        userEmail: userDoc ? userDoc.email : "",
      });
    }
    
    return recordsWithUser;
  },
});


