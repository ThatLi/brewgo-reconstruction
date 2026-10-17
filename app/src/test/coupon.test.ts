import { describe, expect, it } from "vitest";

import { coupons, products, stores } from "@/data/fixtures";
import { evaluateCoupon } from "@/domain/coupon";
import { fen } from "@/domain/money";
import type { CartLine, CartLineId, Coupon, CouponId, ModifierOptionId } from "@/domain/types";

const store = stores[0]!;
const line = (productIndex: number, total: number): CartLine => ({
  addedAt: "2030-01-01T00:00:00.000Z",
  id: `line-${productIndex}` as CartLineId,
  lineTotalFen: fen(total),
  productId: products[productIndex]!.id,
  quantity: 1,
  selectedOptionIds: [] as ModifierOptionId[],
  unitPriceFen: fen(total),
});

describe("coupon evaluation", () => {
  it("rejects expired coupons deterministically", () => {
    expect(
      evaluateCoupon(coupons[2]!, [line(0, 4000)], store, "2030-01-01T00:00:00.000Z", products),
    ).toMatchObject({ discountFen: 0, eligible: false, rejection: "expired" });
  });

  it("rejects unmet minimums and ineligible products", () => {
    expect(
      evaluateCoupon(coupons[0]!, [line(0, 2000)], store, "2030-01-01T00:00:00.000Z", products),
    ).toMatchObject({ rejection: "minimum-not-met" });
    expect(
      evaluateCoupon(coupons[1]!, [line(0, 4000)], store, "2030-01-01T00:00:00.000Z", products),
    ).toMatchObject({ rejection: "no-eligible-products" });
  });

  it("caps percentage discounts and clamps fixed discounts", () => {
    expect(
      evaluateCoupon(coupons[1]!, [line(4, 5000)], store, "2030-01-01T00:00:00.000Z", products),
    ).toMatchObject({ discountFen: 800, eligible: true });
    expect(
      evaluateCoupon(coupons[0]!, [line(0, 3000)], store, "2030-01-01T00:00:00.000Z", products),
    ).toMatchObject({ discountFen: 500, eligible: true });

    const oversized: Coupon = {
      ...coupons[0]!,
      code: "CAPTEST",
      discount: { amountFen: fen(5000), type: "fixed" },
      id: "coupon-cap-test" as CouponId,
      minSubtotalFen: fen(0),
    };
    expect(
      evaluateCoupon(oversized, [line(0, 1200)], store, "2030-01-01T00:00:00.000Z", products),
    ).toMatchObject({ discountFen: 1200, eligible: true });
  });
});
