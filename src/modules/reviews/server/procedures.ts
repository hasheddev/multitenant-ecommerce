import z from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const reviewSchema = z.object({
  productId: z.string(),
});

export const reviewsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(reviewSchema)
    .query(async ({ ctx, input }) => {
      const data = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "product not found",
        });
      }

      const review = await ctx.db.find({
        collection: "reviews",
        limit: 1,
        where: {
          and: [
            {
              product: {
                equals: data.id,
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
      const response = review.docs[0];
      if (!response) {
        return null;
      }
      return response;
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        rating: z.number().min(1, { message: "Rating is requred" }).max(5),
        description: z.string().min(2, { message: "Description is requred" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.findByID({
        collection: "products",
        id: input.productId,
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "product not found",
        });
      }

      const existingReview = await ctx.db.find({
        collection: "reviews",
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
      if (existingReview.totalDocs > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You have already reviewed this product",
        });
      }

      const review = await ctx.db.create({
        collection: "reviews",
        data: {
          user: ctx.session.user.id,
          product: data.id,
          rating: input.rating,
          description: input.description,
        },
      });

      return review;
    }),

  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.string(),
        rating: z.number().min(1, { message: "Rating is requred" }).max(5),
        description: z.string().min(2, { message: "Description is requred" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const review = await ctx.db.findByID({
        depth: 0,
        collection: "reviews",
        id: input.reviewId,
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review not found",
        });
      }

      if (review.user !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this review",
        });
      }

      const updatedReview = await ctx.db.update({
        collection: "reviews",
        id: input.reviewId,
        data: {
          rating: input.rating,
          description: input.description,
        },
      });

      return updatedReview;
    }),
});
