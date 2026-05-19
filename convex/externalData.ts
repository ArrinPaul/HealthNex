import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Action to fetch external institutional data
// disease.sh for real-time COVID/Flu
// WHO GHO for indicators
export const syncInstitutionalData = action({
  args: {},
  handler: async (ctx) => {
    try {
      // 1. Fetch Global COVID-19 Data (Institutional Resource: disease.sh)
      const covidRes = await fetch("https://disease.sh/v3/covid-19/all");
      const covidData = await covidRes.json();

      // 2. Fetch Influenza/ILI data (Institutional Resource: disease.sh)
      // Note: Simplified for demonstration, disease.sh has various endpoints
      
      // 3. Store in database
      await ctx.runMutation(api.externalData.updateGlobalStats, {
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
      console.error("Failed to sync institutional data:", error);
      return { success: false, error: String(error) };
    }
  }
});

export const updateGlobalStats = mutation({
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
