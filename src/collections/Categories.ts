import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  fields: [
    // Email added by default
    // Add more fields as needed
    { name: "name", type: "text", required: true },
  ],
};
