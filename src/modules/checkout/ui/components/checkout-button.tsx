import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateTenantURL, cn } from "@/lib/utils";
import { useCart } from "../../hooks/use-cart";

interface CheckoutProps {
  className?: string;
  hideIfEmpty?: boolean;
  tenantSlug: string;
}

export const CheckOutButton = ({
  className,
  hideIfEmpty,
  tenantSlug,
}: CheckoutProps) => {
  const cart = useCart(tenantSlug);
  if (hideIfEmpty && cart.totalItems === 0) return null;

  return (
    <Button variant="elevated" asChild className={cn("bg-white", className)}>
      <Link href={`${generateTenantURL(tenantSlug)}/checkout`}>
        <ShoppingCartIcon /> {cart.totalItems > 0 ? cart.totalItems : " "}
      </Link>
    </Button>
  );
};
