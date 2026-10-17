import { describe, expect, it } from "vitest";

import { fen } from "@/domain/money";
import { getFulfillmentStatus } from "@/domain/order";
import type { Order, OrderId, StoreId } from "@/domain/types";
import {
  decodeCommerceSnapshot,
  decodeOrder,
  MemoryCommerceStorage,
} from "@/storage/commerce-storage";

const order = (id: string, createdAt: string, mode: "pickup" | "delivery" = "pickup"): Order => ({
  createdAt,
  discountFen: fen(0),
  fulfillmentMode: mode,
  id: id as OrderId,
  initialStatus: "confirmed",
  lines: [],
  storeId: "store-harbor" as StoreId,
  storeName: "Harbor Point",
  subtotalFen: fen(2800),
  totalFen: fen(2800),
});

describe("commerce persistence", () => {
  it("rejects malformed persisted payloads", () => {
    expect(decodeCommerceSnapshot("not-json")).toBeUndefined();
    expect(decodeCommerceSnapshot('{"fulfillmentMode":"pickup","lines":[{}]}')).toBeUndefined();
    expect(decodeOrder('{"id":"bad","lines":[{}]}')).toBeUndefined();
  });

  it("round-trips a commerce snapshot without sharing mutable data", async () => {
    const storage = new MemoryCommerceStorage();
    await storage.initialize();
    await storage.saveSnapshot({
      fulfillmentMode: "delivery",
      lines: [],
      storeId: "store-harbor" as StoreId,
    });
    expect(await storage.loadSnapshot()).toEqual({
      fulfillmentMode: "delivery",
      lines: [],
      storeId: "store-harbor",
    });
  });

  it("stores immutable orders newest first", async () => {
    const storage = new MemoryCommerceStorage();
    const older = order("BG-OLD", "2030-01-01T00:00:00.000Z");
    const newer = order("BG-NEW", "2030-01-02T00:00:00.000Z");
    await storage.saveOrder(older);
    await storage.saveOrder(newer);
    expect((await storage.listOrders()).map(({ id }) => id)).toEqual(["BG-NEW", "BG-OLD"]);
    expect(await storage.getOrder(older.id)).toEqual(older);
  });
});

describe("deterministic fulfillment status", () => {
  it("progresses pickup orders through ready", () => {
    const pickup = order("BG-PICKUP", "2030-01-01T00:00:00.000Z");
    expect(getFulfillmentStatus(pickup, "2030-01-01T00:01:00.000Z")).toBe("confirmed");
    expect(getFulfillmentStatus(pickup, "2030-01-01T00:05:00.000Z")).toBe("preparing");
    expect(getFulfillmentStatus(pickup, "2030-01-01T00:10:00.000Z")).toBe("ready");
    expect(getFulfillmentStatus(pickup, "2030-01-01T00:20:00.000Z")).toBe("completed");
  });

  it("progresses delivery orders through dispatched", () => {
    const delivery = order("BG-DELIVERY", "2030-01-01T00:00:00.000Z", "delivery");
    expect(getFulfillmentStatus(delivery, "2030-01-01T00:10:00.000Z")).toBe("dispatched");
    expect(getFulfillmentStatus(delivery, "2030-01-01T00:30:00.000Z")).toBe("completed");
  });
});
