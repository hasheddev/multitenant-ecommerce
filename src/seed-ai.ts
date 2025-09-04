import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { getPayload } from "payload";
import config from "@payload-config";
import z from "zod";

import "dotenv/config";
import { MongoClient } from "mongodb";
import { Category, Product } from "./payload-types";
import { createProductSummary } from "./utils";

const client = new MongoClient(process.env.DATABASE_URI!);
const payload = await getPayload({ config });

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY!,
});

// Define the categories for the LLM prompt
const categories = [
  {
    name: "Business & Money",
    slug: "business-money",
    subcategories: [
      "Accounting",
      "Entrepreneurship",
      "Investing",
      "Marketing & Sales",
      "Personal Finance",
    ],
  },
  {
    name: "Software Development",
    slug: "software-development",
    subcategories: [
      "Web Development",
      "Mobile Development",
      "Game Development",
      "DevOps",
    ],
  },
  {
    name: "Writing & Publishing",
    slug: "writing-publishing",
    subcategories: ["Fiction", "Non-Fiction", "Blogging", "Copywriting"],
  },
];

// Define Zod schemas for validation
const productSchema = z.object({
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

const reviewSchema = z.object({
  description: z.string().min(2),
  rating: z.number().min(1).max(5),
  product: z.string(),
  user: z.string(),
});

type ProductData = z.infer<typeof productSchema>;
type ReviewData = z.infer<typeof reviewSchema>;

const getHelperData = async () => {
  const categorySlugs = categories.map((category) => category.slug);

  const categoryData = await payload.find({
    collection: "categories",
    pagination: false,
    where: {
      slug: {
        in: categorySlugs,
      },
    },
  });
  const user = await payload.find({
    collection: "users",
    depth: 0,
    where: {
      username: { equals: "demon" },
    },
  });
  return { categories: categoryData.docs, user };
};

interface SimpleTextNode {
  [k: string]: unknown;
  detail: number;
  format: number;
  mode: "normal";
  text: string;
  type: "text";
  version: number;
}

interface SimpleParagraphNode {
  [k: string]: unknown;
  children: SimpleTextNode[];
  direction: "ltr" | "rtl" | null;
  format: "" | "left" | "start" | "center" | "right" | "end" | "justify";
  indent: number;
  type: "paragraph";
  version: number;
}

interface SimpleRichText {
  [k: string]: unknown;
  root: {
    [k: string]: unknown;
    children: SimpleParagraphNode[];
    direction: "ltr" | "rtl" | null;
    format: "";
    indent: number;
    type: "root";
    version: number;
  };
}

async function convertStringToRichText(plainString: string) {
  // Get the default editor config for your Payload setup
  const review: SimpleRichText = {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: "normal",
              text: plainString,
              type: "text",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
  return review;
}

type CreateData = {
  pageContent: string;
  metadata: { product: ProductData; reviews: ReviewData[] };
};

const createDocuments = async (
  data: CreateData,
  categories: Category[],
  embedding: number[],
  tenant: string,
  userId: string
) => {
  const category = categories.find(
    (category) =>
      category.name.toLowerCase() ===
      data.metadata.product.category.toLowerCase()
  );
  const categoryId = category?.id || categories[0]?.id;

  if (!categoryId || !userId || !tenant) {
    throw new Error("CategoryId, UserId or TenantId not provided");
  }
  const { metadata, pageContent } = data;

  const richText = await convertStringToRichText(metadata.product.description);

  const product: Product = await payload.create({
    collection: "products",
    data: {
      name: metadata.product.name,
      description: richText,
      price: metadata.product.price,
      category: categoryId,
      tenant,
      refundPolicy: metadata.product.refundPolicy,
      embedding_text: pageContent,
      embedding,
    },
  });
  const reviewsPromise = metadata.reviews.map(async (review) => {
    const newReview = await payload.create({
      collection: "reviews",
      data: {
        rating: review.rating,
        description: review.description,
        product: product.id,
        user: userId,
      },
    });
    return newReview;
  });
  const reviews = await Promise.all(reviewsPromise);
  const ids = await reviews.map((review) => review.id);
  await payload.update({
    collection: "products",
    id: product.id,
    data: {
      reviews: ids,
    },
    context: { skipAfterChangeHook: true },
  });
};

async function generateProductData(): Promise<ProductData[]> {
  const parser = StructuredOutputParser.fromZodSchema(z.array(productSchema));

  const prompt = `You are a helpful assistant that generates clean, well-structured JSON data for a database.
  
  Generate an array of 15 store items. Each item must conform to the following JSON schema:
  
  ${parser.getFormatInstructions()}

  For each of the 15 items, generate:
  - A name and description of an e-commerce product.
  - A price between 10 and 500.
  - A category that is one of: ${categories.map((c) => c.name).join(", ")}.
  - A placeholder image ID.
  - A realistic array of tags.
  - A random refundPolicy.
  - content for the product.
  - isArchived and isPrivate booleans.
  
  Ensure that the output is a single, valid JSON array. Do not include any extra fields, comments, or text outside of the JSON.`;

  const response = await llm.invoke(prompt);

  return parser.parse(response.content as string);
}

async function generateReviewDataForProduct(
  product: ProductData
): Promise<{ product: ProductData; reviews: ReviewData[] }> {
  const parser = StructuredOutputParser.fromZodSchema(z.array(reviewSchema));

  const prompt = `You are a helpful assistant that generates a single, clean JSON object for a database.
  
  Generate 2 to 4 reviews for the following product:
  - Name: "${product.name}"
  - Description: "${product.description}"
  
  The reviews must conform to the following JSON schema:
  
  ${parser.getFormatInstructions()}
  
  Each review should have a rating between 1 and 5 and a realistic description that is relevant to the product's name and description.
  
  Ensure that the output is a single, valid JSON array. Do not include any extra fields, comments, or text outside of the JSON.`;

  console.log(`Generating review for product: ${product.name}...`);
  const response = await llm.invoke(prompt);

  const reviews = await parser.parse(response.content as string);

  return { product, reviews };
}

async function generateSyntheticData() {
  // Step 1: Generate products
  const products = await generateProductData();

  const productWithReviews = products.map(async (product) =>
    generateReviewDataForProduct(product)
  );
  const data = await Promise.all(productWithReviews);
  return data;
}

async function setUpDbAndCollections() {
  console.log("Setting up db and collection");
  const db = client.db("ecommerce");
  const collections = await db.listCollections({ name: "products" }).toArray();
  const reviewCollection = await db
    .listCollections({ name: "reviews" })
    .toArray();
  if (collections.length == 0) {
    await db.createCollection("products");
    console.log("Created Products");
  } else {
    console.log("Products already exists");
  }

  if (reviewCollection.length == 0) {
    await db.createCollection("reviews");
    console.log("Created reviews");
  } else {
    console.log("Reviews already exists");
  }
}

//products
//reviews  ecommerce
async function createVectorSearchIndex() {
  try {
    const db = client.db("ecommerce");
    const products = await db.collection("products");
    await products.dropIndexes();
    const vectorSearchIndex = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 768,
            similarity: "cosine",
          },
        ],
      },
    };
    console.log("Creating vector search index");
    await products.createSearchIndex(vectorSearchIndex);
    console.log("Search index creation successfull");
  } catch (error) {
    console.error("Failed to create index", error);
  }
}

async function seedDatabase(): Promise<void> {
  try {
    await setUpDbAndCollections();
    await createVectorSearchIndex();

    console.log("Clearing existing data...");
    await payload.delete({ collection: "products", where: {} });
    await payload.delete({ collection: "reviews", where: {} });
    console.log("Existing data cleared.");
    const data = await generateSyntheticData();
    const recordsWithSummaries = await Promise.all(
      data.map(async (record) => ({
        pageContent: await createProductSummary(record.product, record.reviews),
        metadata: { ...record },
      }))
    );

    const embeddingModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY,
      modelName: "text-embedding-004",
    });

    const { categories, user } = await getHelperData();
    const tenant = (user.docs?.[0]?.tenants?.[0]?.tenant as string) || "";
    const userId = user.docs?.[0]?.id || "";

    for (const record of recordsWithSummaries) {
      const [embedding] = await embeddingModel.embedDocuments([
        record.pageContent,
      ]);

      const vectorEmbedding = embedding || [];

      await createDocuments(
        record,
        categories,
        vectorEmbedding,
        tenant,
        userId
      );
      console.log(
        "Created product",
        `${record.metadata.product.name} : ${record.metadata.product.category}`
      );
    }
    console.log("seeding success");
  } catch (error) {
    console.error();
    console.error(error);
  } finally {
    await client.close();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(console.error);
