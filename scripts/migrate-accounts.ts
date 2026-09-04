/**
 * Migrate existing accounts: set onboardingCompleted based on role.
 * - admin / health-worker → onboardingCompleted: true (already had access)
 * - public-user → onboardingCompleted: false (must complete onboarding)
 *
 * Usage: npx tsx scripts/migrate-accounts.ts
 *
 * migrateOnboarding is an internalMutation, so it can only be invoked via
 * `npx convex run` (your authenticated Convex CLI session) — see
 * convex/users.ts.
 */

import { execFileSync } from "child_process";

const accounts = [
  { email: "admin@healthnex.com", onboardingCompleted: true },
  { email: "worker@healthnex.com", onboardingCompleted: true },
  { email: "user@healthnex.com", onboardingCompleted: false },
];

async function migrate() {
  for (const acct of accounts) {
    const args = JSON.stringify({
      email: acct.email,
      onboardingCompleted: acct.onboardingCompleted,
    });

    try {
      execFileSync("npx", ["convex", "run", "users:migrateOnboarding", args], {
        encoding: "utf8",
      });
      console.log(`[OK] ${acct.email} -> onboardingCompleted: ${acct.onboardingCompleted}`);
    } catch (error: any) {
      const output = String(error?.stdout || "") + String(error?.stderr || "");
      console.error(`[FAIL] ${acct.email}: ${output || error?.message}`);
    }
  }
  console.log("\nMigration complete.");
}

migrate();
