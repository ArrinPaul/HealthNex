import { mutation } from "./_generated/server";
import { ROLES } from "./roles";

// One-time migration: collapse the old 5-role system (super-admin, admin,
// health-worker, community-user, public) into the new 3-role system
// (admin, health-worker, public-user). Run once via `npx convex run migrations:mergeRoles`
// after deploying the new convex/roles.ts.
export const mergeRoles = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const roleMap: Record<string, string> = {
      "super-admin": ROLES.ADMIN,
      "admin": ROLES.ADMIN,
      "health-worker": ROLES.HEALTH_WORKER,
      "community-user": ROLES.PUBLIC_USER,
      "public": ROLES.PUBLIC_USER,
    };

    let updated = 0;

    for (const user of users) {
      const patch: { role?: string; requestedRole?: string } = {};

      if (user.role && roleMap[user.role] && roleMap[user.role] !== user.role) {
        patch.role = roleMap[user.role];
      }
      if (
        user.requestedRole &&
        roleMap[user.requestedRole] &&
        roleMap[user.requestedRole] !== user.requestedRole
      ) {
        patch.requestedRole = roleMap[user.requestedRole];
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(user._id, patch);
        updated++;
      }
    }

    return { totalUsers: users.length, updated };
  },
});

// One-time cleanup: wipe every row in the users table (and their audit logs)
// so the app can be reseeded with a clean set of accounts. Irreversible —
// run only against a deployment you intend to fully reset.
export const wipeAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    const auditLogs = await ctx.db.query("auditLogs").collect();
    for (const log of auditLogs) {
      await ctx.db.delete(log._id);
    }

    return { deletedUsers: users.length, deletedAuditLogs: auditLogs.length };
  },
});
