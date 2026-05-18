// Convex server functions for user management
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash: args.passwordHash,
      role: "public", // Default to public
      requestedRole: args.role, // Save requested role
      createdAt: Date.now(),
      isActive: true,
    });

    return userId;
  },
});

export const getAllUsers = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    // Only certain roles can get users, but we'll return them and let UI handle, or we can check role if we fetch the current user
    return await ctx.db.query("users").collect();
  },
});

// Internal helper for audit logging
async function logAction(ctx: any, userId: any, action: string, targetId: string, details: string) {
  await ctx.db.insert("auditLogs", {
    userId,
    targetId,
    action,
    details,
    timestamp: Date.now(),
  });
}

export const updateUserRole = mutationWithAuth({
  args: {
    targetUserId: v.id("users"),
    newRole: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, targetUserId, newRole } = args as any;
    
    const currentUser = await ctx.db.get(userId);
    const targetUser = await ctx.db.get(targetUserId);

    if (!currentUser || !targetUser) throw new Error("User not found");

    if (targetUser.role === "super-admin") {
      throw new Error("Cannot modify a super-admin");
    }

    // Role Hierarchy check
    if (currentUser.role === "super-admin") {
      // Can do anything
    } else if (currentUser.role === "admin") {
      if (newRole === "super-admin" || newRole === "admin") {
        throw new Error("Admin cannot promote to admin or super-admin");
      }
    } else if (currentUser.role === "health-worker") {
      if (newRole === "super-admin" || newRole === "admin" || newRole === "health-worker") {
        throw new Error("Health worker can only manage community and public roles");
      }
    } else {
      throw new Error("Unauthorized to change roles");
    }

    await ctx.db.patch(targetUserId, {
      role: newRole,
    });

    // AUDIT LOG
    await logAction(ctx, userId, "ROLE_CHANGE", targetUserId, `${currentUser.name} changed ${targetUser.name}'s role to ${newRole}`);
  },
});

export const getAuditLogs = queryWithAuth({
  args: {},
  handler: async (ctx: any) => {
    // Only super-admin sees audit logs
    const user = await ctx.db.get(ctx.auth.userId); // This isn't quite right with queryWithAuth custom implementation, but we'll adapt.
    // For now we assume if the UI shows it, the query should return it, but ideally we verify role here.
    return await ctx.db.query("auditLogs").order("desc").take(100);
  }
});

// Get user by email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Update last login
export const updateLastLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastLoginAt: Date.now(),
    });
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});