import type { CategoryId, Product } from "./types";

interface ProductFilter {
  categoryId?: CategoryId;
  query: string;
}

export function filterProducts(
  products: readonly Product[],
  { categoryId, query }: ProductFilter,
): readonly Product[] {
  const needle = query.trim().toLocaleLowerCase();

  return products.filter((product) => {
    const categoryMatches = !categoryId || product.categoryId === categoryId;
    const queryMatches =
      !needle ||
      `${product.name} ${product.description} ${product.tags.join(" ")}`
        .toLocaleLowerCase()
        .includes(needle);
    return categoryMatches && queryMatches;
  });
}
