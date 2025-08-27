import z from "zod";
import type { Sort, Where } from "payload";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category, Media, Tenant } from "@/payload-types";
import { sortValues } from "../search-params";
import { DEFAULT_LIMIT } from "@/constants";

export const productSchema = z.object({
  cursor: z.number().default(1),
  limit: z.number().default(DEFAULT_LIMIT),
  category: z.string().nullable().optional(),
  minPrice: z.string().nullable().optional(),
  maxPrice: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  sort: z.enum(sortValues).nullable().optional(),
  tenantSlug: z.string().nullable().optional(),
});

export const productsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.findByID({
        collection: "products",
        depth: 2,
        id: input.id,
      });
      return {
        ...product,
        image: product.image as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
      };
    }),
  getMany: baseProcedure.input(productSchema).query(async ({ ctx, input }) => {
    const where: Where = {};
    let sort: Sort = "-createdAt";

    if (input?.sort === "curated") {
      sort = "-createdAt";
    }

    if (input?.sort === "trending") {
      sort = "name";
    }
    if (input?.sort === "hot_and_new") {
      sort = "+createdAt";
    }

    if (input.minPrice && input.maxPrice) {
      where.price = {
        greater_than_equal: input.minPrice,
        less_than_equal: input.maxPrice,
      };
    } else if (input.minPrice) {
      where.price = {
        greater_than_equal: input.minPrice,
      };
    } else if (input.maxPrice) {
      where.price = {
        less_than_equal: input.maxPrice,
      };
    }

    if (input.tenantSlug) {
      where["tenant.slug"] = {
        equals: input.tenantSlug,
      };
    }

    if (input.category) {
      const categoriesData = await ctx.db.find({
        collection: "categories",
        limit: 1,
        depth: 1,
        pagination: false, //load every document
        where: {
          slug: {
            equals: input.category,
          },
        },
      });

      const formatedData = categoriesData.docs.map((doc) => ({
        ...doc,
        subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
          ...(doc as Category),
          subcategories: undefined,
        })),
      }));

      const subcategorySlugs = [];
      const parentCategory = formatedData[0];
      if (parentCategory) {
        subcategorySlugs.push(
          ...parentCategory.subcategories.map((subcategory) => subcategory.slug)
        );
        where["category.slug"] = {
          in: [parentCategory.slug, ...subcategorySlugs],
        };
      }
    }
    if (input.tags && input.tags.length > 0) {
      where["tags.name"] = { in: input.tags };
    }
    const data = await ctx.db.find({
      collection: "products",
      pagination: true,
      depth: 2, //populate nested documents category & image
      where,
      sort,
      page: input.cursor,
      limit: input.limit,
      //   sort: "name",
    });

    return {
      ...data,
      docs: data.docs.map((doc) => ({
        ...doc,
        image: doc.image as Media | null,
        tenant: doc.tenant as Tenant & { image: Media | null },
      })),
    };
  }),
});
