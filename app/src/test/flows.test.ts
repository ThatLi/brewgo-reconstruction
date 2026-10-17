import { describe, expect, it } from "vitest";

import { coupons, modifierGroups, modifierOptions, products } from "@/data/fixtures";
import {
  addOrMergeLine,
  calculateCartTotals,
  createCartLine,
  updateLineQuantity,
  validateModifierSelections,
} from "@/domain/cart";
import { evaluateCoupon } from "@/domain/coupon";
import { getFulfillmentStatus, validateCheckoutInput } from "@/domain/order";
import type { ModifierOptionId, Order, OrderId, StoreId } from "@/domain/types";
import { catalogRepository, storeRepository } from "@/repositories/memory";
import { MemoryCommerceStorage } from "@/storage/commerce-storage";

const digest = async (payload: string) => `flow:${payload}`;

describe("ordering flow integration", () => {
  it("runs pickup from store selection through persisted history", async () => {
    const storeResult = await storeRepository.getById("store-harbor" as StoreId);
    expect(storeResult.ok).toBe(true);
    if (!storeResult.ok) return;

    const catalog = await catalogRepository.searchProducts("velvet oat");
    expect(catalog.ok).toBe(true);
    if (!catalog.ok) return;
    const product = catalog.value[0]!;
    const selectedIds = [
      "size-regular",
      "temp-warm",
      "sweet-balanced",
      "milk-oat",
    ] as ModifierOptionId[];
    const groups = modifierGroups.filter(({ id }) => product.modifierGroupIds.includes(id));
    expect(validateModifierSelections(groups, modifierOptions, selectedIds)).toEqual({
      valid: true,
    });

    const selectedOptions = modifierOptions.filter(({ id }) => selectedIds.includes(id));
    const configured = await createCartLine(
      product,
      selectedOptions,
      2,
      "2030-01-01T00:00:00.000Z",
      digest,
    );
    const duplicate = await createCartLine(
      product,
      selectedOptions,
      1,
      "2030-01-01T00:01:00.000Z",
      digest,
    );
    let lines = addOrMergeLine([configured], duplicate, product.maxQuantity);
    lines = updateLineQuantity(lines, configured.id, 2, product.maxQuantity);
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(2);

    const coupon = evaluateCoupon(
      coupons[0]!,
      lines,
      storeResult.value,
      "2030-01-01T00:02:00.000Z",
      products,
    );
    expect(coupon.eligible).toBe(true);
    const totals = calculateCartTotals(lines, coupon.discountFen);
    expect(
      validateCheckoutInput({ lines, mode: "pickup", store: storeResult.value }),
    ).toBeUndefined();

    const order: Order = {
      createdAt: "2030-01-01T00:03:00.000Z",
      discountFen: totals.discountFen,
      fulfillmentMode: "pickup",
      id: "BG-FLOW" as OrderId,
      initialStatus: "confirmed",
      lines: [],
      storeId: storeResult.value.id,
      storeName: storeResult.value.name,
      subtotalFen: totals.subtotalFen,
      totalFen: totals.totalFen,
    };
    const storage = new MemoryCommerceStorage();
    await storage.initialize();
    await storage.saveOrder(order);
    expect((await storage.listOrders())[0]?.id).toBe(order.id);
    expect(getFulfillmentStatus(order, "2030-01-01T00:13:00.000Z")).toBe("ready");
  });

  it("blocks delivery checkout until the synthetic address is selected", async () => {
    const storeResult = await storeRepository.getById("store-harbor" as StoreId);
    if (!storeResult.ok) throw new Error("Synthetic store fixture missing");
    const product = products[2]!;
    const line = await createCartLine(
      product,
      modifierOptions.filter(({ id }) => ["size-regular", "sweet-light"].includes(id)),
      1,
      "2030-01-01T00:00:00.000Z",
      digest,
    );
    expect(
      validateCheckoutInput({ lines: [line], mode: "delivery", store: storeResult.value }),
    ).toBe("Choose the demo delivery address.");
    expect(
      validateCheckoutInput({
        deliveryAddress: "9 Demo Lane, Level 2",
        lines: [line],
        mode: "delivery",
        store: storeResult.value,
      }),
    ).toBeUndefined();
  });
});
