import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

import { useCart } from "@/modules/checkout/hooks/use-cart";

interface Props {
  tenantSlug: string;
  productId: string;
}

export const CartButton = ({ tenantSlug, productId }: Props) => {
  const cart = useCart(tenantSlug);

  const isInCart = cart.isProductInCart(productId);

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
