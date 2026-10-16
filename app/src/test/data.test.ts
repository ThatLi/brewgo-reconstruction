import { describe, expect, it } from "vitest";

import { coupons, modifierGroups, modifierOptions, products, stores } from "@/data/fixtures";
import { fen, formatCny } from "@/domain/money";
import type { ProductId, StoreId } from "@/domain/types";
import { catalogRepository, couponRepository, storeRepository } from "@/repositories/memory";

describe("synthetic fixtures", () => {
  it("uses unique identifiers and valid modifier references", () => {
    const allIds = [...stores, ...products, ...modifierGroups, ...modifierOptions, ...coupons].map(
      ({ id }) => id,
    );

    expect(new Set(allIds).size).toBe(allIds.length);

    const optionIds = new Set(modifierOptions.map(({ id }) => id));
    for (const group of modifierGroups) {
      expect(group.optionIds.every((id) => optionIds.has(id))).toBe(true);
    }
  });

  it("stores prices as nonnegative integer fen", () => {
    expect(formatCny(fen(2800))).toBe("¥28.00");
    expect(() => fen(-1)).toThrow(RangeError);
    expect(() => fen(10.5)).toThrow(RangeError);
  });
});

describe("in-memory repositories", () => {
  it("finds stores and returns typed missing results", async () => {
    expect((await storeRepository.list()).ok).toBe(true);
    expect((await storeRepository.getById("store-harbor" as StoreId)).ok).toBe(true);

    const result = await storeRepository.getById("missing" as StoreId);
    expect(result).toMatchObject({ ok: false, error: { code: "not-found" } });
  });

  it("filters and searches the catalog deterministically", async () => {
    const search = await catalogRepository.searchProducts("OAT");
    expect(search.ok && search.value.map(({ name }) => name)).toContain("Velvet Oat Latte");

    const product = await catalogRepository.getProduct("drink-matcha-cloud" as ProductId);
    expect(product.ok && product.value.basePriceFen).toBe(2700);
  });

  it("normalizes coupon codes and filters expired coupons", async () => {
    expect((await couponRepository.findByCode(" brew5 ")).ok).toBe(true);

    const available = await couponRepository.listAvailable("2030-01-01T00:00:00.000Z");
    expect(available.ok && available.value).toHaveLength(2);
  });
});
