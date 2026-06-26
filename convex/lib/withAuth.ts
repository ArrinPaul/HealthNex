import { mutation, query } from "../_generated/server";
import { v, VValidator } from "convex/values";
import { verifyJWT } from "./jwt";
import { GenericQueryCtx, GenericMutationCtx, DataModel } from "convex/server";

type QueryArgs = Record<string, VValidator<any, any, any>>;
type MutationArgs = Record<string, VValidator<any, any, any>>;

// Helper to merge args with token
const mergeArgs = (args: QueryArgs | MutationArgs) => {
  return {
    ...args,
    token: v.string(),
  };
};

type HandlerCtx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

export const queryWithAuth = <T extends QueryArgs>({ args, handler }: {
  args: T;
  handler: (ctx: GenericQueryCtx<DataModel>, args: any) => Promise<any>;
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

export const mutationWithAuth = <T extends MutationArgs>({ args, handler }: {
  args: T;
  handler: (ctx: GenericMutationCtx<DataModel>, args: any) => Promise<any>;
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
