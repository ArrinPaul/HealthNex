import { mutation, query, internalMutation, internalQuery, action } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES, ROLE_HIERARCHY, VERIFICATION_STATUS, UserRole } from "./roles";
import { internal } from "./_generated/api";
import { recordFailedStorageDeletion } from "./storageCleanup";
import bcrypt from "bcryptjs";

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
      : ROLES.PUBLIC_USER;

    // Public users get immediate access, so the account's actual role starts
    // (and stays) at public-user. A health-worker request only takes effect
    // once an admin verifies it (see verifyUser) — it must never be granted
    // up front, so it's tracked separately in verificationStatus/pending queue.
    const initialVerificationStatus = requestedRole === ROLES.HEALTH_WORKER
      ? VERIFICATION_STATUS.PENDING
      : VERIFICATION_STATUS.NONE;

    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      passwordHash: args.passwordHash,
      role: ROLES.PUBLIC_USER,
      requestedRole: requestedRole,
      verificationDocUrl: args.verificationDocUrl,
      verificationStatus: initialVerificationStatus,
      createdAt: Date.now(),
      isActive: true,
      onboardingCompleted: false,
    });

    return userId;
  },
});

// Trusted seeding path for dev/test accounts (scripts/seed-accounts.ts,
// scripts/seed-admin.ts). Unlike createUser, this sets the role directly and
// marks the account pre-approved. internalMutation so it is only reachable
// via `npx convex run` (deploy-key CLI auth) or another Convex function —
// never from a public client, since that would let anyone self-grant admin.
export const seedUserWithRole = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    if (!VALID_ROLES.includes(args.role as UserRole)) {
      throw new Error(`Invalid role: ${args.role}. Valid roles: ${VALID_ROLES.join(', ')}`);
    }

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
      role: args.role,
      requestedRole: args.role,
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      createdAt: Date.now(),
      isActive: true,
      onboardingCompleted: true,
    });

    return userId;
  },
});

export const getAllUsers = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const currentUser = await ctx.db.get(userId);
    
    if (!currentUser || (currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view all users");
    }

    const users = await ctx.db.query("users").collect();
    return users.map((u: any) => {
      const { passwordHash: _hash, ...safeUser } = u;
      return safeUser;
    });
  },
});

export const getPendingVerifications = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const currentUser = await ctx.db.get(userId);
    
    if (!currentUser || (currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view pending verifications");
    }

    const pending = await ctx.db
      .query("users")
      .withIndex("by_verification_status", (q: any) => q.eq("verificationStatus", VERIFICATION_STATUS.PENDING))
      .collect();

    return pending.map((u: any) => {
      const { passwordHash: _hash, ...safeUser } = u;
      return safeUser;
    });
  },
});

// Generate an authenticated Convex upload URL for health worker credentials
export const generateCredentialUploadUrl = mutationWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const currentUser = await ctx.db.get(userId);
    if (!currentUser) throw new Error("User not found");

    // Only allow users who are applying for health worker or are health worker / admin
    const canUpload = currentUser.requestedRole === ROLES.HEALTH_WORKER ||
                      currentUser.role === ROLES.HEALTH_WORKER ||
                      currentUser.role === ROLES.ADMIN;

    if (!canUpload) {
      throw new Error("Unauthorized: Only healthcare worker applicants or personnel can upload credentials");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Securely attach an uploaded credential document to the authenticated caller's account
export const attachVerificationDocument = mutationWithAuth({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, storageId, fileName } = args;
    const currentUser = await ctx.db.get(userId);
    if (!currentUser) throw new Error("User not found");

    // Clean up superseded previous credential storage object if one existed
    const previousStorageId = currentUser.verificationDocStorageId;
    if (previousStorageId && previousStorageId !== storageId && ctx.storage) {
      try {
        await ctx.storage.delete(previousStorageId);
      } catch (err: any) {
        console.warn(`Failed to delete superseded credential storage object ${previousStorageId}:`, err);
        await recordFailedStorageDeletion(ctx, {
          storageId: previousStorageId,
          originTable: "users",
          originRecordId: userId,
          requestedBy: userId,
          errorMessage: err?.message,
        });
      }
    }

    // Sanitize filename — strip path traversal characters and limit length
    const sanitizedFileName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 120) || "credential_document";

    await ctx.db.patch(userId, {
      verificationDocStorageId: storageId,
      verificationDocName: sanitizedFileName,
      verificationDocUrl: sanitizedFileName, // Preserved for legacy display compatibility
      requestedRole: ROLES.HEALTH_WORKER,
      verificationStatus: VERIFICATION_STATUS.PENDING,
    });

    // AUDIT LOG
    await logAction(
      ctx,
      userId,
      "CREDENTIAL_DOCUMENT_ATTACHED",
      userId,
      `${currentUser.name} uploaded verification credential: ${sanitizedFileName}`
    );

    return { success: true };
  },
});

// Admin-only query to resolve signed, short-lived download URL for verification documents
export const getVerificationDocumentUrl = queryWithAuth({
  args: { targetUserId: v.id("users") },
  handler: async (ctx: any, args: any) => {
    const { userId, targetUserId } = args;

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Only administrators can view verification documents");
    }

    const targetUser = await ctx.db.get(targetUserId);
    if (!targetUser) {
      throw new Error("Target user not found");
    }

    const storageId = targetUser.verificationDocStorageId;
    if (!storageId) {
      return {
        url: null,
        fileName: targetUser.verificationDocName || targetUser.verificationDocUrl || null,
        isLegacy: true
      };
    }

    let downloadUrl: string | null = null;
    if (ctx.storage) {
      try {
        downloadUrl = await ctx.storage.getUrl(storageId);
      } catch (storageErr) {
        console.warn(`Failed to generate storage URL for ${storageId}:`, storageErr);
      }
    }

    return {
      url: downloadUrl,
      fileName: targetUser.verificationDocName || "credential_document",
      isLegacy: false
    };
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

    if (!currentUser || (currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can verify users");
    }

    if (!targetUser) throw new Error("Target user not found");

    const patch: any = {
      verificationStatus: status,
    };

    if (status === VERIFICATION_STATUS.VERIFIED) {
      patch.role = targetUser.requestedRole || ROLES.PUBLIC_USER;
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
// One-off migration utility (scripts/migrate-accounts.ts). internalMutation
// so it's only reachable via `npx convex run`, never from a public client.
export const migrateOnboarding = internalMutation({
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

    // Role Hierarchy check — Admin is the top tier and can modify anyone, including other admins.
    const currentUserLevel = ROLE_HIERARCHY[currentUser.role as UserRole] || 0;
    const targetUserLevel = ROLE_HIERARCHY[targetUser.role as UserRole] || 0;
    const newRoleLevel = ROLE_HIERARCHY[newRole as UserRole] || 0;

    if (currentUserLevel <= targetUserLevel && currentUser.role !== ROLES.ADMIN) {
      throw new Error("You can only modify users with a lower role than yours");
    }

    if (newRoleLevel >= currentUserLevel && currentUser.role !== ROLES.ADMIN) {
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
    
    if (!currentUser || (currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view audit logs");
    }

    return await ctx.db.query("auditLogs").order("desc").take(100);
  }
});

// Look up a user by email including the password hash. internalQuery so the
// hash is never reachable by any external client — only verifyCredentials
// below (and other Convex functions) can call this.
export const getUserByEmail = internalQuery({
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
      requestedRole: user.requestedRole,
      isActive: user.isActive,
      verificationStatus: user.verificationStatus,
      onboardingCompleted: user.onboardingCompleted,
    };
  },
});

// Public login entry point. Verifies the password inside Convex so the
// password hash never leaves the deployment — returns the safe user object
// on success, or null on any failure (unknown email or wrong password).
export const verifyCredentials = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<{
    _id: string;
    email: string;
    name: string;
    role?: string;
    requestedRole?: string;
    isActive?: boolean;
    verificationStatus?: string;
    onboardingCompleted?: boolean;
  } | null> => {
    const user = await ctx.runQuery(internal.users.getUserByEmail, { email: args.email });
    if (!user) return null;

    const isValid = await bcrypt.compare(args.password, user.passwordHash);
    if (!isValid) return null;

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return safeUser;
  },
});

// Get user by email (admin only - returns full profile)
export const getUserByEmailFull = queryWithAuth({
  args: { email: v.string() },
  handler: async (ctx: any, args: any) => {
    const { userId, email } = args;

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || (currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can look up users by email");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", email))
      .first();

    if (!user) return null;
    const { passwordHash: _hash, ...safeUser } = user;
    return safeUser;
  },
});

// Update last login for the calling (token-verified) user
export const updateLastLogin = mutationWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
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
    if (!currentUser || (currentUser.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can look up users by ID");
    }

    const targetUser = await ctx.db.get(targetUserId);
    if (!targetUser) return null;
    const { passwordHash: _hash, ...safeUser } = targetUser;
    return safeUser;
  },
});

// Get own profile (any authenticated user) - passwordHash is never returned
export const getSelf = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const { passwordHash: _hash, ...safeUser } = user;
    return safeUser;
  },
});

// Complete onboarding — saves all profile fields at once for the calling
// (token-verified) user
export const completeOnboarding = mutationWithAuth({
  args: {
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
  handler: async (ctx: any, args: any) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(args.userId, {
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

// Update own profile — allows authenticated users to update their personal details
// without escalating privileges or modifying sensitive account controls.
export const updateProfile = mutationWithAuth({
  args: {
    name: v.optional(v.string()),
    locationAddress: v.optional(v.string()),
    newPasswordHash: v.optional(v.string()),
    bloodGroup: v.optional(v.string()),
    occupation: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, name, locationAddress, newPasswordHash, bloodGroup, occupation } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const patch: any = {};
    if (typeof name === "string") {
      const trimmed = name.trim();
      if (!trimmed || trimmed.length > 100) {
        throw new Error("Name is required and must be under 100 characters");
      }
      patch.name = trimmed;
    }

    if (typeof locationAddress === "string") {
      const trimmedLoc = locationAddress.trim().slice(0, 200);
      patch.location = {
        latitude: user.location?.latitude ?? 0,
        longitude: user.location?.longitude ?? 0,
        address: trimmedLoc,
        state: user.location?.state,
        district: user.location?.district,
      };
    }

    if (typeof bloodGroup === "string") {
      patch.bloodGroup = bloodGroup.trim().slice(0, 10);
    }

    if (typeof occupation === "string") {
      patch.occupation = occupation.trim().slice(0, 100);
    }

    if (typeof newPasswordHash === "string" && newPasswordHash.length > 0) {
      patch.passwordHash = newPasswordHash;
    }

    // Critical Security Invariant: NEVER permit role, requestedRole, verificationStatus,
    // or isActive to be modified via updateProfile.
    await ctx.db.patch(userId, patch);
    return { success: true };
  },
});