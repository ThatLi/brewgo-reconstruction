import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { addOrMergeLine, calculateCartTotals, updateLineQuantity } from "@/domain/cart";
import { evaluateCoupon } from "@/domain/coupon";
import { fen } from "@/domain/money";
import type {
  CartLine,
  CartLineId,
  CartTotals,
  Coupon,
  CouponEvaluation,
  CouponRejection,
  Order,
  OrderId,
  ProductId,
} from "@/domain/types";
import { coupons, modifierOptions, products } from "@/data/fixtures";
import { useCatalog } from "@/state/catalog-provider";
import { commerceStorage } from "@/storage/commerce-storage";

type StorageStatus = "loading" | "ready" | "error";

interface CartContextValue {
  addLine(line: CartLine): void;
  applyCoupon(code: string): CouponRejection | undefined;
  availableCoupons: readonly Coupon[];
  confirmCheckout(deliveryAddress?: string): Promise<{ error?: string; id?: string; ok: boolean }>;
  couponEvaluation?: CouponEvaluation;
  lastConfirmation?: Order;
  lines: readonly CartLine[];
  orders: readonly Order[];
  removeLine(id: CartLineId): void;
  selectedCoupon?: Coupon;
  storageError?: string;
  storageStatus: StorageStatus;
  totals: CartTotals;
  updateQuantity(id: CartLineId, quantity: number): void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function maximumFor(productId: ProductId): number {
  return products.find(({ id }) => id === productId)?.maxQuantity ?? 1;
}

export function CartProvider({ children }: PropsWithChildren) {
  const { fulfillmentMode, selectStore, selectedStore } = useCatalog();
  const [lines, setLines] = useState<readonly CartLine[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon>();
  const [lastConfirmation, setLastConfirmation] = useState<Order>();
  const [orders, setOrders] = useState<readonly Order[]>([]);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("loading");
  const [storageError, setStorageError] = useState<string>();

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await commerceStorage.initialize();
        const [snapshot, storedOrders] = await Promise.all([
          commerceStorage.loadSnapshot(),
          commerceStorage.listOrders(),
        ]);
        if (!active) return;
        if (snapshot) {
          setLines(snapshot.lines);
          setSelectedCoupon(coupons.find(({ id }) => id === snapshot.couponId));
          if (snapshot.storeId) selectStore(snapshot.storeId, snapshot.fulfillmentMode);
        }
        setOrders(storedOrders);
        setStorageStatus("ready");
      } catch {
        if (!active) return;
        setStorageError("Local demo data could not be initialized.");
        setStorageStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [selectStore]);

  useEffect(() => {
    if (storageStatus !== "ready") return;
    void commerceStorage
      .saveSnapshot({
        couponId: selectedCoupon?.id,
        fulfillmentMode,
        lines,
        storeId: selectedStore?.id,
      })
      .catch(() => setStorageError("Recent cart changes could not be saved."));
  }, [fulfillmentMode, lines, selectedCoupon?.id, selectedStore?.id, storageStatus]);

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
      async confirmCheckout(deliveryAddress) {
        if (!selectedStore) return { error: "Choose a store before checkout.", ok: false };
        if (!lines.length) return { error: "Add at least one item before checkout.", ok: false };
        if (fulfillmentMode === "delivery" && !deliveryAddress) {
          return { error: "Choose the demo delivery address.", ok: false };
        }
        const createdAt = new Date().toISOString();
        const id = `BG-${Date.now().toString(36).toUpperCase()}` as OrderId;
        const order: Order = {
          couponId: selectedCoupon?.id,
          createdAt,
          deliveryAddress,
          discountFen: totals.discountFen,
          fulfillmentMode,
          id,
          initialStatus: "confirmed",
          lines: lines.map((line) => ({
            cartLineId: line.id,
            lineTotalFen: line.lineTotalFen,
            optionNames: modifierOptions
              .filter(({ id }) => line.selectedOptionIds.includes(id))
              .map(({ name }) => name),
            productName:
              products.find(({ id: productId }) => productId === line.productId)?.name ??
              "Unknown product",
            quantity: line.quantity,
            unitPriceFen: line.unitPriceFen,
          })),
          storeId: selectedStore.id,
          storeName: selectedStore.name,
          subtotalFen: totals.subtotalFen,
          totalFen: totals.totalFen,
        };
        try {
          await commerceStorage.saveOrder(order);
          setLastConfirmation(order);
          setOrders((current) => [order, ...current.filter((item) => item.id !== order.id)]);
          setLines([]);
          setSelectedCoupon(undefined);
          return { id, ok: true };
        } catch {
          return { error: "The local demo order could not be saved.", ok: false };
        }
      },
      couponEvaluation,
      lastConfirmation,
      lines,
      orders,
      removeLine(id) {
        setLines((current) => current.filter((line) => line.id !== id));
      },
      selectedCoupon,
      storageError,
      storageStatus,
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
      orders,
      selectedCoupon,
      selectedStore,
      storageError,
      storageStatus,
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
