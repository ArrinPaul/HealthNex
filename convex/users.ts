import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES, ROLE_HIERARCHY, VERIFICATION_STATUS, UserRole } from "./roles";

const VALID_ROLES = Object.values(ROLES);

// Create a new user
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.optional(v.string()),
    verificationDocUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const requestedRole = (args.role && VALID_ROLES.includes(args.role as UserRole))
      ? args.role as UserRole
      : ROLES.PUBLIC;

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash: args.passwordHash,
      role: requestedRole,
      requestedRole: requestedRole,
      verificationDocUrl: args.verificationDocUrl,
      verificationStatus: VERIFICATION_STATUS.NONE,
      createdAt: Date.now(),
      isActive: true,
      onboardingCompleted: false,
    });

    return userId;
  },
});

export const getAllUsers = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const currentUser = await ctx.db.get(userId);
    
    if (!currentUser || (currentUser.role !== ROLES.SUPER_ADMIN && currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view all users");
    }

    return await ctx.db.query("users").collect();
  },
});

export const getPendingVerifications = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const currentUser = await ctx.db.get(userId);
    
    if (!currentUser || (currentUser.role !== ROLES.SUPER_ADMIN && currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view pending verifications");
    }

    return await ctx.db
      .query("users")
      .withIndex("by_verification_status", (q: any) => q.eq("verificationStatus", VERIFICATION_STATUS.PENDING))
      .collect();
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

export const verifyUser = mutationWithAuth({
  args: {
    targetUserId: v.id("users"),
    status: v.union(v.literal(VERIFICATION_STATUS.VERIFIED), v.literal(VERIFICATION_STATUS.REJECTED)),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, targetUserId, status, adminNotes } = args;
    
    const currentUser = await ctx.db.get(userId);
    const targetUser = await ctx.db.get(targetUserId);

    if (!currentUser || (currentUser.role !== ROLES.SUPER_ADMIN && currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can verify users");
    }

    if (!targetUser) throw new Error("Target user not found");

    const patch: any = {
      verificationStatus: status,
    };

    if (status === VERIFICATION_STATUS.VERIFIED) {
      patch.role = targetUser.requestedRole || ROLES.COMMUNITY_USER;
    }

    await ctx.db.patch(targetUserId, patch);

    // AUDIT LOG
    await logAction(
      ctx, 
      userId, 
      "USER_VERIFICATION", 
      targetUserId, 
      `${currentUser.name} ${status} ${targetUser.name}'s request for ${targetUser.requestedRole} role. Notes: ${adminNotes || "None"}`
    );

    return { success: true };
  },
});

// One-time migration: set onboardingCompleted for existing users
export const migrateOnboarding = mutation({
  args: {
    email: v.string(),
    onboardingCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) throw new Error(`User not found: ${args.email}`);

    await ctx.db.patch(user._id, {
      onboardingCompleted: args.onboardingCompleted,
    });

    return { success: true, userId: user._id };
  },
});

export const updateUserRole = mutationWithAuth({
  args: {
    targetUserId: v.id("users"),
    newRole: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, targetUserId, newRole } = args;
    
    if (!VALID_ROLES.includes(newRole as UserRole)) {
      throw new Error(`Invalid role: ${newRole}. Valid roles: ${VALID_ROLES.join(', ')}`);
    }

    const currentUser = await ctx.db.get(userId);
    const targetUser = await ctx.db.get(targetUserId);

    if (!currentUser || !targetUser) throw new Error("User not found");

    if (targetUser.role === ROLES.SUPER_ADMIN) {
      throw new Error("Cannot modify a super-admin");
    }

    // Role Hierarchy check
    const currentUserLevel = ROLE_HIERARCHY[currentUser.role as UserRole] || 0;
    const targetUserLevel = ROLE_HIERARCHY[targetUser.role as UserRole] || 0;
    const newRoleLevel = ROLE_HIERARCHY[newRole as UserRole] || 0;

    if (currentUserLevel <= targetUserLevel && currentUser.role !== ROLES.SUPER_ADMIN) {
      throw new Error("You can only modify users with a lower role than yours");
    }

    if (newRoleLevel >= currentUserLevel && currentUser.role !== ROLES.SUPER_ADMIN) {
      throw new Error("You cannot promote someone to your level or higher");
    }

    await ctx.db.patch(targetUserId, {
      role: newRole,
      requestedRole: newRole,
    });

    // AUDIT LOG
    await logAction(ctx, userId, "ROLE_CHANGE", targetUserId, `${currentUser.name} changed ${targetUser.name}'s role to ${newRole}`);
  },
});

export const getAuditLogs = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const currentUser = await ctx.db.get(userId);
    
    if (!currentUser || (currentUser.role !== ROLES.SUPER_ADMIN && currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view audit logs");
    }

    return await ctx.db.query("auditLogs").order("desc").take(100);
  }
});

// Get user by email for login (public but returns minimal fields only)
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      passwordHash: user.passwordHash,
      role: user.role,
      isActive: user.isActive,
      verificationStatus: user.verificationStatus,
      onboardingCompleted: user.onboardingCompleted,
    };
  },
});

// Get user by email (admin only - returns full profile)
export const getUserByEmailFull = queryWithAuth({
  args: { email: v.string() },
  handler: async (ctx: any, args: any) => {
    const { userId, email } = args;

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || (currentUser.role !== ROLES.SUPER_ADMIN && currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can look up users by email");
    }

    return await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();
  },
});

// Update last login (public - called during login flow)
export const updateLastLogin = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastLoginAt: Date.now(),
    });
  },
});

// Get user by ID (admin only)
export const getUser = queryWithAuth({
  args: { targetUserId: v.id("users") },
  handler: async (ctx: any, args: any) => {
    const { userId, targetUserId } = args;

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || (currentUser.role !== ROLES.SUPER_ADMIN && currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can look up users by ID");
    }

    return await ctx.db.get(targetUserId);
  },
});

// Get own profile (any authenticated user)
export const getSelf = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    return await ctx.db.get(userId);
  },
});

// Complete onboarding — saves all profile fields at once
export const completeOnboarding = mutation({
  args: {
    token: v.string(),
    dateOfBirth: v.string(),
    gender: v.string(),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string()),
      state: v.optional(v.string()),
      district: v.optional(v.string()),
    }),
    bloodGroup: v.string(),
    medicalConditions: v.array(v.string()),
    occupation: v.string(),
  },
  handler: async (ctx, args) => {
    // Decode token to get userId
    let userId: string;
    try {
      const parts = args.token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      userId = payload.userId;
    } catch {
      throw new Error("Invalid token");
    }

    const user = await ctx.db.get(userId as any);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId as any, {
      onboardingCompleted: true,
      dateOfBirth: args.dateOfBirth,
      gender: args.gender,
      location: args.location,
      bloodGroup: args.bloodGroup,
      medicalConditions: args.medicalConditions,
      occupation: args.occupation,
    });

    return { success: true };
  },
});