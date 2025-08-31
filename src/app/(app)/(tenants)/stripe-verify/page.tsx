"use client";

import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";

const Page = () => {
  const trpc = useTRPC();
  const { mutate: verify } = useMutation(
    trpc.checkout.verify.mutationOptions({
      onSuccess: (data) => (window.location.href = data.url),
      onError: (error) => {
        toast.error(error.message);
        window.location.href = "/";
      },
    })
  );

  useEffect(() => {
    verify();
  }, [verify]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoaderIcon className="animate-spin text-black" />
    </div>
  );
};

export default Page;
