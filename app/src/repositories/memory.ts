import {
  categories,
  coupons,
  modifierGroups,
  modifierOptions,
  products,
  stores,
} from "@/data/fixtures";
import { evaluateCoupon } from "@/domain/coupon";
import type {
  CategoryId,
  ModifierGroupId,
  ModifierOptionId,
  ProductId,
  Result,
  StoreId,
} from "@/domain/types";
import type { CatalogRepository, CouponRepository, StoreRepository } from "./interfaces";

const found = <Value>(value: Value): Result<Value> => ({ ok: true, value });
const missing = <Value>(message: string): Result<Value> => ({
  ok: false,
  error: { code: "not-found", message, recoverable: true },
});

export const storeRepository: StoreRepository = {
  async list() {
    return found(stores);
  },
  async getById(id: StoreId) {
    const store = stores.find((item) => item.id === id);
    return store ? found(store) : missing("Store not found.");
  },
};

export const catalogRepository: CatalogRepository = {
  async listCategories() {
    return found([...categories].sort((a, b) => a.sortOrder - b.sortOrder));
  },
  async listProducts(categoryId?: CategoryId) {
    return found(categoryId ? products.filter((item) => item.categoryId === categoryId) : products);
  },
  async searchProducts(query: string) {
    const needle = query.trim().toLocaleLowerCase();
    return found(
      needle
        ? products.filter((item) =>
            `${item.name} ${item.tags.join(" ")}`.toLocaleLowerCase().includes(needle),
          )
        : products,
    );
  },
  async getProduct(id: ProductId) {
    const item = products.find((product) => product.id === id);
    return item ? found(item) : missing("Product not found.");
  },
  async getModifierGroups(ids: readonly ModifierGroupId[]) {
    return found(modifierGroups.filter((group) => ids.includes(group.id)));
  },
  async getModifierOptions(ids: readonly ModifierOptionId[]) {
    return found(modifierOptions.filter((option) => ids.includes(option.id)));
  },
};

export const couponRepository: CouponRepository = {
  async evaluate(coupon, lines, store, at) {
    return evaluateCoupon(coupon, lines, store, at, products);
  },
  async listAvailable(at: string) {
    const instant = Date.parse(at);
    return found(coupons.filter((coupon) => Date.parse(coupon.expiresAt) > instant));
  },
  async findByCode(code: string) {
    const coupon = coupons.find((item) => item.code === code.trim().toUpperCase());
    return coupon ? found(coupon) : missing("Coupon not found.");
  },
};
