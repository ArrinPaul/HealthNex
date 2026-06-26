import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutationWithAuth } from "./lib/withAuth";
import { ROLES } from "./roles";

// Action to fetch external institutional data
// disease.sh for real-time COVID/Flu
// WHO GHO for indicators
export const syncInstitutionalData = action({
  args: {},
  handler: async (ctx) => {
    try {
      // 1. Fetch Global COVID-19 Data (Institutional Resource: disease.sh)
      const covidRes = await fetch("https://disease.sh/v3/covid-19/all");
      if (!covidRes.ok) {
        throw new Error(`Failed to fetch COVID data: ${covidRes.status}`);
      }
      const covidData = await covidRes.json();

      // 2. Store in database
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

export const updateGlobalStats = mutationWithAuth({
  args: {
    source: v.string(),
    type: v.string(),
    data: v.any(),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, source, type, data } = args;

    const user = await ctx.db.get(userId);
    if (!user || (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN)) {
      throw new Error("Unauthorized: Only admins can update global stats");
    }

    const existing = await ctx.db
      .query("externalInstitutionalData")
      .withIndex("by_source_and_type", (q) => q.eq("source", source).eq("type", type))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        data,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("externalInstitutionalData", {
        source,
        type,
        data,
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
