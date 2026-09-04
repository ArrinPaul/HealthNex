/**
 * Seed 3 test accounts with different roles.
 *
 * Usage: npx tsx scripts/seed-accounts.ts
 *
 * seedUserWithRole is an internalMutation, so it can only be invoked via
 * `npx convex run` (your authenticated Convex CLI session), never from a
 * public client — see convex/users.ts.
 */

import bcrypt from "bcryptjs";
import { convexRun } from "./_convexRun";

const accounts = [
  { email: "admin@healthnex.com", name: "Admin User", role: "admin" },
  { email: "worker@healthnex.com", name: "Health Worker", role: "health-worker" },
  { email: "user@healthnex.com", name: "Public User", role: "public-user" },
];

const PASSWORD = "TestPass123!";

async function seed() {
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(PASSWORD, salt);

  for (const acct of accounts) {
    const args = {
      email: acct.email,
      name: acct.name,
      passwordHash: hashedPassword,
      role: acct.role,
    };

    try {
      convexRun("users:seedUserWithRole", args);
      console.log(`[OK]   ${acct.email} (${acct.role})`);
    } catch (error: any) {
      const output = String(error?.stdout || "") + String(error?.stderr || "");
      if (output.includes("already exists")) {
        console.log(`[SKIP] ${acct.email} already exists`);
      } else {
        console.error(`[FAIL] ${acct.email}: ${output || error?.message}`);
      }
    }
  }

  console.log("\nDone. All accounts use password: TestPass123!");
}

seed();
