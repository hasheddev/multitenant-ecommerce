import { useCartStore } from "../store/use-cart-store";

export const useCart = (tenantSlug: string) => {
  const {
    getCartByTenant,
    addProduct,
    removeProduct,
    clearAllCarts,
    clearCart,
  } = useCartStore();

  const productIds = getCartByTenant(tenantSlug);

  const toggleProduct = (productId: string) => {
    if (productIds.includes(productId)) {
      removeProduct(tenantSlug, productId);
    } else {
      addProduct(tenantSlug, productId);
    }
  };

  const isProductInCart = (productId: string) => productIds.includes(productId);

  const clearTenantCart = () => clearCart(tenantSlug);

  return {
    productIds,
    totalItems: productIds.length,
    clearAllCarts,
    clearCart: clearTenantCart,
    toggleProduct,
    isProductInCart,
    addProduct: (productId: string) => addProduct(tenantSlug, productId),
    removeProduct: (productId: string) => removeProduct(tenantSlug, productId),
  };
};
