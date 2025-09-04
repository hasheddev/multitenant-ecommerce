import type { CollectionConfig, CollectionAfterChangeHook } from "payload";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";

import { Tenant } from "@/payload-types";
import { isSuperAdmin } from "@/lib/access";
import { createProductSummary } from "@/utils";

export type ReviewData = {
  description: string;
  rating: number;
  product: string;
  user: string;
};

const afterChangeHook: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
  previousDoc,
}) => {
  // If the hook is running due to an internal update, skip to prevent an infinite loop.
  if (req.context.skipAfterChangeHook) {
    return doc;
  }

  // 1. Determine if the embedding needs to be regenerated.
  let shouldRegenerateEmbedding = false;

  if (operation === "create") {
    shouldRegenerateEmbedding = true;
  }

  if (operation === "update") {
    // Correctly serialize and compare richText fields to detect a change.
    const newDescription = JSON.stringify(doc.description);
    const oldDescription = JSON.stringify(previousDoc.description);

    // Also check if the category or name has changed.
    const categoryChanged = doc.category !== previousDoc.category;
    const nameChanged = doc.name !== previousDoc.name;

    const priceChange = doc.price !== previousDoc.price;

    if (
      newDescription !== oldDescription ||
      categoryChanged ||
      nameChanged ||
      priceChange
    ) {
      shouldRegenerateEmbedding = true;
    }
  }

  // 2. If no changes were detected, exit early.
  if (!shouldRegenerateEmbedding) {
    return doc;
  }

  // 3. All regeneration logic is now in a single block.
  try {
    // Find all reviews for the product.
    const reviews = await req.payload.find({
      collection: "reviews",
      depth: 0,
      where: {
        product: {
          equals: doc.id,
        },
      },
    });

    let reviewData = reviews.docs.map((review) => ({
      description: review.description,
      rating: review.rating,
      product: (review.product as string) || "",
      user: (review.user as string) || "",
    })) as ReviewData[];

    if (reviews.docs.length === 0) {
      reviewData = [];
    }

    // Safely get the category name regardless of the query depth.
    let categoryName = "";
    if (typeof doc.category === "object" && doc.category !== null) {
      categoryName = doc.category.name as string;
    } else if (typeof doc.category === "string") {
      const prodCategory = await req.payload.findByID({
        collection: "categories",
        id: doc.category as string,
        depth: 0,
      });
      categoryName = prodCategory?.name || "";
    }

    const productDocument = {
      ...doc,
      category: categoryName,
      description: convertLexicalToPlaintext({ data: doc.description }),
    };

    // Create a comprehensive summary for the embedding.
    const text = await createProductSummary(productDocument, reviewData);

    // Initialize and generate the embedding vector.
    const embeddingModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "text-embedding-004",
    });

    const [embedding] = await embeddingModel.embedDocuments([text]);
    const vector = embedding || [];

    // Update the product with the new embedding and source text.
    await req.payload.update({
      collection: "products",
      id: doc.id,
      data: {
        embedding_text: text,
        embedding: vector,
      },
      context: { skipAfterChangeHook: true }, // CRITICAL to prevent infinite loop
    });
  } catch (error) {
    console.error(
      "An error occurred during afterChange hook for Products:",
      error
    );
  }

  // Always return the document at the end of the hook
  return doc;
};

export const Products: CollectionConfig = {
  slug: "products",
  hooks: {
    afterChange: [afterChangeHook],
  },
  access: {
    read: () => true,
    create: ({ req }) => {
      if (isSuperAdmin(req.user)) return true;
      const tenant = req.user?.tenants?.[0]?.tenant as Tenant;
      return Boolean(tenant?.stripeDetailsSubmitted);
    },
    delete: ({ req }) => {
      return isSuperAdmin(req.user);
    },
  },
  admin: {
    useAsTitle: "name",
    description: "You must verify your account before creating products",
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "description", type: "richText" },
    {
      name: "price",
      type: "number",
      required: true,
      admin: {
        description: "Price in USD",
      },
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
    },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "tags", type: "relationship", relationTo: "tags", hasMany: true },
    {
      name: "refundPolicy",
      type: "select",
      options: ["30-day", "14-day", "7-day", "3-day", "1-day", "no-refunds"],
      defaultValue: "30-day",
    },
    {
      name: "content",
      type: "richText",
      admin: {
        description:
          "Protected content only visible to customers after purchase. Add product documentation, downloadable files, getting started guides and bonus materials, Supports Markdown formatting",
      },
    },
    {
      name: "isArchived",
      label: "Archive",
      defaultValue: false,
      type: "checkbox",
      admin: {
        description: "If checked this product will be archived",
      },
    },
    {
      name: "isPrivate",
      label: "Private",
      defaultValue: false,
      type: "checkbox",
      admin: {
        description:
          "If checked this product will not be shown on the public storefront",
      },
    },
    {
      name: "reviews",
      type: "relationship",
      relationTo: "reviews",
      hasMany: true,
      admin: {
        readOnly: true,
        position: "sidebar", // Optional: show this in the sidebar
      },
    },
    {
      name: "embedding_text",
      type: "text",
      label: "Embedding Text",
      admin: {
        hidden: true, // This field is hidden from the admin UI
      },
    },
    //     // The new `json` field to store the embedding vector
    {
      name: "embedding",
      label: "Embedding Vector",
      type: "json", // Using a JSON type to store the raw array
      admin: {
        hidden: true,
      },
    },
  ],
};
