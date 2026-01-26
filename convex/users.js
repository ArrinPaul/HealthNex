"use strict";
// Convex server functions for user management
// Run: npx convex dev to generate the server code
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.updateLastLogin = exports.getUserByEmail = exports.createUser = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
// Create a new user
exports.createUser = (0, server_1.mutation)({
    args: {
        email: values_1.v.string(),
        name: values_1.v.string(),
        passwordHash: values_1.v.string(),
        role: values_1.v.optional(values_1.v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        const userId = await ctx.db.insert("users", {
            ...args,
            createdAt: Date.now(),
            isActive: true,
        });
        return userId;
    },
});
// Get user by email
exports.getUserByEmail = (0, server_1.query)({
    args: { email: values_1.v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
    },
});
// Update last login
exports.updateLastLogin = (0, server_1.mutation)({
    args: { userId: values_1.v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            lastLoginAt: Date.now(),
        });
    },
});
// Get user by ID
exports.getUser = (0, server_1.query)({
    args: { userId: values_1.v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});
