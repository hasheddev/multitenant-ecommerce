import type {
  CollectionConfig,
  CollectionAfterDeleteHook,
  CollectionAfterChangeHook,
} from "payload";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";

import { isSuperAdmin } from "@/lib/access";
import { createProductSummary } from "@/utils";
import { Category } from "@/payload-types";
import { ReviewData } from "./Products";

type ProductData = {
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  refundPolicy:
    | "30-day"
    | "14-day"
    | "7-day"
    | "3-day"
    | "1-day"
    | "no-refunds";
  content: string;
  isArchived: boolean;
  isPrivate: boolean;
  image?: string | undefined;
};

// Assume createProductSummary and convertLexicalToPlaintext are defined elsewhere

const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}) => {
  try {
    // Only run this logic on 'create' and 'update' operations.
    if (operation === "create" || operation === "update") {
      // Re-fetch the product associated with the review.
      const product = await req.payload.findByID({
        collection: "products",
        depth: 2, // Fetch related documents, including reviews.
        id: doc.product,
      });

      if (!product) {
        return doc;
      }

      // Find all reviews for the product, including the one just changed.
      const reviews = await req.payload.find({
        collection: "reviews",
        depth: 0,
        where: {
          product: {
            equals: product.id,
          },
        },
      });

      const reviewData = reviews.docs.map((review) => ({
        description: review.description,
        rating: review.rating,
        product: review.product as string,
        user: review.user as string,
      })) as ReviewData[];

      // Safely get the category name regardless of the query depth.
      let categoryName = "";
      if (typeof product.category === "object" && product.category !== null) {
        categoryName = product.category.name as string;
      } else if (typeof product.category === "string") {
        const prodCategory = await req.payload.findByID({
          collection: "categories",
          id: product.category as string,
          depth: 0,
        });
        categoryName = prodCategory?.name || "";
      }

      const descriptionText = product.description
        ? convertLexicalToPlaintext({ data: product.description })
        : "";
      const productDocument = {
        ...product,
        category: categoryName,
        description: descriptionText,
      } as unknown as ProductData;

      // Recreate the comprehensive summary for the embedding.
      const text = await createProductSummary(productDocument, reviewData);

      // Initialize the embedding model.
      const embeddingModel = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_API_KEY,
        modelName: "text-embedding-004",
      });

      // Generate the new embedding vector.
      const [embedding] = await embeddingModel.embedDocuments([text]);
      const vector = embedding || [];

      // Update the product with the new embedding and the source text.
      await req.payload.update({
        collection: "products",
        id: product.id,
        data: {
          embedding_text: text,
          embedding: vector,
        },
        // This context is CRITICAL to prevent an infinite loop.
        context: { skipAfterChangeHook: true },
      });
    }
  } catch (error) {
    req.payload.logger.error(
      `An error occurred during afterChange hook for Reviews: ${error}`
    );
  }
  return doc;
};

const afterDeleteHook: CollectionAfterDeleteHook = async ({ req, doc }) => {
  try {
    // Re-fetch the product associated with the deleted review.
    // The doc parameter in afterDelete contains the document before it was deleted.
    const product = await req.payload.findByID({
      collection: "products",
      depth: 2,
      id: doc.product,
    });

    if (!product) {
      console.error(
        `Product with ID ${doc.product} not found after review deletion.`
      );
      return;
    }

    // Find all remaining reviews for the product.
    const reviews = await req.payload.find({
      collection: "reviews",
      depth: 0,
      where: {
        product: {
          equals: product.id,
        },
      },
    });

    // Create a simplified array of review data from the remaining reviews.
    const reviewData = reviews.docs.map((review) => ({
      description: review.description,
      rating: review.rating,
      product: review.product as string,
      user: review.user as string,
    }));
    let data = "";
    // Recreate the comprehensive summary for the embedding.
    if (product.description) {
      data = convertLexicalToPlaintext({ data: product.description });
    }
    const category = product.category as Category;
    const document: ProductData = {
      name: product.name,
      description: data,
      category: category.name,
      price: product.price,
      tags: [],
      refundPolicy: "14-day",
      content: "",
      isArchived: false,
      isPrivate: false,
    };
    const text = await createProductSummary(document, reviewData);

    // Initialize the embedding model.
    const embeddingModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "text-embedding-004",
    });

    // Generate the new embedding vector.
    const [embedding] = await embeddingModel.embedDocuments([text]);
    const vector = embedding || [];

    // Update the product with the new embedding and the source text.
    await req.payload.update({
      collection: "products",
      id: product.id,
      data: {
        embedding_text: text,
        embedding: vector,
      },
      // This context is CRITICAL to prevent an infinite loop.
      context: { skipAfterChangeHook: true },
    });
  } catch (error) {
    console.error("An error occurred during afterDelete hook:", error);
  }
};

export const Reviews: CollectionConfig = {
  slug: "reviews",
  hooks: {
    afterChange: [afterChangeHook],
    afterDelete: [afterDeleteHook],
  },
  access: {
    read: ({ req }) => isSuperAdmin(req.user),
    create: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user),
    update: ({ req }) => isSuperAdmin(req.user),
  },
  admin: {
    useAsTitle: "description",
  },
  fields: [
    {
      name: "description",
      type: "textarea",
      required: true,
    },

    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
    },

    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      hasMany: false,
    },
    { name: "user", type: "relationship", relationTo: "users", hasMany: false },
  ],
};
