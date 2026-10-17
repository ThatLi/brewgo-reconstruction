import type { SQLiteDatabase } from "expo-sqlite";

import type { CartLine, CouponId, FulfillmentMode, Order, OrderId, StoreId } from "@/domain/types";

export interface CommerceSnapshot {
  couponId?: CouponId;
  fulfillmentMode: FulfillmentMode;
  lines: readonly CartLine[];
  storeId?: StoreId;
}

export interface CommerceStorage {
  consumeRecoveryNotice(): string | undefined;
  getOrder(id: OrderId): Promise<Order | undefined>;
  initialize(): Promise<void>;
  listOrders(): Promise<readonly Order[]>;
  loadSnapshot(): Promise<CommerceSnapshot | undefined>;
  saveOrder(order: Order): Promise<void>;
  saveSnapshot(snapshot: CommerceSnapshot): Promise<void>;
}

const initialSnapshot: CommerceSnapshot = { fulfillmentMode: "pickup", lines: [] };

export const SQLITE_SCHEMA = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS commerce_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    payload TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY NOT NULL,
    created_at TEXT NOT NULL,
    payload TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS corrupt_data (
    source TEXT NOT NULL,
    source_id TEXT NOT NULL,
    payload TEXT NOT NULL,
    quarantined_at TEXT NOT NULL
  );
  PRAGMA user_version = 1;
`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCartLine(value: unknown): value is CartLine {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.productId === "string" &&
    Array.isArray(value.selectedOptionIds) &&
    value.selectedOptionIds.every((id) => typeof id === "string") &&
    Number.isSafeInteger(value.quantity) &&
    Number(value.quantity) > 0 &&
    Number.isSafeInteger(value.unitPriceFen) &&
    Number(value.unitPriceFen) >= 0 &&
    Number.isSafeInteger(value.lineTotalFen) &&
    Number(value.lineTotalFen) >= 0 &&
    typeof value.addedAt === "string"
  );
}

function isOrderLine(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.cartLineId === "string" &&
    typeof value.productName === "string" &&
    Array.isArray(value.optionNames) &&
    value.optionNames.every((name) => typeof name === "string") &&
    Number.isSafeInteger(value.quantity) &&
    Number(value.quantity) > 0 &&
    Number.isSafeInteger(value.unitPriceFen) &&
    Number(value.unitPriceFen) >= 0 &&
    Number.isSafeInteger(value.lineTotalFen) &&
    Number(value.lineTotalFen) >= 0
  );
}

export function decodeCommerceSnapshot(payload: string): CommerceSnapshot | undefined {
  try {
    const value: unknown = JSON.parse(payload);
    if (
      !isRecord(value) ||
      (value.fulfillmentMode !== "pickup" && value.fulfillmentMode !== "delivery") ||
      !Array.isArray(value.lines) ||
      !value.lines.every(isOrderLine) ||
      !value.lines.every(isCartLine) ||
      (value.storeId !== undefined && typeof value.storeId !== "string") ||
      (value.couponId !== undefined && typeof value.couponId !== "string")
    ) {
      return undefined;
    }
    return value as unknown as CommerceSnapshot;
  } catch {
    return undefined;
  }
}

export function decodeOrder(payload: string): Order | undefined {
  try {
    const value: unknown = JSON.parse(payload);
    if (
      !isRecord(value) ||
      typeof value.id !== "string" ||
      typeof value.storeId !== "string" ||
      typeof value.storeName !== "string" ||
      (value.fulfillmentMode !== "pickup" && value.fulfillmentMode !== "delivery") ||
      !Array.isArray(value.lines) ||
      typeof value.createdAt !== "string" ||
      value.initialStatus !== "confirmed" ||
      !Number.isSafeInteger(value.subtotalFen) ||
      !Number.isSafeInteger(value.discountFen) ||
      !Number.isSafeInteger(value.totalFen)
    ) {
      return undefined;
    }
    return value as unknown as Order;
  } catch {
    return undefined;
  }
}

export class ExpoSqliteCommerceStorage implements CommerceStorage {
  private database?: SQLiteDatabase;
  private recoveryNotice?: string;

  consumeRecoveryNotice() {
    const notice = this.recoveryNotice;
    this.recoveryNotice = undefined;
    return notice;
  }

  private async db(): Promise<SQLiteDatabase> {
    if (!this.database) {
      const { openDatabaseAsync } = await import("expo-sqlite");
      this.database = await openDatabaseAsync("brewgo.db");
    }
    return this.database;
  }

  async initialize() {
    const db = await this.db();
    await db.execAsync(SQLITE_SCHEMA);
  }

  async loadSnapshot() {
    const db = await this.db();
    const row = await db.getFirstAsync<{ payload: string }>(
      "SELECT payload FROM commerce_state WHERE id = 1",
    );
    if (!row) return undefined;
    const snapshot = decodeCommerceSnapshot(row.payload);
    if (snapshot) return snapshot;
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        "INSERT INTO corrupt_data (source, source_id, payload, quarantined_at) VALUES (?, ?, ?, ?)",
        "commerce_state",
        "1",
        row.payload,
        new Date().toISOString(),
      );
      await db.runAsync("DELETE FROM commerce_state WHERE id = 1");
    });
    this.recoveryNotice = "Corrupt cart data was reset; the demo is ready to use.";
    return undefined;
  }

  async saveSnapshot(snapshot: CommerceSnapshot) {
    const db = await this.db();
    await db.runAsync(
      "INSERT INTO commerce_state (id, payload) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload",
      JSON.stringify(snapshot),
    );
  }

  async saveOrder(order: Order) {
    const db = await this.db();
    await db.runAsync(
      "INSERT OR REPLACE INTO orders (id, created_at, payload) VALUES (?, ?, ?)",
      order.id,
      order.createdAt,
      JSON.stringify(order),
    );
  }

  async listOrders() {
    const db = await this.db();
    const rows = await db.getAllAsync<{ payload: string }>(
      "SELECT payload FROM orders ORDER BY created_at DESC",
    );
    const orders: Order[] = [];
    for (const row of rows) {
      const order = decodeOrder(row.payload);
      if (order) {
        orders.push(order);
        continue;
      }
      await db.withTransactionAsync(async () => {
        await db.runAsync(
          "INSERT INTO corrupt_data (source, source_id, payload, quarantined_at) VALUES (?, ?, ?, ?)",
          "orders",
          "unknown",
          row.payload,
          new Date().toISOString(),
        );
        await db.runAsync("DELETE FROM orders WHERE payload = ?", row.payload);
      });
      this.recoveryNotice = "One corrupt order was removed; valid demo orders remain available.";
    }
    return orders;
  }

  async getOrder(id: OrderId) {
    const db = await this.db();
    const row = await db.getFirstAsync<{ payload: string }>(
      "SELECT payload FROM orders WHERE id = ?",
      id,
    );
    return row ? decodeOrder(row.payload) : undefined;
  }
}

export class MemoryCommerceStorage implements CommerceStorage {
  private snapshot: CommerceSnapshot | undefined;
  private readonly orders = new Map<OrderId, Order>();
  private recoveryNotice?: string;

  consumeRecoveryNotice() {
    const notice = this.recoveryNotice;
    this.recoveryNotice = undefined;
    return notice;
  }

  async initialize() {}

  async loadSnapshot() {
    return this.snapshot ? structuredClone(this.snapshot) : undefined;
  }

  async saveSnapshot(snapshot: CommerceSnapshot) {
    this.snapshot = structuredClone(snapshot);
  }

  async saveOrder(order: Order) {
    this.orders.set(order.id, structuredClone(order));
  }

  async listOrders() {
    return [...this.orders.values()]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((order) => structuredClone(order));
  }

  async getOrder(id: OrderId) {
    const order = this.orders.get(id);
    return order ? structuredClone(order) : undefined;
  }

  seedEmpty() {
    this.snapshot = structuredClone(initialSnapshot);
  }
}

export const commerceStorage = new ExpoSqliteCommerceStorage();
