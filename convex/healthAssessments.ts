import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { mutationWithAuth, queryWithAuth } from "./lib/withAuth";

export const saveAssessment = mutationWithAuth({
  args: {
    predictedDisease: v.string(),
    predictionScore: v.number(),
    symptomsProvided: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const { userId, ...assessmentArgs } = args;
    
    // Save the assessment
    const id = await ctx.db.insert("healthAssessments", {
      ...assessmentArgs,
      userId,
      timestamp: Date.now(),
    });

    // Mark user onboarding as complete if they just did this
    const user = await ctx.db.get(userId);
    if (user && !user.onboardingCompleted) {
      await ctx.db.patch(userId, { onboardingCompleted: true });
    }

    return id;
  },
});

export const getUserAssessments = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    return await ctx.db
      .query("healthAssessments")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getAssessmentStatus = queryWithAuth({
  args: {},
  handler: async (ctx: any, args: any) => {
    const { userId } = args;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    
    const latestAssessment = await ctx.db
      .query("healthAssessments")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .first();

    return {
      needsOnboarding: user.role !== "super-admin" && !latestAssessment,
      latestAssessment,
    };
  }
});
