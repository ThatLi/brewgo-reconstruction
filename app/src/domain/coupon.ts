import { fen } from "./money";
import type { CartLine, Coupon, CouponEvaluation, Product, Store } from "./types";

export function evaluateCoupon(
  coupon: Coupon,
  lines: readonly CartLine[],
  store: Store,
  at: string,
  products: readonly Product[],
): CouponEvaluation {
  if (Date.parse(coupon.expiresAt) <= Date.parse(at)) {
    return { discountFen: fen(0), eligible: false, rejection: "expired" };
  }
  if (store.availability === "unavailable") {
    return { discountFen: fen(0), eligible: false, rejection: "store-unavailable" };
  }

  const subtotal = lines.reduce((total, line) => total + line.lineTotalFen, 0);
  if (subtotal < coupon.minSubtotalFen) {
    return { discountFen: fen(0), eligible: false, rejection: "minimum-not-met" };
  }

  const eligibleIds = new Set(coupon.eligibleProductIds);
  const eligibleLines = coupon.eligibleProductIds.length
    ? lines.filter(({ productId }) => eligibleIds.has(productId))
    : lines;
  const eligibleSubtotal = eligibleLines.reduce((total, line) => {
    const product = products.find(({ id }) => id === line.productId);
    return product?.availability === "available" ? total + line.lineTotalFen : total;
  }, 0);
  if (!eligibleSubtotal) {
    return { discountFen: fen(0), eligible: false, rejection: "no-eligible-products" };
  }

  const configured =
    coupon.discount.type === "fixed"
      ? coupon.discount.amountFen
      : Math.floor((eligibleSubtotal * coupon.discount.basisPoints) / 10_000);
  const cap = coupon.discount.type === "percentage" ? coupon.discount.maxDiscountFen : configured;
  return {
    discountFen: fen(Math.min(configured, cap, eligibleSubtotal, subtotal)),
    eligible: true,
  };
}

export const couponRejectionCopy = {
  expired: "This coupon has expired.",
  "invalid-code": "That coupon code is not part of this demo.",
  "minimum-not-met": "The cart has not reached this coupon’s minimum.",
  "no-eligible-products": "No items in the cart qualify for this coupon.",
  "store-unavailable": "Coupons cannot be used while the store is unavailable.",
} as const;
