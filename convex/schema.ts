// Convex schema definition
// Run: npx convex dev to generate the server code

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    role: v.optional(v.string()),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_email", ["email"]),

  healthData: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("symptom"), v.literal("medication"), v.literal("vitals"), v.literal("water_test")),
    data: v.any(),
    timestamp: v.number(),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string())
    })),
    severity: v.optional(v.number()), // 1-10 scale
    notes: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_user_and_type", ["userId", "type"])
    .index("by_timestamp", ["timestamp"]),

  communityReports: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    category: v.union(v.literal("water"), v.literal("health"), v.literal("outbreak"), v.literal("environmental"), v.literal("safety")),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string())
    }),
    severity: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4), v.literal(5)),
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved")),
    upvotes: v.number(),
    downvotes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_location", ["location.latitude", "location.longitude"])
    .index("by_category", ["category"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  diseaseOutbreaks: defineTable({
    disease: v.string(),
    cases: v.number(),
    location: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    symptoms: v.optional(v.array(v.string())),
    reportedBy: v.string(), // userId
    notes: v.optional(v.string()),
    timestamp: v.number(),
    status: v.union(v.literal("active"), v.literal("contained"), v.literal("resolved")),
    confirmedCases: v.number(),
    suspectedCases: v.number(),
    deaths: v.number(),
    recovered: v.number(),
  }).index("by_location", ["location"])
    .index("by_status", ["status"])
    .index("by_severity", ["severity"])
    .index("by_timestamp", ["timestamp"]),

  waterQuality: defineTable({
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.optional(v.string())
    }),
    pH: v.optional(v.number()),
    turbidity: v.optional(v.number()),
    chlorine: v.optional(v.number()),
    bacteria: v.optional(v.number()),
    temperature: v.optional(v.number()),
    testDate: v.number(),
    testedBy: v.optional(v.id("users")),
    source: v.union(v.literal("user_report"), v.literal("official_test"), v.literal("sensor")),
    quality: v.union(v.literal("excellent"), v.literal("good"), v.literal("fair"), v.literal("poor")),
  }).index("by_location", ["location.latitude", "location.longitude"])
    .index("by_test_date", ["testDate"])
    .index("by_quality", ["quality"]),

  alerts: defineTable({
    type: v.union(v.literal("health_alert"), v.literal("weather_warning"), v.literal("water_quality"), v.literal("outbreak")),
    title: v.string(),
    message: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    location: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      radius: v.number(), // in kilometers
    })),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
    source: v.union(v.literal("system"), v.literal("admin"), v.literal("ai_prediction")),
  }).index("by_type", ["type"])
    .index("by_severity", ["severity"])
    .index("by_active", ["isActive"])
    .index("by_created", ["createdAt"]),

  chatMessages: defineTable({
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    message: v.string(),
    response: v.optional(v.string()),
    timestamp: v.number(),
        context: v.optional(v.any()),
      }).index("by_session", ["sessionId"])
        .index("by_user", ["userId"])
        .index("by_timestamp", ["timestamp"]),
    
      usageTracking: defineTable({
        userId: v.optional(v.id("users")),
        feature: v.string(), // "chatbot", "ocr", "prediction", "symptom_analysis"
        timestamp: v.number(),
        status: v.string(), // "success", "error"
        tokens: v.optional(v.number()),
      }).index("by_feature", ["feature"])
        .index("by_timestamp", ["timestamp"]),
    });
    