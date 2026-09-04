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
