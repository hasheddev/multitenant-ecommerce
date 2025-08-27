import z from "zod";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { Media, Tenant } from "@/payload-types";

export const tagSchema = z.object({
  slug: z.string(),
});

export const tenantsRouter = createTRPCRouter({
  getOne: baseProcedure.input(tagSchema).query(async ({ ctx, input }) => {
    const data = await ctx.db.find({
      collection: "tenants",
      where: {
        slug: {
          equals: input.slug,
        },
      },
      limit: 1,
      pagination: false,
    });
    const tenant = data.docs[0];
    if (!tenant) {
      throw new TRPCError({ code: "NOT_FOUND", message: "tenant not found" });
    }
    return tenant as Tenant & { image: Media | null };
  }),
});
