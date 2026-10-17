export type Fen = number & { readonly __brand: "Fen" };
export type StoreId = string & { readonly __brand: "StoreId" };
export type CategoryId = string & { readonly __brand: "CategoryId" };
export type ProductId = string & { readonly __brand: "ProductId" };
export type ModifierGroupId = string & { readonly __brand: "ModifierGroupId" };
export type ModifierOptionId = string & { readonly __brand: "ModifierOptionId" };
export type CouponId = string & { readonly __brand: "CouponId" };
export type CartLineId = string & { readonly __brand: "CartLineId" };
export type FulfillmentMode = "pickup" | "delivery";
export type Availability = "available" | "unavailable";

export interface Store {
  id: StoreId;
  name: string;
  address: string;
  distanceLabel: string;
  openingHours: string;
  supportedModes: readonly FulfillmentMode[];
  availability: Availability;
  unavailableReason?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  sortOrder: number;
}

export interface Product {
  id: ProductId;
  categoryId: CategoryId;
  name: string;
  description: string;
  basePriceFen: Fen;
  availability: Availability;
  unavailableReason?: string;
  maxQuantity: number;
  modifierGroupIds: readonly ModifierGroupId[];
  tags: readonly string[];
}

export interface ModifierGroup {
  id: ModifierGroupId;
  name: string;
  optionIds: readonly ModifierOptionId[];
  minSelections: number;
  maxSelections: number;
}

export interface ModifierOption {
  id: ModifierOptionId;
  groupId: ModifierGroupId;
  name: string;
  priceDeltaFen: Fen;
  availability: Availability;
}

export interface CartLine {
  id: CartLineId;
  productId: ProductId;
  selectedOptionIds: readonly ModifierOptionId[];
  quantity: number;
  unitPriceFen: Fen;
  lineTotalFen: Fen;
  addedAt: string;
}

export interface CartTotals {
  subtotalFen: Fen;
  discountFen: Fen;
  totalFen: Fen;
  itemCount: number;
}

export type CouponDiscount =
  | { type: "fixed"; amountFen: Fen }
  | { type: "percentage"; basisPoints: number; maxDiscountFen: Fen };

export interface Coupon {
  id: CouponId;
  code: string;
  name: string;
  description: string;
  expiresAt: string;
  minSubtotalFen: Fen;
  eligibleProductIds: readonly ProductId[];
  discount: CouponDiscount;
}

export type CouponRejection =
  "expired" | "minimum-not-met" | "no-eligible-products" | "store-unavailable" | "invalid-code";

export interface CouponEvaluation {
  eligible: boolean;
  discountFen: Fen;
  rejection?: CouponRejection;
}

export type RepositoryErrorCode = "not-found" | "unavailable" | "invalid-data" | "storage-failure";

export interface RepositoryError {
  code: RepositoryErrorCode;
  message: string;
  recoverable: boolean;
}

export type Result<Value> = { ok: true; value: Value } | { ok: false; error: RepositoryError };
