import type { CollectionConfig } from "payload";

export const Orders: CollectionConfig = {
  slug: "orders",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    { name: "user", type: "relationship", relationTo: "users", hasMany: false },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      hasMany: false,
    },
    { name: "stripeCheckoutSessionId", type: "text", required: true },
  ],
};
