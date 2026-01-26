"use strict";
// Convex schema definition
// Run: npx convex dev to generate the server code
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("convex/server");
const values_1 = require("convex/values");
exports.default = (0, server_1.defineSchema)({
    users: (0, server_1.defineTable)({
        email: values_1.v.string(),
        name: values_1.v.string(),
        passwordHash: values_1.v.string(),
        role: values_1.v.optional(values_1.v.string()),
        createdAt: values_1.v.number(),
        lastLoginAt: values_1.v.optional(values_1.v.number()),
        isActive: values_1.v.boolean(),
    }).index("by_email", ["email"]),
    healthData: (0, server_1.defineTable)({
        userId: values_1.v.id("users"),
        type: values_1.v.string(), // "symptom", "medication", "vitals", etc.
        data: values_1.v.any(),
        timestamp: values_1.v.number(),
        location: values_1.v.optional(values_1.v.object({
            latitude: values_1.v.number(),
            longitude: values_1.v.number(),
            address: values_1.v.optional(values_1.v.string())
        })),
        severity: values_1.v.optional(values_1.v.number()), // 1-10 scale
        notes: values_1.v.optional(values_1.v.string()),
    }).index("by_user", ["userId"])
        .index("by_user_and_type", ["userId", "type"])
        .index("by_timestamp", ["timestamp"]),
    communityReports: (0, server_1.defineTable)({
        userId: values_1.v.id("users"),
        title: values_1.v.string(),
        description: values_1.v.string(),
        category: values_1.v.string(), // "outbreak", "environmental", "safety", etc.
        location: values_1.v.object({
            latitude: values_1.v.number(),
            longitude: values_1.v.number(),
            address: values_1.v.optional(values_1.v.string())
        }),
        severity: values_1.v.number(), // 1-5 scale
        status: values_1.v.string(), // "open", "investigating", "resolved"
        upvotes: values_1.v.number(),
        downvotes: values_1.v.number(),
        createdAt: values_1.v.number(),
        updatedAt: values_1.v.number(),
    }).index("by_location", ["location.latitude", "location.longitude"])
        .index("by_category", ["category"])
        .index("by_status", ["status"])
        .index("by_created", ["createdAt"]),
    diseaseOutbreaks: (0, server_1.defineTable)({
        disease: values_1.v.string(),
        cases: values_1.v.number(),
        location: values_1.v.string(),
        latitude: values_1.v.number(),
        longitude: values_1.v.number(),
        severity: values_1.v.union(values_1.v.literal("low"), values_1.v.literal("medium"), values_1.v.literal("high"), values_1.v.literal("critical")),
        symptoms: values_1.v.optional(values_1.v.array(values_1.v.string())),
        reportedBy: values_1.v.string(), // userId
        notes: values_1.v.optional(values_1.v.string()),
        timestamp: values_1.v.number(),
        status: values_1.v.string(), // "active", "contained", "resolved"
        confirmedCases: values_1.v.number(),
        suspectedCases: values_1.v.number(),
        deaths: values_1.v.number(),
        recovered: values_1.v.number(),
    }).index("by_location", ["location"])
        .index("by_status", ["status"])
        .index("by_severity", ["severity"])
        .index("by_timestamp", ["timestamp"]),
    waterQuality: (0, server_1.defineTable)({
        location: values_1.v.object({
            latitude: values_1.v.number(),
            longitude: values_1.v.number(),
            address: values_1.v.optional(values_1.v.string())
        }),
        pH: values_1.v.optional(values_1.v.number()),
        turbidity: values_1.v.optional(values_1.v.number()),
        chlorine: values_1.v.optional(values_1.v.number()),
        bacteria: values_1.v.optional(values_1.v.number()),
        temperature: values_1.v.optional(values_1.v.number()),
        testDate: values_1.v.number(),
        testedBy: values_1.v.optional(values_1.v.id("users")),
        source: values_1.v.string(), // "user_report", "official_test", "sensor"
        quality: values_1.v.string(), // "excellent", "good", "fair", "poor"
    }).index("by_location", ["location.latitude", "location.longitude"])
        .index("by_test_date", ["testDate"])
        .index("by_quality", ["quality"]),
    alerts: (0, server_1.defineTable)({
        type: values_1.v.string(), // "health_alert", "weather_warning", "water_quality", etc.
        title: values_1.v.string(),
        message: values_1.v.string(),
        severity: values_1.v.string(), // "low", "medium", "high", "critical"
        location: values_1.v.optional(values_1.v.object({
            latitude: values_1.v.number(),
            longitude: values_1.v.number(),
            radius: values_1.v.number(), // in kilometers
        })),
        createdAt: values_1.v.number(),
        expiresAt: values_1.v.optional(values_1.v.number()),
        isActive: values_1.v.boolean(),
        source: values_1.v.string(), // "system", "admin", "ai_prediction"
    }).index("by_type", ["type"])
        .index("by_severity", ["severity"])
        .index("by_active", ["isActive"])
        .index("by_created", ["createdAt"]),
    chatMessages: (0, server_1.defineTable)({
        userId: values_1.v.optional(values_1.v.id("users")),
        sessionId: values_1.v.string(),
        message: values_1.v.string(),
        response: values_1.v.optional(values_1.v.string()),
        timestamp: values_1.v.number(),
        context: values_1.v.optional(values_1.v.any()),
    }).index("by_session", ["sessionId"])
        .index("by_user", ["userId"])
        .index("by_timestamp", ["timestamp"]),
});
