import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

const MAX_RETRY_ATTEMPTS = 5;

/**
 * Helper to sanitize error messages so that raw URLs, credentials, or secrets
 * are never stored in the database.
 */
function sanitizeErrorMessage(error: any): string {
  if (!error) return "Storage deletion failed";
  const raw = typeof error === "string" ? error : (error?.message || String(error));
  // Strip URLs (http:// or https://)
  const noUrls = raw.replace(/https?:\/\/[^\s]+/gi, "[REDACTED_URL]");
  // Strip bearer tokens or key-like sequences
  const noSecrets = noUrls.replace(/(bearer\s+[a-zA-Z0-9._-]+|key=[a-zA-Z0-9._-]+)/gi, "[REDACTED_SECRET]");
  // Limit to 300 characters
  return noSecrets.slice(0, 300);
}

/**
 * Helper to check whether a given storageId is still referenced by any active record
 * across all tables in the application.
 */
export async function isStorageIdReferenced(ctx: any, storageId: string): Promise<boolean> {
  // 1. Check communityReports
  const report = await ctx.db
    .query("communityReports")
    .filter((q: any) => q.eq(q.field("attachmentStorageId"), storageId))
    .first();
  if (report) return true;

  // 2. Check users (verification documents)
  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("verificationDocStorageId"), storageId))
    .first();
  if (user) return true;

  // 3. Check healthData (top-level or nested data fields)
  const healthRecord = await ctx.db
    .query("healthData")
    .filter((q: any) =>
      q.or(
        q.eq(q.field("fileStorageId"), storageId),
        q.eq(q.field("data.fileStorageId"), storageId),
        q.eq(q.field("data.storageId"), storageId)
      )
    )
    .first();
  if (healthRecord) return true;

  return false;
}

/**
 * Record a failed storage deletion into the durable pendingStorageDeletions table.
 */
export async function recordFailedStorageDeletion(
  ctx: any,
  params: {
    storageId: string;
    originTable: "healthData" | "communityReports" | "users";
    originRecordId?: string;
    requestedBy?: string;
    errorMessage?: string;
  }
) {
  // Check if an entry for this storageId already exists
  const existing = await ctx.db
    .query("pendingStorageDeletions")
    .withIndex("by_storageId", (q: any) => q.eq("storageId", params.storageId))
    .first();

  const sanitizedErr = sanitizeErrorMessage(params.errorMessage);

  if (existing) {
    await ctx.db.patch(existing._id, {
      attempts: existing.attempts + 1,
      lastAttemptAt: Date.now(),
      lastError: sanitizedErr,
      status: existing.attempts + 1 >= MAX_RETRY_ATTEMPTS ? "exhausted" : "pending",
    });
    return existing._id;
  }

  return await ctx.db.insert("pendingStorageDeletions", {
    storageId: params.storageId,
    originTable: params.originTable,
    originRecordId: params.originRecordId,
    requestedBy: params.requestedBy,
    attempts: 1,
    lastAttemptAt: Date.now(),
    lastError: sanitizedErr,
    status: "pending",
    createdAt: Date.now(),
  });
}

/**
 * Admin-only query to view pending storage deletions without leaking raw download URLs.
 */
export const getPendingStorageDeletions = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Only administrators can view storage cleanup queues");
    }

    const items = await ctx.db
      .query("pendingStorageDeletions")
      .withIndex("by_status")
      .order("desc")
      .collect();

    // Map to safe DTO without internal system data
    return items.map((item: any) => ({
      id: item._id,
      originTable: item.originTable,
      originRecordId: item.originRecordId,
      attempts: item.attempts,
      lastAttemptAt: item.lastAttemptAt,
      lastError: item.lastError,
      status: item.status,
      createdAt: item.createdAt,
    }));
  },
});

/**
 * Retry a specific pending storage deletion or all pending deletions.
 * Enforces strict Admin authorization, re-reference verification, and idempotency.
 */
export const retryPendingStorageDeletion = mutationWithAuth({
  args: {
    deletionId: v.optional(v.id("pendingStorageDeletions")),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, deletionId } = args;
    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized: Only administrators can execute storage deletion retries");
    }

    let itemsToProcess = [];
    if (deletionId) {
      const item = await ctx.db.get(deletionId);
      if (!item) throw new Error("Pending storage deletion record not found");
      itemsToProcess = [item];
    } else {
      itemsToProcess = await ctx.db
        .query("pendingStorageDeletions")
        .withIndex("by_status", (q: any) => q.eq("status", "pending"))
        .take(50);
    }

    const results = [];

    for (const item of itemsToProcess) {
      // 1. Safety check: Ensure storage object is not referenced by any active entity
      const isReferenced = await isStorageIdReferenced(ctx, item.storageId);
      if (isReferenced) {
        await ctx.db.patch(item._id, {
          status: "superseded_or_referenced",
          lastAttemptAt: Date.now(),
          lastError: "Deletion aborted: Storage object has been re-referenced in the database",
        });
        results.push({ id: item._id, outcome: "re_referenced_aborted" });
        continue;
      }

      // 2. Attempt storage deletion
      try {
        if (ctx.storage) {
          await ctx.storage.delete(item.storageId);
        }
        // Success: Clean up the queue entry
        await ctx.db.delete(item._id);

        await ctx.db.insert("auditLogs", {
          userId,
          targetId: item._id,
          action: "STORAGE_CLEANUP_SUCCESS",
          details: `Admin ${currentUser.name} successfully cleaned up pending storage object from ${item.originTable}`,
          timestamp: Date.now(),
        });

        results.push({ id: item._id, outcome: "deleted" });
      } catch (err: any) {
        const nextAttempts = item.attempts + 1;
        const exhausted = nextAttempts >= MAX_RETRY_ATTEMPTS;

        const sanitizedErr = sanitizeErrorMessage(err);
        await ctx.db.patch(item._id, {
          attempts: nextAttempts,
          lastAttemptAt: Date.now(),
          lastError: sanitizedErr,
          status: exhausted ? "exhausted" : "pending",
        });

        results.push({
          id: item._id,
          outcome: "failed",
          attempts: nextAttempts,
          exhausted,
        });
      }
    }

    return { processed: results.length, results };
  },
});
