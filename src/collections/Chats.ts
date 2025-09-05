import type { Access, CollectionConfig } from "payload";

import { isSuperAdmin } from "@/lib/access";

export const isSuperAdminOrSelf: Access = ({ req: { user } }) => {
  if (isSuperAdmin(user)) {
    return true;
  }
  if (user) {
    return {
      user: {
        equals: user.id,
      },
    };
  }
  return false;
};

export const AiChat: CollectionConfig = {
  slug: "ai-chat",
  access: {
    create: ({ req }) => isSuperAdmin(req.user), // Only authenticated users can create a chat
    read: isSuperAdminOrSelf,
    update: ({ req }) => isSuperAdmin(req.user),
    delete: ({ req }) => isSuperAdmin(req.user), // Only a super admin can delete chats
  },
  fields: [
    {
      name: "user",
      required: true,
      type: "relationship",
      relationTo: "users",
      hasMany: false,
      label: "Chat participant",
    },
  ],
};
