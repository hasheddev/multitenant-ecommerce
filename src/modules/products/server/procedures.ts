import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { productSchema } from "../schema";
import type { Where } from "payload";
import { Category } from "@/payload-types";

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure.input(productSchema).query(async ({ ctx, input }) => {
    const where: Where = {};
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
    const data = await ctx.db.find({
      collection: "products",
      pagination: true,
      depth: 1, //populate nested documents category & image
      where,
      //   sort: "name",
    });

    return data;
  }),
});
