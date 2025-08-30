"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { InboxIcon } from "lucide-react";

import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { DEFAULT_LIMIT } from "@/constants";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { Button } from "@/components/ui/button";

export const ProductList = () => {
  const trpc = useTRPC();
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      trpc.library.getMany.infiniteQueryOptions(
        { limit: DEFAULT_LIMIT },
        {
          getNextPageParam: (lastPage) =>
            lastPage.docs.length > 0 ? lastPage.nextPage : undefined,
        }
      )
    );

  if (data.pages?.[0]?.docs.length === 0) {
    return (
      <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
        <InboxIcon />
        <p className="text-base font-medium">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
        )}
      >
        {data?.pages
          .flatMap((page) => page.docs)
          .map((prod) => (
            <ProductCard
              key={prod.id}
              id={prod.id}
              name={prod.name}
              imageUrl={prod.image?.url}
              tenantSlug={prod.tenant?.slug}
              tenantImageUrl={prod.tenant?.image?.url}
              reviewRating={3}
              reviewCount={5}
            />
          ))}
      </div>
      <div className="flex justify-center pt-8">
        {hasNextPage && (
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="font-medium disabled:opacity-50 text-base bg-white"
            variant="elevated"
          >
            Load more
          </Button>
        )}
      </div>
    </>
  );
};

export const ProductListSkeleton = () => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
      )}
    >
      {Array.from({ length: DEFAULT_LIMIT }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
