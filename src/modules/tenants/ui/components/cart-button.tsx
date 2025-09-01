import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "../../../../components/ui/button";
import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  tenantSlug: string;
  productId: string;
  isPurchased?: boolean;
}

export const CartButton = ({ tenantSlug, productId, isPurchased }: Props) => {
  const cart = useCart(tenantSlug);

  const isInCart = cart.isProductInCart(productId);

  if (isPurchased) {
    return (
      <Button
        variant="elevated"
        asChild
        className="flex-1 font-medium bg-white"
      >
        <Link href={`${process.env.NEXT_PUBLIC_APP_URL!}/library/${productId}`}>
          View in Library
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => cart.toggleProduct(productId)}
      variant="elevated"
      className={cn("flex-1 bg-pink-400", isInCart && "bg-white")}
    >
      {isInCart ? "Remove from cart" : "Add to cart"}
    </Button>
  );
};
