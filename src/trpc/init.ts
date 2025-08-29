import { cache } from "react";
import superjson from "superjson";
import { getPayload } from "payload";
import { headers as getHeaders } from "next/headers";

import { initTRPC, TRPCError } from "@trpc/server";
import configPromise from "@payload-config";

export const createTRPCContext = cache(async () => {
  return {};
});

const t = initTRPC.create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(async ({ next }) => {
  const payload = await getPayload({ config: configPromise });
  return next({ ctx: { db: payload } });
});

export const protectedProcedure = baseProcedure.use(async ({ next, ctx }) => {
  const headers = await getHeaders();
  const session = await ctx.db.auth({ headers });
  if (!session.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({ ctx: { ...ctx, session: { ...session, user: session.user } } });
});
