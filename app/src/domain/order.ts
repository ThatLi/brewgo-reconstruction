import type { CartLine, FulfillmentMode, FulfillmentStatus, Order, Store } from "./types";

export function validateCheckoutInput({
  deliveryAddress,
  lines,
  mode,
  store,
}: {
  deliveryAddress?: string;
  lines: readonly CartLine[];
  mode: FulfillmentMode;
  store?: Store;
}): string | undefined {
  if (!store) return "Choose a store before checkout.";
  if (!lines.length) return "Add at least one item before checkout.";
  if (mode === "delivery" && !deliveryAddress) return "Choose the demo delivery address.";
  return undefined;
}

export function getFulfillmentStatus(order: Order, at: string): FulfillmentStatus {
  const elapsedMinutes = Math.max(0, (Date.parse(at) - Date.parse(order.createdAt)) / 60_000);
  if (elapsedMinutes < 2) return "confirmed";
  if (elapsedMinutes < 8) return "preparing";
  if (order.fulfillmentMode === "pickup") {
    if (elapsedMinutes < 18) return "ready";
    return "completed";
  }
  if (elapsedMinutes < 25) return "dispatched";
  return "completed";
}
