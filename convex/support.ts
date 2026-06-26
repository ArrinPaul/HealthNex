import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

export const sendTicket = mutationWithAuth({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, ...ticketArgs } = args;

    const ticketId = await ctx.db.insert("supportTickets", {
      ...ticketArgs,
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
    if (!user || (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can view all tickets");
    }

    return await ctx.db
      .query("supportTickets")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});
