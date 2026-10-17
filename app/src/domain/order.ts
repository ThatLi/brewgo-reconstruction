import type { FulfillmentStatus, Order } from "./types";

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
