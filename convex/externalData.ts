import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Internal mutation for syncing data (called by action)
export const updateGlobalStatsInternal = mutation({
  args: {
    source: v.string(),
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("externalInstitutionalData")
      .withIndex("by_source_and_type", (q) => q.eq("source", args.source).eq("type", args.type))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data: args.data,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("externalInstitutionalData", {
        source: args.source,
        type: args.type,
        data: args.data,
        lastUpdated: Date.now(),
      });
    }
  }
});

// Action to fetch external institutional data
export const syncInstitutionalData = action({
  args: {},
  handler: async (ctx) => {
    try {
      const covidRes = await fetch("https://disease.sh/v3/covid-19/all");
      if (!covidRes.ok) {
        throw new Error(`Failed to fetch COVID data: ${covidRes.status}`);
      }
      const covidData = await covidRes.json();

      await ctx.runMutation(api.externalData.updateGlobalStatsInternal, {
        source: "disease.sh",
        type: "outbreak_global",
        data: {
          cases: covidData.cases,
          deaths: covidData.deaths,
          recovered: covidData.recovered,
          active: covidData.active,
          updated: covidData.updated,
        }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
});

export const getGlobalStats = query({
  args: {
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("externalInstitutionalData")
      .filter((q) => q.eq(q.field("type"), args.type))
      .first();
  }
});
