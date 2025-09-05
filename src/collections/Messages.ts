import type { CollectionConfig } from "payload";

import { isSuperAdmin } from "@/lib/access";
import { isSuperAdminOrSelf } from "./Chats";

export const Messages: CollectionConfig = {
  slug: "messages",
  access: {
    create: ({ req }) => isSuperAdmin(req.user),
    read: (req) => isSuperAdminOrSelf(req), // All authenticated users can read messages
    update: ({ req }) => isSuperAdmin(req.user), // Only a super admin can edit a message
    delete: ({ req }) => isSuperAdmin(req.user), // Only a super admin can delete a message
  },
  fields: [
    {
      name: "message",
      required: true,
      type: "text",
    },
    {
      name: "author",
      type: "select",
      options: ["ai-bot", "user"],
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "chat",
      type: "relationship",
      relationTo: "ai-chat",
      hasMany: false,
      required: true,
      label: "Parent Chat",
      admin: {
        readOnly: true,
        position: "sidebar",
      },
    },
  ],
};
