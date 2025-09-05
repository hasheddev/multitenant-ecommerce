import z from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { callAgent } from "../agent";
import { Message } from "@/payload-types";

export const chatRouter = createTRPCRouter({
  getChatMessages: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user.id;
    const chatDocs = await ctx.db.find({
      collection: "ai-chat",
      pagination: false,
      depth: 0,
      where: {
        user: {
          equals: user,
        },
      },
    });
    const chat = chatDocs.docs[0];
    if (!chat) {
      const newChat = await ctx.db.create({
        collection: "ai-chat",
        data: {
          user,
        },
      });
      const messages: Message[] = [];
      return { messages, chatId: newChat.id };
    }
    const messageDocs = await ctx.db.find({
      collection: "messages",
      pagination: false,
      depth: 0,
      where: {
        chat: {
          equals: chat.id,
        },
      },
    });

    const messages = messageDocs.docs.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return -1;
      }
      if (a.createdAt > b.createdAt) {
        return 1;
      }
      return 0;
    });
    return { messages, chatId: chat.id };
  }),

  sendMessage: protectedProcedure
    .input(
      z.object({ threadId: z.string().min(4), message: z.string().min(1) })
    )
    .mutation(async ({ input, ctx }) => {
      const initialMessage = input.message;
      const threadId = input.threadId;
      let response;
      try {
        await ctx.db.create({
          collection: "messages",
          data: {
            author: "user",
            message: initialMessage,
            chat: threadId,
          },
        });
        response = await callAgent(initialMessage, threadId);
        await ctx.db.create({
          collection: "messages",
          data: {
            author: "ai-bot",
            message: response as string,
            chat: threadId,
          },
        });
        return { success: true };
      } catch (error) {
        console.error("Error in chat", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
        });
      }
    }),
});
