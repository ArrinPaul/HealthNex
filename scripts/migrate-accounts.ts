/**
 * Migrate existing accounts: set onboardingCompleted based on role.
 * - super-admin / admin → onboardingCompleted: true (skip onboarding)
 * - health-worker / community-user → onboardingCompleted: true (already had access)
 * - public → onboardingCompleted: false (must complete onboarding)
 *
 * Usage: npx tsx scripts/migrate-accounts.ts
 */

import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const isValidUrl = convexUrl && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));
const convex = new ConvexHttpClient(isValidUrl ? convexUrl : 'https://placeholder.convex.cloud');

const api = {
  users: {
    getUserByEmail: "users:getUserByEmail" as any,
    migrateOnboarding: "users:migrateOnboarding" as any,
  }
};

const accounts = [
  { email: "superadmin@healthnex.com", onboardingCompleted: true },
  { email: "admin@healthnex.com", onboardingCompleted: true },
  { email: "worker@healthnex.com", onboardingCompleted: true },
  { email: "user@healthnex.com", onboardingCompleted: true },
  { email: "public@healthnex.com", onboardingCompleted: false },
];

async function migrate() {
  for (const acct of accounts) {
    try {
      await convex.mutation(api.users.migrateOnboarding, {
        email: acct.email,
        onboardingCompleted: acct.onboardingCompleted,
      });
      console.log(`[OK] ${acct.email} → onboardingCompleted: ${acct.onboardingCompleted}`);
    } catch (err: any) {
      console.error(`[FAIL] ${acct.email}: ${err.message}`);
    }
  }
  console.log("\nMigration complete.");
}

migrate();
