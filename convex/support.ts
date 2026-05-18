import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const sendTicket = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const ticketId = await ctx.db.insert("supportTickets", {
      ...args,
      status: "open",
      priority: "high", // Defaulting to high as per UI "high-priority ticket"
      createdAt: Date.now(),
    });
    return ticketId;
  },
});

export const getTickets = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("supportTickets")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});
