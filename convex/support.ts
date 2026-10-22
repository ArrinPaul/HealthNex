import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

import { verifyJWT } from "./lib/jwt";

function requireSupportSecret(secret: string | undefined) {
  const expected = process.env.SUPPORT_TICKET_SECRET;
  if (!expected || expected.trim().length === 0) {
    throw new Error("SUPPORT_TICKET_SECRET is not configured on this Convex deployment");
  }
  if (!secret || typeof secret !== "string" || secret.length !== expected.length) {
    throw new Error("Unauthorized: invalid support ticket secret");
  }

  // Constant-time character comparison to prevent timing side-channel attacks
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= secret.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) {
    throw new Error("Unauthorized: invalid support ticket secret");
  }
}

export const sendTicket = mutation({
  args: {
    secret: v.string(),
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 0. Enforce server-side shared secret gate (SEC-ABUSE-01)
    requireSupportSecret(args.secret);

    // 1. Validate and bound input fields to prevent abuse
    const name = args.name.trim();
    const email = args.email.trim();
    const subject = args.subject.trim();
    const message = args.message.trim();

    if (!name || name.length > 100) {
      throw new Error("Name is required and must be under 100 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || email.length > 255) {
      throw new Error("A valid email address under 255 characters is required");
    }

    if (!subject || subject.length > 200) {
      throw new Error("Subject is required and must be under 200 characters");
    }

    if (!message || message.length > 5000) {
      throw new Error("Message is required and must be under 5000 characters");
    }

    // 2. Resolve optional authentication
    let userId: any = undefined;
    if (args.token) {
      const authUser = await verifyJWT(args.token);
      if (authUser?.userId) {
        userId = authUser.userId;
      }
    }

    // 3. Insert ticket strictly with default status and priority
    const ticketId = await ctx.db.insert("supportTickets", {
      name,
      email,
      subject,
      message,
      userId,
      status: "open",
      priority: "medium",
      createdAt: Date.now(),
    });

    return ticketId;
  },
});

export const getTickets = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view all tickets");
    }

    return await ctx.db
      .query("supportTickets")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});
