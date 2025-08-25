import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SearchParams } from "nuqs";

import { getQueryClient, trpc } from "@/trpc/server";
import { loadProductFilters } from "@/modules/products/search-params";
import { ProductListView } from "@/modules/products/ui/views/product-list-view";

interface Props {
  params: Promise<{ subcategory: string }>;
  searchParams: Promise<SearchParams>;
}

const SubCategory = async ({ params, searchParams }: Props) => {
  const { subcategory: category } = await params;
  const filters = await loadProductFilters(searchParams);
  const queryClient = getQueryClient();

  if (
    typeof category === "string" &&
    category.toLowerCase() === "favicon.ico"
  ) {
    // If the category is favicon.ico, simply exit and do nothing.
    return;
  }
  void queryClient.prefetchQuery(
    trpc.products.getMany.queryOptions({ category, ...filters })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView category={category} />
    </HydrationBoundary>
  );
};

export default SubCategory;
