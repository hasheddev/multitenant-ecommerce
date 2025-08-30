"use client";

import Link from "next/link";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { ReviewSidebar } from "../components/review-sidebar";

interface Props {
  productId: string;
}

export const ProductView = ({ productId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const { data, error } = useSuspenseQuery(
    trpc.library.getOne.queryOptions({ productId })
  );

  if (error?.data?.code === "UNAUTHORIZED") {
    router.push("/sign-in");
  }
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-4 bg-[#f4f4f0] w-full border-b">
        <Link prefetch href="/library" className="flex items-center">
          <ArrowLeftIcon className="size-4" />
          <span className="text-base font-medium">Back to Library</span>
        </Link>
      </nav>
      <header className="bg-[#f4f4f0] py-8 border-b">
        <div className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12">
          <h1 className="font-medium text-[40px]">{data.name}</h1>
        </div>
      </header>
      <section className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="p-4 bg-white rounded-md border gap-4">
              <ReviewSidebar productId={productId} />
            </div>
          </div>
          <div className="lg:col-span-5">
            <p className="font-medium italic text-muted-foreground">
              No special content
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
