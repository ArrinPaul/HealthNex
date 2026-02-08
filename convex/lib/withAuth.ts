import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { verifyJWT } from "./jwt";

// Helper to merge args with token
const mergeArgs = (args: any) => {
  return {
    ...args,
    token: v.string(),
  };
};

export const queryWithAuth = ({ args, handler }: any) => {
  return query({
    args: mergeArgs(args),
    handler: async (ctx, allArgs) => {
      const { token, ...restArgs } = allArgs;
      const user = await verifyJWT(token);
      
      if (!user) {
        throw new Error("Unauthorized: Invalid or expired token");
      }

      // Inject userId into the context-like object or just pass it
      // Since we can't easily modify ctx, we'll pass it as a second arg to the handler
      // But the handler signature expects (ctx, args).
      // We will call the original handler with (ctx, { ...restArgs, userId: user.userId })
      // This assumes the original handler EXPECTS userId in args.
      
      return handler(ctx, { ...restArgs, userId: user.userId });
    },
  });
};

export const mutationWithAuth = ({ args, handler }: any) => {
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
