// Convex functions for community health reports
// Run: npx convex dev to generate the server code

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";
import { recordFailedStorageDeletion } from "./storageCleanup";

// Helper to strip raw storage identifiers from public-facing report outputs
function sanitizeReport(report: any) {
  if (!report) return null;
  const { attachmentStorageId, ...safeReport } = report;
  return {
    ...safeReport,
    hasAttachment: Boolean(attachmentStorageId),
  };
}

// Generate single-use upload URL for report attachments
export const generateAttachmentUploadUrl = mutationWithAuth({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Clean up orphaned storage object if report creation fails
export const cleanupOrphanedStorage = mutationWithAuth({
  args: { storageId: v.id("_storage") },
  handler: async (ctx: any, args: any) => {
    const { storageId } = args;
    // Safety check: ensure the storage ID is not attached to an active report
    const attached = await ctx.db
      .query("communityReports")
      .filter((q: any) => q.eq(q.field("attachmentStorageId"), storageId))
      .first();
    if (attached) {
      throw new Error("Cannot delete storage object that is attached to an existing report");
    }
    if (ctx.storage) {
      await ctx.storage.delete(storageId);
    }
    return { success: true };
  },
});

// Create a new community report with optional validated attachment
export const createReport = mutationWithAuth({
  args: {
    title: v.string(),
    description: v.string(),
    category: v.union(v.literal("water"), v.literal("health"), v.literal("outbreak"), v.literal("environmental"), v.literal("safety")),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string()
    }),
    severity: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5)),
    attachmentStorageId: v.optional(v.id("_storage")),
    attachmentName: v.optional(v.string()),
    attachmentMimeType: v.optional(v.string()),
    attachmentSize: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const {
      userId,
      title,
      description,
      category,
      location,
      severity,
      attachmentStorageId,
      attachmentName,
      attachmentMimeType,
      attachmentSize,
    } = args;

    // If an attachment is specified, verify that the storage object is not already linked to another entity
    if (attachmentStorageId) {
      // 1. Anti-IDOR check: verify storageId is not already attached to another report
      const existingReport = await ctx.db
        .query("communityReports")
        .filter((q: any) => q.eq(q.field("attachmentStorageId"), attachmentStorageId))
        .first();
      if (existingReport) {
        throw new Error("Invalid attachment: Storage reference is already associated with another report");
      }

      // 2. Anti-IDOR check: verify storageId is not a credential document
      const userWithDoc = await ctx.db
        .query("users")
        .filter((q: any) => q.eq(q.field("verificationDocStorageId"), attachmentStorageId))
        .first();
      if (userWithDoc) {
        throw new Error("Invalid attachment: Storage reference belongs to private user credentials");
      }

      // 3. Anti-IDOR check: verify storageId is not a health vault file
      const healthRecordWithDoc = await ctx.db
        .query("healthData")
        .filter((q: any) => q.or(
          q.eq(q.field("fileStorageId"), attachmentStorageId),
          q.eq(q.field("data.fileStorageId"), attachmentStorageId),
          q.eq(q.field("data.storageId"), attachmentStorageId)
        ))
        .first();
      if (healthRecordWithDoc) {
        throw new Error("Invalid attachment: Storage reference belongs to private health records");
      }
    }

    const reportId = await ctx.db.insert("communityReports", {
      userId,
      title,
      description,
      category,
      location,
      severity,
      status: "open",
      upvotes: 0,
      downvotes: 0,
      attachmentStorageId: attachmentStorageId || undefined,
      attachmentName: attachmentName ? String(attachmentName).slice(0, 100) : undefined,
      attachmentMimeType: attachmentMimeType ? String(attachmentMimeType).slice(0, 50) : undefined,
      attachmentSize: typeof attachmentSize === "number" ? attachmentSize : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return reportId;
  },
});

// Get all community reports (strips raw storage IDs for public privacy)
export const getReports = query({
  args: {
    category: v.optional(v.union(v.literal("water"), v.literal("health"), v.literal("outbreak"), v.literal("environmental"), v.literal("safety"))),
    status: v.optional(v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    let q;
    if (args.category) {
      q = ctx.db.query("communityReports").withIndex("by_category", (q) => q.eq("category", args.category!));
    } else {
      q = ctx.db.query("communityReports");
    }

    if (args.status) {
      q = q.filter((query) => query.eq(query.field("status"), args.status));
    }

    const reports = await q.order("desc").collect();
    return reports.map(sanitizeReport);
  },
});

// Get single report by ID (strips raw storage IDs for public privacy)
export const getReportById = query({
  args: { reportId: v.id("communityReports") },
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    return sanitizeReport(report);
  },
});

// Authenticated retrieval of internal storage download URL (Strict authorization: Owner, Admin, Health Worker)
export const getAttachmentDownloadUrl = queryWithAuth({
  args: { reportId: v.id("communityReports") },
  handler: async (ctx: any, args: any) => {
    const { userId, reportId } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Unauthorized: User not found");

    const report = await ctx.db.get(reportId);
    if (!report) throw new Error("Report not found");
    if (!report.attachmentStorageId) return null;

    const isOwner = report.userId === userId;
    const isStaff = user.role === ROLES.ADMIN || user.role === ROLES.HEALTH_WORKER;
    if (!isOwner && !isStaff) {
      throw new Error("Forbidden: You do not have permission to access this attachment");
    }

    let downloadUrl: string | null = null;
    if (ctx.storage) {
      downloadUrl = await ctx.storage.getUrl(report.attachmentStorageId);
    }

    return {
      downloadUrl,
      attachmentName: report.attachmentName || "attachment",
      attachmentMimeType: report.attachmentMimeType || "application/octet-stream",
      attachmentSize: report.attachmentSize || 0,
    };
  },
});

// Delete report with authorized storage cleanup
export const deleteReport = mutationWithAuth({
  args: { reportId: v.id("communityReports") },
  handler: async (ctx: any, args: any) => {
    const { userId, reportId } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("Unauthorized: User not found");

    const report = await ctx.db.get(reportId);
    if (!report) throw new Error("Report not found");

    const isOwner = report.userId === userId;
    const isAdmin = user.role === ROLES.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new Error("Forbidden: You cannot delete another user's report");
    }

    let storageCleanupSuccess = true;
    let pendingRetryId: any = undefined;
    if (report.attachmentStorageId && ctx.storage) {
      try {
        await ctx.storage.delete(report.attachmentStorageId);
      } catch (storageErr: any) {
        console.warn(`Failed to delete storage file ${report.attachmentStorageId}:`, storageErr);
        storageCleanupSuccess = false;
        pendingRetryId = await recordFailedStorageDeletion(ctx, {
          storageId: report.attachmentStorageId,
          originTable: "communityReports",
          originRecordId: reportId,
          requestedBy: userId,
          errorMessage: storageErr?.message,
        });
      }
    }

    await ctx.db.delete(reportId);

    // Audit log
    await ctx.db.insert("auditLogs", {
      userId,
      targetId: reportId,
      action: "REPORT_DELETED",
      details: `${user.name} deleted report "${report.title}" (storageCleanup: ${storageCleanupSuccess})`,
      timestamp: Date.now(),
    });

    return { success: true, storageCleanupSuccess, pendingRetryId };
  },
});

// Update report status
export const updateReportStatus = mutationWithAuth({
  args: {
    reportId: v.id("communityReports"),
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved")),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, reportId, status } = args as any;

    // Auth check
    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.ADMIN && user.role !== ROLES.HEALTH_WORKER)) {
      throw new Error("Unauthorized to update reports");
    }

    const report = await ctx.db.get(reportId);
    if (!report) throw new Error("Report not found");

    await ctx.db.patch(reportId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    // AUDIT LOG
    await ctx.db.insert("auditLogs", {
      userId,
      targetId: reportId,
      action: "REPORT_STATUS_CHANGE",
      details: `${user.name} changed status of report "${report.title}" to ${status}`,
      timestamp: Date.now(),
    });
  },
});