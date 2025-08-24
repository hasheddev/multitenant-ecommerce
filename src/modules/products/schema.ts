import z from "zod";

export const productSchema = z.object({
  category: z.string().nullable().optional(),
});
