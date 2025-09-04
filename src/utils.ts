import z from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.string().min(1),
  image: z.string().optional(),
  tags: z.array(z.string()).min(1),
  refundPolicy: z.enum([
    "30-day",
    "14-day",
    "7-day",
    "3-day",
    "1-day",
    "no-refunds",
  ]),
  content: z.string().min(1),
  isArchived: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
});

export const reviewSchema = z.object({
  description: z.string().min(2),
  rating: z.number().min(1).max(5),
  product: z.string(),
  user: z.string(),
});

export type ProductData = z.infer<typeof productSchema>;
type ReviewData = z.infer<typeof reviewSchema>;

export async function createProductSummary(
  product: ProductData,
  reviews: ReviewData[]
): Promise<string> {
  return new Promise((resolve) => {
    const categories = product.category;
    const userReviews = reviews
      .map((review) => `Rated ${review.rating}: ${review.description}`)
      .join(" ");
    const basicInfo = `${product.name}: ${product.description}`;
    const price = product.price;
    const summary = `${basicInfo}, Categories: ${categories}, Reviews: ${userReviews}, price: ${price}`;
    resolve(summary);
  });
}
