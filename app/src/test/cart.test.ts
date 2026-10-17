import { describe, expect, it } from "vitest";

import { modifierGroups, modifierOptions, products } from "@/data/fixtures";
import {
  addOrMergeLine,
  calculateCartTotals,
  canonicalLinePayload,
  createCartLine,
  updateLineQuantity,
  validateModifierSelections,
} from "@/domain/cart";
import type { ModifierOptionId } from "@/domain/types";

const product = products[0]!;
const selectedIds = [
  "size-regular",
  "temp-warm",
  "sweet-balanced",
  "milk-oat",
] as ModifierOptionId[];
const selectedOptions = modifierOptions.filter(({ id }) => selectedIds.includes(id));
const groups = modifierGroups.filter(({ id }) => product.modifierGroupIds.includes(id));
const testDigest = async (payload: string) => `test:${payload}`;

describe("modifier validation", () => {
  it("accepts one valid choice for every required group", () => {
    expect(validateModifierSelections(groups, modifierOptions, selectedIds)).toEqual({
      valid: true,
    });
  });

  it("reports the first missing required group", () => {
    expect(validateModifierSelections(groups, modifierOptions, [])).toMatchObject({
      groupId: "size",
      valid: false,
    });
  });

  it("rejects selections above a group maximum", () => {
    const overSelected = [...selectedIds, "shot-one", "shot-two"] as ModifierOptionId[];
    expect(validateModifierSelections(groups, modifierOptions, overSelected)).toMatchObject({
      groupId: "shots",
      valid: false,
    });
  });
});

describe("cart lines", () => {
  it("canonicalizes option order for stable identity", () => {
    expect(canonicalLinePayload(product.id, selectedIds)).toBe(
      canonicalLinePayload(product.id, [...selectedIds].reverse()),
    );
  });

  it("creates and merges identical customized lines", async () => {
    const first = await createCartLine(
      product,
      selectedOptions,
      2,
      "2030-01-01T00:00:00.000Z",
      testDigest,
    );
    const second = await createCartLine(
      product,
      selectedOptions,
      1,
      "2030-01-02T00:00:00.000Z",
      testDigest,
    );
    expect(first.id).toBe(second.id);

    const lines = addOrMergeLine([first], second, product.maxQuantity);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ quantity: 3, lineTotalFen: 9300 });
    expect(calculateCartTotals(lines)).toMatchObject({ itemCount: 3, subtotalFen: 9300 });
  });

  it("updates, removes, and caps quantities", async () => {
    const line = await createCartLine(
      product,
      selectedOptions,
      1,
      "2030-01-01T00:00:00.000Z",
      testDigest,
    );
    expect(updateLineQuantity([line], line.id, 2, product.maxQuantity)[0]?.quantity).toBe(2);
    expect(updateLineQuantity([line], line.id, 0, product.maxQuantity)).toEqual([]);
    expect(() => updateLineQuantity([line], line.id, 9, product.maxQuantity)).toThrow(RangeError);
  });

  it("gives different customizations different line identities", async () => {
    const oat = await createCartLine(
      product,
      selectedOptions,
      1,
      "2030-01-01T00:00:00.000Z",
      testDigest,
    );
    const wholeMilkOptions = modifierOptions.filter(({ id }) =>
      selectedIds.map((value) => (value === "milk-oat" ? "milk-whole" : value)).includes(id),
    );
    const whole = await createCartLine(
      product,
      wholeMilkOptions,
      1,
      "2030-01-01T00:00:00.000Z",
      testDigest,
    );
    expect(oat.id).not.toBe(whole.id);
    expect(addOrMergeLine([oat], whole, product.maxQuantity)).toHaveLength(2);
  });

  it("rejects a merge beyond the product quantity cap", async () => {
    const first = await createCartLine(
      product,
      selectedOptions,
      8,
      "2030-01-01T00:00:00.000Z",
      testDigest,
    );
    const extra = await createCartLine(
      product,
      selectedOptions,
      1,
      "2030-01-01T00:00:00.000Z",
      testDigest,
    );
    expect(() => addOrMergeLine([first], extra, product.maxQuantity)).toThrow(RangeError);
  });
});
