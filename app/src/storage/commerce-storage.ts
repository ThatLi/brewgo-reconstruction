import type { SQLiteDatabase } from "expo-sqlite";

import type { CartLine, CouponId, FulfillmentMode, Order, OrderId, StoreId } from "@/domain/types";

export interface CommerceSnapshot {
  couponId?: CouponId;
  fulfillmentMode: FulfillmentMode;
  lines: readonly CartLine[];
  storeId?: StoreId;
}

export interface CommerceStorage {
  getOrder(id: OrderId): Promise<Order | undefined>;
  initialize(): Promise<void>;
  listOrders(): Promise<readonly Order[]>;
  loadSnapshot(): Promise<CommerceSnapshot | undefined>;
  saveOrder(order: Order): Promise<void>;
  saveSnapshot(snapshot: CommerceSnapshot): Promise<void>;
}

const initialSnapshot: CommerceSnapshot = { fulfillmentMode: "pickup", lines: [] };

export class ExpoSqliteCommerceStorage implements CommerceStorage {
  private database?: SQLiteDatabase;

  private async db(): Promise<SQLiteDatabase> {
    if (!this.database) {
      const { openDatabaseAsync } = await import("expo-sqlite");
      this.database = await openDatabaseAsync("brewgo.db");
    }
    return this.database;
  }

  async initialize() {
    const db = await this.db();
    await db.execAsync(`
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
      PRAGMA user_version = 1;
    `);
  }

  async loadSnapshot() {
    const db = await this.db();
    const row = await db.getFirstAsync<{ payload: string }>(
      "SELECT payload FROM commerce_state WHERE id = 1",
    );
    return row ? (JSON.parse(row.payload) as CommerceSnapshot) : undefined;
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
    return rows.map(({ payload }) => JSON.parse(payload) as Order);
  }

  async getOrder(id: OrderId) {
    const db = await this.db();
    const row = await db.getFirstAsync<{ payload: string }>(
      "SELECT payload FROM orders WHERE id = ?",
      id,
    );
    return row ? (JSON.parse(row.payload) as Order) : undefined;
  }
}

export class MemoryCommerceStorage implements CommerceStorage {
  private snapshot: CommerceSnapshot | undefined;
  private readonly orders = new Map<OrderId, Order>();

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
