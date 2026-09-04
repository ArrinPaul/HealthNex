import { mutation, query } from "../_generated/server";
import { GenericValidator, v } from "convex/values";
import { verifyJWT } from "./jwt";

// Generic over the caller's args shape so the merged { ...args, token }
// object keeps its specific keys in the generated api types, instead of
// collapsing to a bare `Record<string, any>` (which made every field but
// `token` look unknown to typed callers like ConvexHttpClient).
export const queryWithAuth = <ArgsValidator extends Record<string, GenericValidator>>({ args, handler }: {
  args: ArgsValidator;
  handler: (ctx: any, args: any) => Promise<any>;
}) => {
  return query({
    args: { ...args, token: v.string() },
    handler: async (ctx, allArgs: any) => {
      const { token, ...restArgs } = allArgs;
      const user = await verifyJWT(token);

      if (!user) {
        throw new Error("Unauthorized: Invalid or expired token");
      }

      return handler(ctx, { ...restArgs, userId: user.userId });
    },
  });
};

export const mutationWithAuth = <ArgsValidator extends Record<string, GenericValidator>>({ args, handler }: {
  args: ArgsValidator;
  handler: (ctx: any, args: any) => Promise<any>;
}) => {
  return mutation({
    args: { ...args, token: v.string() },
    handler: async (ctx, allArgs: any) => {
      const { token, ...restArgs } = allArgs;
      const user = await verifyJWT(token);

      if (!user) {
        throw new Error("Unauthorized: Invalid or expired token");
      }

      return handler(ctx, { ...restArgs, userId: user.userId });
    },
  });
};
