import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { Category } from "@/payload-types";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.find({
      collection: "categories",
      pagination: false, //load every document
      depth: 1, //populate nested document if 0 only id would be returned only up to given depth
      where: { parent: { exists: false } },
      sort: "name",
    });

    const formatedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
        ...(doc as Category),
        subcategories: undefined,
      })),
    }));
    return formatedData;
  }),
});
