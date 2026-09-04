/**
 * One-time admin seed script.
 *
 * Usage: npx tsx scripts/seed-admin.ts
 *
 * This creates the admin account in Convex. Run this once during initial
 * setup, NOT on every login.
 *
 * seedUserWithRole is an internalMutation (it directly grants a role, so it
 * must never be reachable from a public client) — it can only be invoked via
 * `npx convex run`, which uses your authenticated Convex CLI session rather
 * than the public deployment URL.
 */

import { execFileSync } from "child_process";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@healthnex.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "AdminPass123!";
  const adminName = process.env.SEED_ADMIN_NAME || "Administrator";

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(adminPassword, salt);

  const args = JSON.stringify({
    email: adminEmail,
    name: adminName,
    passwordHash: hashedPassword,
    role: "admin",
  });

  console.log(`[SEED] Creating admin user: ${adminEmail}`);

  try {
    const output = execFileSync("npx", ["convex", "run", "users:seedUserWithRole", args], {
      encoding: "utf8",
    });
    console.log(output);
    console.log(`[SEED] Admin user created successfully:`);
    console.log(`[SEED]   Email:    ${adminEmail}`);
    console.log(`[SEED]   Name:     ${adminName}`);
    console.log(`[SEED]   Role:     admin`);
    console.log(`[SEED]`);
    console.log(`[SEED] IMPORTANT: Change the default password after first login!`);
  } catch (error: any) {
    // seedUserWithRole throws "User with this email already exists" if it's
    // already seeded — treat that as a no-op rather than a failure.
    const output = String(error?.stdout || "") + String(error?.stderr || "");
    if (output.includes("already exists")) {
      console.log(`[SEED] Admin user already exists: ${adminEmail}. Skipping.`);
      return;
    }
    console.error(`[SEED] Failed to create admin user:`, output || error?.message);
    process.exit(1);
  }
}

seedAdmin();
