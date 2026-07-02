/**
 * Seed 5 test accounts with different roles.
 *
 * Usage: npx tsx scripts/seed-accounts.ts
 */

import { ConvexHttpClient } from "convex/browser";
import bcrypt from "bcryptjs";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

const api = {
  users: {
    getUserByEmail: "users:getUserByEmail" as any,
    createUser: "users:createUser" as any,
  }
};

const accounts = [
  { email: "superadmin@healthnex.com", name: "Super Admin", role: "super-admin" },
  { email: "admin@healthnex.com", name: "Admin User", role: "admin" },
  { email: "worker@healthnex.com", name: "Health Worker", role: "health-worker" },
  { email: "user@healthnex.com", name: "Community Member", role: "community-user" },
  { email: "public@healthnex.com", name: "Public User", role: "public" },
];

const PASSWORD = "TestPass123!";

async function seed() {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(PASSWORD, salt);

  for (const acct of accounts) {
    try {
      const existing = await convex.query(api.users.getUserByEmail, { email: acct.email });
      if (existing) {
        console.log(`[SKIP] ${acct.email} already exists`);
        continue;
      }
    } catch {
      // User doesn't exist, proceed
    }

    try {
      await convex.mutation(api.users.createUser, {
        email: acct.email,
        name: acct.name,
        passwordHash: hashedPassword,
        role: acct.role,
      });
      console.log(`[OK]   ${acct.email} (${acct.role})`);
    } catch (err: any) {
      console.error(`[FAIL] ${acct.email}: ${err.message}`);
    }
  }

  console.log("\nDone. All accounts use password: TestPass123!");
}

seed();
