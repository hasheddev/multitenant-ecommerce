import z from "zod";

import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { callAgent } from "../utils";

export const authRouter = createTRPCRouter({
  newChat: protectedProcedure
    .input(z.object({ message: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const inittialMessage = input.message;
      const threadId = Date.now().toString();
      let response;
      try {
        response = await callAgent(ctx.db, inittialMessage, threadId);
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
        });
      }
      return { response, threadId };
    }),

  sendMessage: protectedProcedure
    .input(
      z.object({ threadId: z.string().min(4), message: z.string().min(1) })
    )
    .mutation(async ({ ctx, input }) => {
      const inittialMessage = input.message;
      const threadId = input.threadId;
      let response;
      try {
        response = await callAgent(ctx.db, inittialMessage, threadId);
      } catch (error) {
        console.error("Error in chat", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
        });
      }
      return { response };
    }),
});
