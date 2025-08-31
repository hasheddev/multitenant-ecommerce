import z from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { Media, Review, Tenant } from "@/payload-types";
import { DEFAULT_LIMIT } from "@/constants";
import { TRPCError } from "@trpc/server";

export const productSchema = z.object({
  cursor: z.number().default(1),
  limit: z.number().default(DEFAULT_LIMIT),
});

export const libraryRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "orders",
        pagination: false,
        depth: 0, //populate nested documents category & image
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: input.productId,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      const order = data.docs[0];

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "order not found" });
      }

      const productData = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });
      if (!productData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "product not found",
        });
      }

      return productData;
    }),

  getMany: protectedProcedure
    .input(productSchema)
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.find({
        collection: "orders",
        pagination: true,
        depth: 0, //populate nested documents category & image
        page: input.cursor,
        limit: input.limit,
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
      });

      const productIds = data.docs.map((order) => order.product as string);
      const productsData = await ctx.db.find({
        collection: "products",
        pagination: false,
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const reviewsProductIds = productsData.docs.map((doc) => doc.id);

      const productReviews = await ctx.db.find({
        collection: "reviews",
        pagination: false,
        depth: 0,
        where: {
          product: {
            in: reviewsProductIds,
          },
        },
      });
      const productToReviews: Record<string, Review[]> = {};

      productReviews.docs.forEach((review) => {
        const productId = review.product as string;
        if (!productToReviews[productId]) {
          productToReviews[productId] = [];
        }
        productToReviews[productId].push(review);
      });

      const dataWithSummarizedReviews = productsData.docs.map((doc) => {
        const id = doc.id;
        const length = productToReviews[id]?.length || 0;
        const reviews = productToReviews[id] || [];
        const reviewRating =
          length === 0
            ? 0
            : reviews.reduce((acc, review) => acc + review.rating, 0) / length;
        return { ...doc, reviewCount: length, reviewRating };
      });

      return {
        ...productsData,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
