import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { ProductList } from "../components/product-list";
import { Suspense } from "react";
import { ProductCardSkeleton } from "../components/product-card";

export const LibraryView = () => {
  return (
    <div className="min-h-screen bg-white">
      <nav className="p-4 bg-[#f4f4f0] w-full border-b">
        <Link prefetch href="/" className="flex items-center">
          <ArrowLeftIcon className="size-4" />
          <span className="text-base font-medium">Continue shopping</span>
        </Link>
      </nav>
      <header className="bg-[#f4f4f0] py-8 border-b">
        <div className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 flex flex-col gap-y-4">
          <h1 className="font-medium text-[40px]">Library</h1>
          <p className="font-medium">Your purchases and reviews</p>
        </div>
      </header>
      <section className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10">
        <Suspense fallback={<ProductCardSkeleton />}>
          <ProductList />
        </Suspense>
      </section>
    </div>
  );
};
