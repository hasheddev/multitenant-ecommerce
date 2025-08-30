"use client";

import { InboxIcon, LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useTRPC } from "@/trpc/client";
import { useCart } from "../../hooks/use-cart";
import { generateTenantURL } from "@/lib/utils";
import { CheckOutItem } from "../components/checkout-item";
import { CheckoutSidebar } from "../components/checkout-sidebar";
import { useCheckoutStates } from "../../hooks/use-checkout";

const CheckoutView = ({ slug: tenantSlug }: { slug: string }) => {
  const [states, setStates] = useCheckoutStates();
  const { productIds, clearCart, removeProduct } = useCart(tenantSlug);
  const router = useRouter();

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, error, isLoading } = useQuery(
    trpc.checkout.getProducts.queryOptions({ ids: productIds })
  );

  const purchase = useMutation(
    trpc.checkout.purchase.mutationOptions({
      onMutate: () => {
        setStates({ success: false, cancel: false });
      },
      onSuccess: (data) => {
        window.location.href = data.url;
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === "UNAUTHORIZED") {
          router.push("/sign-in");
        }
      },
    })
  );

  useEffect(() => {
    if (error?.data?.code === "NOT_FOUND") {
      clearCart();
      toast.warning("Invalid products found, cart has been cleared cleared");
    }
  }, [error, clearCart]);

  useEffect(() => {
    if (states.success) {
      setStates({ success: false, cancel: false });
      clearCart();
      queryClient.invalidateQueries(trpc.library.getMany.infiniteQueryFilter());
      router.push("/library");
    }
  }, [
    states.success,
    clearCart,
    router,
    setStates,
    queryClient,
    trpc.library.getMany,
  ]);

  if (isLoading) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <LoaderIcon className="animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!data || data.docs.length === 0) {
    return (
      <div className="lg:pt-16 pt-4 px-4 lg:px-12">
        <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
          <InboxIcon />
          <p className="text-base font-medium">No products found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pt-16 pt-4 px-4 lg:px-12">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="border rounded-md overflow-hidden bg-white">
            {data?.docs.map((product, index) => (
              <CheckOutItem
                key={index}
                isLast={index === data.docs.length - 1}
                imageUrl={product.image?.url}
                name={product.name}
                productUrl={`${generateTenantURL(product.tenant.slug)}/products/${product.id}`}
                tenantUrl={generateTenantURL(product.tenant.slug)}
                tenantName={product.tenant.name}
                price={product.price}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>
        </div>
        <div className="lg:col-span-3">
          <CheckoutSidebar
            total={data.totalPrice}
            isCanceled={states.cancel}
            disabled={purchase.isPending}
            onPurchase={() => purchase.mutate({ tenantSlug, productIds })}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutView;
