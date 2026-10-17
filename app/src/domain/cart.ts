import { addFen, fen } from "./money";
import type {
  CartLine,
  CartLineId,
  CartTotals,
  ModifierGroup,
  ModifierOption,
  ModifierOptionId,
  Product,
} from "./types";

export interface ModifierValidation {
  groupId?: string;
  message?: string;
  valid: boolean;
}

export type LineDigest = (payload: string) => Promise<string>;

async function expoSha256(payload: string): Promise<string> {
  const { CryptoDigestAlgorithm, digestStringAsync } = await import("expo-crypto");
  return digestStringAsync(CryptoDigestAlgorithm.SHA256, payload);
}

export function validateModifierSelections(
  groups: readonly ModifierGroup[],
  options: readonly ModifierOption[],
  selectedOptionIds: readonly ModifierOptionId[],
): ModifierValidation {
  const unique = new Set(selectedOptionIds);
  if (unique.size !== selectedOptionIds.length) {
    return { message: "Choose each option only once.", valid: false };
  }

  for (const group of groups) {
    const selected = selectedOptionIds.filter((id) => group.optionIds.includes(id));
    if (selected.length < group.minSelections || selected.length > group.maxSelections) {
      return {
        groupId: group.id,
        message: `${group.name} requires ${group.minSelections}–${group.maxSelections} choices.`,
        valid: false,
      };
    }
  }

  const allowed = new Set(groups.flatMap(({ optionIds }) => optionIds));
  const selectedOptions = options.filter(({ id }) => unique.has(id));
  if (
    selectedOptions.length !== unique.size ||
    selectedOptions.some(
      ({ id, availability }) => !allowed.has(id) || availability === "unavailable",
    )
  ) {
    return { message: "One selected option is unavailable.", valid: false };
  }

  return { valid: true };
}

export function canonicalLinePayload(
  productId: Product["id"],
  selectedOptionIds: readonly ModifierOptionId[],
): string {
  return JSON.stringify({
    productId,
    selectedOptionIds: [...new Set(selectedOptionIds)].sort(),
  });
}

export async function createCartLine(
  product: Product,
  selectedOptions: readonly ModifierOption[],
  quantity: number,
  addedAt: string,
  digest: LineDigest = expoSha256,
): Promise<CartLine> {
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > product.maxQuantity) {
    throw new RangeError(`Quantity must be between 1 and ${product.maxQuantity}.`);
  }
  const selectedOptionIds = selectedOptions.map(({ id }) => id).sort();
  const lineDigest = await digest(canonicalLinePayload(product.id, selectedOptionIds));
  const unitPriceFen = addFen(
    product.basePriceFen,
    ...selectedOptions.map(({ priceDeltaFen }) => priceDeltaFen),
  );
  return {
    addedAt,
    id: lineDigest as CartLineId,
    lineTotalFen: fen(unitPriceFen * quantity),
    productId: product.id,
    quantity,
    selectedOptionIds,
    unitPriceFen,
  };
}

export function addOrMergeLine(
  lines: readonly CartLine[],
  incoming: CartLine,
  maximum: number,
): readonly CartLine[] {
  const existing = lines.find(({ id }) => id === incoming.id);
  if (!existing) return [...lines, incoming];
  const quantity = existing.quantity + incoming.quantity;
  if (quantity > maximum) {
    throw new RangeError(`Quantity cannot exceed ${maximum}.`);
  }
  return lines.map((line) =>
    line.id === incoming.id
      ? { ...line, lineTotalFen: fen(line.unitPriceFen * quantity), quantity }
      : line,
  );
}

export function updateLineQuantity(
  lines: readonly CartLine[],
  id: CartLineId,
  quantity: number,
  maximum: number,
): readonly CartLine[] {
  if (quantity <= 0) return lines.filter((line) => line.id !== id);
  if (!Number.isSafeInteger(quantity) || quantity > maximum) {
    throw new RangeError(`Quantity must be between 1 and ${maximum}.`);
  }
  return lines.map((line) =>
    line.id === id ? { ...line, lineTotalFen: fen(line.unitPriceFen * quantity), quantity } : line,
  );
}

export function calculateCartTotals(lines: readonly CartLine[]): CartTotals {
  const subtotalFen = addFen(...lines.map(({ lineTotalFen }) => lineTotalFen));
  return {
    discountFen: fen(0),
    itemCount: lines.reduce((total, { quantity }) => total + quantity, 0),
    subtotalFen,
    totalFen: subtotalFen,
  };
}
