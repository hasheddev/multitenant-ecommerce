import { headers as getHeaders, cookies as getCookies } from "next/headers";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { AUTH_COOKIE } from "../constants";
import { BasePayload } from "payload";
import { loginSchema, registerSchema } from "../schema";

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
      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          username: input.username,
          password: input.password, //automatic hashing
        },
      });

      await login(ctx, input);
    }),
  login: baseProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
    const data = await login(ctx, input);
    return data;
  }),
  logout: baseProcedure.mutation(async () => {
    const cookies = await getCookies();
    cookies.delete(AUTH_COOKIE);
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

  const cookies = await getCookies();
  cookies.set({
    name: AUTH_COOKIE,
    value: data.token,
    httpOnly: true,
    path: "/",
    //sameSite: "none",
    //domain: ""
  });

  return data;
}
