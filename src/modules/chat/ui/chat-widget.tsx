"use client";

import {
  BotMessageSquareIcon,
  Loader2Icon,
  SendHorizonalIcon,
} from "lucide-react";
import { toast } from "sonner";

import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery({
    ...trpc.chat.getChatMessages.queryOptions(),
    enabled: !!userId,
  });

  const {
    data: session,
    error: userError,
    isLoading: isLoadingUser,
  } = useQuery(trpc.auth.session.queryOptions());

  const { isPending, mutate } = useMutation(
    trpc.chat.sendMessage.mutationOptions({
      onError: (error) => toast.error(error.message),
      onSuccess: () =>
        queryClient.invalidateQueries(trpc.chat.getChatMessages.queryFilter()),
    })
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [data?.messages]);

  useEffect(() => {
    if (session) {
      if (session.user) {
        setUserId(session.user.id);
      } else {
        setUserId("");
      }
    }
  }, [session]);

  useEffect(() => {
    if (userId === "" && isOpen && session !== undefined) {
      toast.message("Sign in to chat with our shop assistant");
    }
  }, [userId, isOpen, session]);

  useEffect(() => {
    if (error) {
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }

    if (userError) {
      if (userError.message) {
        toast.error(userError.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  }, [error, userError]);

  const handleSendMessage = () => {
    if (message.trim() && data?.chatId) {
      mutate({ message, threadId: data.chatId });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const route = usePathname();
  const isVisible = route !== "/sign-in" && route !== "/sign-up";

  return (
    <div>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className={`
            bg-black text-white hover:bg-pink-400 cursor-pointer font-bold p-4 rounded-full shadow-lg
            transition-all duration-300 transform hover:scale-110
            flex items-center justify-center
            ${!isVisible ? "hidden" : ""}
          `}
        >
          <BotMessageSquareIcon size={28} />
        </button>
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent className="w-[75dvh] h-[75dvh] flex flex-col p-4 rounded-xl shadow-2xl bg-white border-none">
          <DialogHeader className="border-b pb-4">
            <DialogTitle>
              <div className="flex justify-between items-center px-8">
                <p className="text-xl font-bold">How can I help you today?</p>
                <BotMessageSquareIcon size={28} className="text-pink-400" />
              </div>
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-1 px-2 font-semibold">
              I&apos;m your virtual assistant for funroad.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden p-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2Icon className="animate-spin text-gray-400 h-10 w-10" />
              </div>
            ) : data?.messages.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500">
                <p>No messages yet. Send a greeting!</p>
              </div>
            ) : (
              <ScrollArea className="h-full w-full">
                <div className="flex flex-col gap-4 p-3">
                  {data?.messages.map((message, index) => (
                    <div
                      ref={
                        index === data.messages.length - 1
                          ? messagesEndRef
                          : null
                      }
                      className={cn(
                        "max-w-[70%] p-3 rounded-xl shadow-sm",
                        message.author === "ai-bot"
                          ? "self-start bg-gray-100 text-gray-800"
                          : "self-end bg-black text-white"
                      )}
                      key={index}
                    >
                      <p className="font-medium text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>
                <ScrollBar
                  orientation="vertical"
                  className="w-2 rounded-full bg-gray-300 ml-2"
                ></ScrollBar>
              </ScrollArea>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 flex items-center gap-2">
            <textarea
              className="flex-1 p-3 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none shadow-sm"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={1}
              onKeyDown={handleKeyDown}
              disabled={isPending || isLoading || isLoadingUser}
            ></textarea>
            <button
              onClick={handleSendMessage}
              disabled={isPending || isLoading || message.trim() === ""}
              className="p-3 bg-black text-white rounded-lg cursor-pointer hover:bg-pink-400 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isPending ? (
                <Loader2Icon className="animate-spin" size={25} />
              ) : (
                <SendHorizonalIcon size={25} />
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
