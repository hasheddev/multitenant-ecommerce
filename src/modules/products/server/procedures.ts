import z from "zod";
import type { Sort, Where } from "payload";
import { headers as getHeaders } from "next/headers";

import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category, Media, Review, Tenant } from "@/payload-types";
import { sortValues } from "../search-params";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";

export const productSchema = z.object({
  search: z.string().nullable().optional(),
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
      const headers = await getHeaders();
      const session = await ctx.db.auth({ headers });

      const product = await ctx.db.findByID({
        collection: "products",
        depth: 2,
        id: input.id,
        select: {
          content: false,
          embedding: false,
          embedding_text: false,
        },
      });

      if (!product || product.isArchived) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }
      let isPurchased = false;

      if (session.user) {
        const ordersData = await ctx.db.find({
          collection: "orders",
          pagination: false,
          limit: 1,
          where: {
            and: [
              { product: { equals: input.id } },
              { user: { equals: session.user.id } },
            ],
          },
        });
        isPurchased = !!ordersData.docs[0];
      }

      let reviews: Review[] = [];
      if (product.reviews) {
        reviews = product.reviews as Review[];
      }
      const reviewRating =
        reviews.length === 0
          ? 0
          : reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length;

      const ratingDistribution: Record<number, number> = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };
      if (reviews.length > 0) {
        reviews.forEach((review) => {
          const rating = review.rating;
          if (rating >= 1 && rating < 6) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
          }
        });
        Object.keys(ratingDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingDistribution[rating] || 0;
          ratingDistribution[rating] = Math.round(
            (count / reviews.length) * 100
          );
        });
      }

      return {
        ...product,
        isPurchased,
        reviewRating,
        reviewCount: reviews.length,
        ratingDistribution,
        image: product.image as Media | null,
        tenant: product.tenant as Tenant & { image: Media | null },
      };
    }),

  getMany: baseProcedure.input(productSchema).query(async ({ ctx, input }) => {
    const where: Where = {
      isArchived: {
        not_equals: true,
      },
    };
    let sort: Sort = "-createdAt";

    if (input?.sort === "curated") {
      sort = "-createdAt";
    }

    if (input?.sort === "trending") {
      sort = "+createdAt";
    }
    if (input?.sort === "hot_and_new") {
      sort = "-createdAt";
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
    } else {
      where["isPrivate"] = {
        not_equals: true,
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

    if (input.search) {
      where["name"] = {
        like: input.search,
      };
    }

    const data = await ctx.db.find({
      collection: "products",
      pagination: true,
      depth: 2, //populate nested documents category & image
      where,
      sort,
      page: input.cursor,
      limit: input.limit,
      select: {
        content: false,
        embedding: false,
        embedding_text: false,
      },
      //   sort: "name",
    });

    let productReviews: Review[] = [];

    if (data.docs?.[0]?.reviews) {
      productReviews = data.docs.flatMap((doc) => doc.reviews as Review[]);
    }
    const productToReviews: Record<string, Review[]> = {};
    if (productReviews.length > 0) {
      productReviews.forEach((review) => {
        const productId = review.product as string;
        if (!productToReviews[productId]) {
          productToReviews[productId] = [];
        }
        productToReviews[productId].push(review);
      });
    }

    const dataWithSummarizedReviews = data.docs.map((doc) => {
      const id = doc.id;
      const reviews = productToReviews[id] || [];
      const length = reviews.length;
      const reviewRating =
        length === 0
          ? 0
          : reviews.reduce((acc, review) => acc + review.rating, 0) / length;
      return { ...doc, reviewCount: length, reviewRating };
    });

    return {
      ...data,
      docs: dataWithSummarizedReviews.map((doc) => ({
        ...doc,
        image: doc.image as Media | null,
        tenant: doc.tenant as Tenant & { image: Media | null },
      })),
    };
  }),
});
