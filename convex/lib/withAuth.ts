import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { verifyJWT } from "./jwt";

// Helper to merge args with token
const mergeArgs = (args: Record<string, any>) => {
  return {
    ...args,
    token: v.string(),
  };
};

export const queryWithAuth = ({ args, handler }: {
  args: Record<string, any>;
  handler: (ctx: any, args: any) => Promise<any>;
}) => {
  return query({
    args: mergeArgs(args),
    handler: async (ctx, allArgs) => {
      const { token, ...restArgs } = allArgs;
      const user = await verifyJWT(token);
      
      if (!user) {
        throw new Error("Unauthorized: Invalid or expired token");
      }

      return handler(ctx, { ...restArgs, userId: user.userId });
    },
  });
};

export const mutationWithAuth = ({ args, handler }: {
  args: Record<string, any>;
  handler: (ctx: any, args: any) => Promise<any>;
}) => {
  return mutation({
    args: mergeArgs(args),
    handler: async (ctx, allArgs) => {
      const { token, ...restArgs } = allArgs;
      const user = await verifyJWT(token);
      
      if (!user) {
        throw new Error("Unauthorized: Invalid or expired token");
      }

      return handler(ctx, { ...restArgs, userId: user.userId });
    },
  });
};
