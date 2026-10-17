import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

import { addOrMergeLine, calculateCartTotals, updateLineQuantity } from "@/domain/cart";
import type { CartLine, CartLineId, CartTotals, ProductId } from "@/domain/types";
import { products } from "@/data/fixtures";

interface CartContextValue {
  addLine(line: CartLine): void;
  lines: readonly CartLine[];
  removeLine(id: CartLineId): void;
  totals: CartTotals;
  updateQuantity(id: CartLineId, quantity: number): void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function maximumFor(productId: ProductId): number {
  return products.find(({ id }) => id === productId)?.maxQuantity ?? 1;
}

export function CartProvider({ children }: PropsWithChildren) {
  const [lines, setLines] = useState<readonly CartLine[]>([]);

  const value = useMemo<CartContextValue>(
    () => ({
      addLine(line) {
        setLines((current) => addOrMergeLine(current, line, maximumFor(line.productId)));
      },
      lines,
      removeLine(id) {
        setLines((current) => current.filter((line) => line.id !== id));
      },
      totals: calculateCartTotals(lines),
      updateQuantity(id, quantity) {
        setLines((current) => {
          const line = current.find((item) => item.id === id);
          return line
            ? updateLineQuantity(current, id, quantity, maximumFor(line.productId))
            : current;
        });
      },
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
