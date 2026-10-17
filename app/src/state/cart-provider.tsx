import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

import { addOrMergeLine, calculateCartTotals, updateLineQuantity } from "@/domain/cart";
import { evaluateCoupon } from "@/domain/coupon";
import type {
  CartLine,
  CartLineId,
  CartTotals,
  Coupon,
  CouponEvaluation,
  CouponRejection,
  Fen,
  FulfillmentMode,
  ProductId,
} from "@/domain/types";
import { coupons, products } from "@/data/fixtures";
import { fen } from "@/domain/money";
import { useCatalog } from "@/state/catalog-provider";

export interface DemoConfirmation {
  fulfillmentMode: FulfillmentMode;
  id: string;
  storeName: string;
  totalFen: Fen;
}

interface CartContextValue {
  addLine(line: CartLine): void;
  applyCoupon(code: string): CouponRejection | undefined;
  availableCoupons: readonly Coupon[];
  confirmCheckout(deliveryAddress?: string): { error?: string; id?: string; ok: boolean };
  couponEvaluation?: CouponEvaluation;
  lastConfirmation?: DemoConfirmation;
  lines: readonly CartLine[];
  removeLine(id: CartLineId): void;
  selectedCoupon?: Coupon;
  totals: CartTotals;
  updateQuantity(id: CartLineId, quantity: number): void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function maximumFor(productId: ProductId): number {
  return products.find(({ id }) => id === productId)?.maxQuantity ?? 1;
}

export function CartProvider({ children }: PropsWithChildren) {
  const { fulfillmentMode, selectedStore } = useCatalog();
  const [lines, setLines] = useState<readonly CartLine[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon>();
  const [lastConfirmation, setLastConfirmation] = useState<DemoConfirmation>();
  const couponEvaluation = useMemo(
    () =>
      selectedCoupon && selectedStore
        ? evaluateCoupon(selectedCoupon, lines, selectedStore, new Date().toISOString(), products)
        : undefined,
    [lines, selectedCoupon, selectedStore],
  );
  const totals = calculateCartTotals(
    lines,
    couponEvaluation?.eligible ? couponEvaluation.discountFen : fen(0),
  );

  const value = useMemo<CartContextValue>(
    () => ({
      addLine(line) {
        setLines((current) => addOrMergeLine(current, line, maximumFor(line.productId)));
      },
      applyCoupon(code) {
        const coupon = coupons.find((item) => item.code === code.trim().toUpperCase());
        setSelectedCoupon(coupon);
        if (!coupon || !selectedStore) return "invalid-code";
        return evaluateCoupon(coupon, lines, selectedStore, new Date().toISOString(), products)
          .rejection;
      },
      availableCoupons: coupons,
      confirmCheckout(deliveryAddress) {
        if (!selectedStore) return { error: "Choose a store before checkout.", ok: false };
        if (!lines.length) return { error: "Add at least one item before checkout.", ok: false };
        if (fulfillmentMode === "delivery" && !deliveryAddress) {
          return { error: "Choose the demo delivery address.", ok: false };
        }
        const id = `BG-${Date.now().toString(36).toUpperCase()}`;
        setLastConfirmation({
          fulfillmentMode,
          id,
          storeName: selectedStore.name,
          totalFen: totals.totalFen,
        });
        setLines([]);
        setSelectedCoupon(undefined);
        return { id, ok: true };
      },
      couponEvaluation,
      lastConfirmation,
      lines,
      removeLine(id) {
        setLines((current) => current.filter((line) => line.id !== id));
      },
      selectedCoupon,
      totals,
      updateQuantity(id, quantity) {
        setLines((current) => {
          const line = current.find((item) => item.id === id);
          return line
            ? updateLineQuantity(current, id, quantity, maximumFor(line.productId))
            : current;
        });
      },
    }),
    [
      couponEvaluation,
      fulfillmentMode,
      lastConfirmation,
      lines,
      selectedCoupon,
      selectedStore,
      totals,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
