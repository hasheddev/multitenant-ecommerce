import { headers as getHeaders } from "next/headers";
import { BasePayload } from "payload";

import { stripe } from "@/lib/stripe";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { loginSchema, registerSchema } from "../schema";
import { generateCookie } from "../utils";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.db.auth({ headers });
    return session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const existingUser = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });
      if (existingUser.docs[0]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already taken",
        });
      }

      const account = await stripe.accounts.create({});

      if (!account) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to create stripe account",
        });
      }

      const tenant = await ctx.db.create({
        collection: "tenants",
        data: {
          name: input.username,
          slug: input.username,
          stripeAccountId: account.id,
        },
      });
      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          username: input.username,
          password: input.password, //automatic hashing
          tenants: [
            {
              tenant: tenant.id,
            },
          ],
        },
      });

      await login(ctx, input);
    }),
  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const data = await login(ctx, input);
    return data;
  }),
});

async function login(
  ctx: { db: BasePayload },
  input: { email: string; password: string }
) {
  const data = await ctx.db.login({
    collection: "users",
    data: { email: input.email, password: input.password },
  });

  if (!data.token) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Failed to login",
    });
  }
  await generateCookie({
    prefix: ctx.db.config.cookiePrefix,
    value: data.token,
  });

  return data;
}
