/**
 * One-time admin seed script.
 * 
 * Usage: npx tsx scripts/seed-admin.ts
 * 
 * This creates the super-admin account in Convex.
 * Run this once during initial setup, NOT on every login.
 */

import { ConvexHttpClient } from "convex/browser";
import bcrypt from "bcryptjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

// Inline the api reference to avoid import issues outside Next.js
const api = {
  users: {
    getUserByEmail: "users:getUserByEmail" as any,
    createUser: "users:createUser" as any,
  }
};

async function seedAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@healthnex.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "AdminPass123!";
  const adminName = process.env.SEED_ADMIN_NAME || "Administrator";

  console.log(`[SEED] Checking if admin exists: ${adminEmail}`);

  try {
    // We need to use the convex API properly
    // This script is meant to be adapted to use your Convex schema
    const existingUser = await convex.query(api.users.getUserByEmail as any, { email: adminEmail });

    if (existingUser) {
      console.log(`[SEED] Admin user already exists: ${adminEmail}`);
      console.log(`[SEED] Skipping creation.`);
      return;
    }
  } catch {
    // User doesn't exist, proceed with creation
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await convex.mutation(api.users.createUser as any, {
      email: adminEmail,
      name: adminName,
      passwordHash: hashedPassword,
      role: "super-admin",
    });

    console.log(`[SEED] Admin user created successfully:`);
    console.log(`[SEED]   Email:    ${adminEmail}`);
    console.log(`[SEED]   Name:     ${adminName}`);
    console.log(`[SEED]   Role:     super-admin`);
    console.log(`[SEED]`);
    console.log(`[SEED] IMPORTANT: Change the default password after first login!`);
  } catch (error: any) {
    console.error(`[SEED] Failed to create admin user:`, error.message);
    process.exit(1);
  }
}

seedAdmin();
