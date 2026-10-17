import { describe, expect, it } from "vitest";

import { products } from "@/data/fixtures";
import { filterProducts } from "@/domain/catalog";
import type { CategoryId } from "@/domain/types";

describe("catalog filtering", () => {
  it("filters by category and preserves source order", () => {
    const result = filterProducts(products, {
      categoryId: "tea" as CategoryId,
      query: "",
    });
    expect(result.map(({ name }) => name)).toEqual(["Jasmine Sparkler", "Matcha Cloud"]);
  });

  it("searches names, descriptions, and tags without case sensitivity", () => {
    expect(filterProducts(products, { query: "OAT" }).map(({ name }) => name)).toContain(
      "Velvet Oat Latte",
    );
    expect(filterProducts(products, { query: "orange peel" }).map(({ name }) => name)).toEqual([
      "Citrus Cold Brew",
    ]);
  });

  it("returns the whole catalog for a blank filter", () => {
    expect(filterProducts(products, { query: "   " })).toHaveLength(products.length);
  });
});
