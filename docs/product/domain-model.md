# BrewGo commerce domain

This document is the implementation contract for BrewGo. Names, fixtures, rules, and interfaces are original clean-room decisions.

## Shared primitives

```ts
type Brand<Value, Name extends string> = Value & { readonly __brand: Name };

type Fen = Brand<number, "Fen">;
type StoreId = Brand<string, "StoreId">;
type CategoryId = Brand<string, "CategoryId">;
type ProductId = Brand<string, "ProductId">;
type ModifierGroupId = Brand<string, "ModifierGroupId">;
type ModifierOptionId = Brand<string, "ModifierOptionId">;
type CartLineId = Brand<string, "CartLineId">;
type CouponId = Brand<string, "CouponId">;
type OrderId = Brand<string, "OrderId">;

type IsoDateTime = string;
type FulfillmentMode = "pickup" | "delivery";
type Availability = "available" | "unavailable";
```

`Fen` values must be finite, safe, nonnegative integers. Floating-point CNY values never enter domain calculations. Formatting to `¥12.34` happens at the UI boundary.

## Entities

### Store

```ts
interface Store {
  id: StoreId;
  name: string;
  address: string;
  distanceLabel: string;
  openingHours: string;
  supportedModes: readonly FulfillmentMode[];
  availability: Availability;
  unavailableReason?: string;
}
```

Store coordinates are unnecessary for v0.1.0. Distance labels are synthetic fixture text.

### Category

```ts
interface Category {
  id: CategoryId;
  name: string;
  sortOrder: number;
}
```

### Product

```ts
interface Product {
  id: ProductId;
  categoryId: CategoryId;
  name: string;
  description: string;
  basePriceFen: Fen;
  availability: Availability;
  unavailableReason?: string;
  maxQuantity: number;
  modifierGroupIds: readonly ModifierGroupId[];
  tags: readonly string[];
}
```

`maxQuantity` is an independent fixture rule and must be a positive integer.

### ModifierGroup

```ts
interface ModifierGroup {
  id: ModifierGroupId;
  name: string;
  optionIds: readonly ModifierOptionId[];
  minSelections: number;
  maxSelections: number;
}
```

Invariants:

- `0 <= minSelections <= maxSelections`;
- `maxSelections <= optionIds.length`;
- required means `minSelections > 0`;
- single-select means `maxSelections === 1`;
- selected option IDs must belong to the group and be available.

### ModifierOption

```ts
interface ModifierOption {
  id: ModifierOptionId;
  groupId: ModifierGroupId;
  name: string;
  priceDeltaFen: Fen;
  availability: Availability;
}
```

### CartLine

```ts
interface CartLine {
  id: CartLineId;
  productId: ProductId;
  selectedOptionIds: readonly ModifierOptionId[];
  quantity: number;
  unitPriceFen: Fen;
  lineTotalFen: Fen;
  addedAt: IsoDateTime;
}
```

Line identity is the SHA-256 digest of canonical JSON containing `productId` and sorted unique `selectedOptionIds`. Quantity and timestamps do not participate. Adding an identical configuration increments quantity; a different configuration creates a distinct line.

`unitPriceFen = product.basePriceFen + sum(selected option priceDeltaFen)` and `lineTotalFen = unitPriceFen * quantity`.

### Coupon

```ts
type CouponDiscount =
  | { type: "fixed"; amountFen: Fen }
  | { type: "percentage"; basisPoints: number; maxDiscountFen: Fen };

interface Coupon {
  id: CouponId;
  code: string;
  name: string;
  description: string;
  expiresAt: IsoDateTime;
  minSubtotalFen: Fen;
  eligibleProductIds: readonly ProductId[];
  discount: CouponDiscount;
}

type CouponRejection =
  | "expired"
  | "minimum-not-met"
  | "no-eligible-products"
  | "store-unavailable"
  | "invalid-code";
```

Only one coupon can be selected in v0.1.0. Percentage `basisPoints` must be an integer from 1 to 10,000. Discount rounds down to fen and never exceeds eligible subtotal, configured cap, or full subtotal.

### Order

```ts
type FulfillmentStatus =
  | "confirmed"
  | "preparing"
  | "ready"
  | "dispatched"
  | "completed";

interface OrderLineSnapshot {
  cartLineId: CartLineId;
  productName: string;
  optionNames: readonly string[];
  quantity: number;
  unitPriceFen: Fen;
  lineTotalFen: Fen;
}

interface Order {
  id: OrderId;
  storeId: StoreId;
  storeName: string;
  fulfillmentMode: FulfillmentMode;
  deliveryAddress?: string;
  lines: readonly OrderLineSnapshot[];
  couponId?: CouponId;
  subtotalFen: Fen;
  discountFen: Fen;
  totalFen: Fen;
  createdAt: IsoDateTime;
  initialStatus: "confirmed";
}
```

Orders are immutable snapshots. Current `FulfillmentStatus` is derived from `createdAt`, mode, and the deterministic mock clock; it is not persisted as mutable remote state.

## Aggregate calculations

```ts
interface CartTotals {
  subtotalFen: Fen;
  discountFen: Fen;
  totalFen: Fen;
  itemCount: number;
}

interface CouponEvaluation {
  eligible: boolean;
  discountFen: Fen;
  rejection?: CouponRejection;
}
```

Rules:

1. Exclude unavailable lines from checkout; never silently delete them.
2. Sum integer line totals for subtotal.
3. Evaluate the selected coupon once against current lines, store, and clock.
4. Clamp discount to `[0, subtotalFen]`.
5. `totalFen = subtotalFen - discountFen`.

## Repository results and errors

```ts
type RepositoryErrorCode =
  | "not-found"
  | "unavailable"
  | "invalid-data"
  | "storage-failure";

interface RepositoryError {
  code: RepositoryErrorCode;
  message: string;
  recoverable: boolean;
}

type Result<Value> =
  | { ok: true; value: Value }
  | { ok: false; error: RepositoryError };
```

Repositories return typed results for expected failures and throw only for programmer errors.

## Repository interfaces

```ts
interface StoreRepository {
  list(): Promise<Result<readonly Store[]>>;
  getById(id: StoreId): Promise<Result<Store>>;
  getSelected(): Promise<Result<Store | null>>;
  select(id: StoreId, mode: FulfillmentMode): Promise<Result<void>>;
  getFulfillmentMode(): Promise<Result<FulfillmentMode | null>>;
}

interface CatalogRepository {
  listCategories(storeId: StoreId): Promise<Result<readonly Category[]>>;
  listProducts(storeId: StoreId, categoryId?: CategoryId): Promise<Result<readonly Product[]>>;
  searchProducts(storeId: StoreId, query: string): Promise<Result<readonly Product[]>>;
  getProduct(id: ProductId): Promise<Result<Product>>;
  getModifierGroups(ids: readonly ModifierGroupId[]): Promise<Result<readonly ModifierGroup[]>>;
  getModifierOptions(ids: readonly ModifierOptionId[]): Promise<Result<readonly ModifierOption[]>>;
}

interface CouponRepository {
  listAvailable(at: IsoDateTime): Promise<Result<readonly Coupon[]>>;
  findByCode(code: string): Promise<Result<Coupon>>;
  evaluate(coupon: Coupon, lines: readonly CartLine[], store: Store, at: IsoDateTime): Promise<CouponEvaluation>;
}

interface OrderRepository {
  create(input: {
    store: Store;
    mode: FulfillmentMode;
    deliveryAddress?: string;
    lines: readonly CartLine[];
    coupon?: Coupon;
    totals: CartTotals;
    createdAt: IsoDateTime;
    idempotencyKey: string;
  }): Promise<Result<Order>>;
  list(): Promise<Result<readonly Order[]>>;
  getById(id: OrderId): Promise<Result<Order>>;
  getStatus(order: Order, at: IsoDateTime): FulfillmentStatus;
}
```

The cart store is a local application service rather than a remote repository. It owns validation, line-key creation, quantity updates, persistence transactions, and observable UI state.

## Persistence boundary

- SQLite schema version starts at 1.
- Persist stores only selected store/mode, cart lines, order snapshots, and idempotency records.
- Catalog and coupon fixtures remain source-controlled TypeScript data, not copied database content.
- Reads validate decoded rows before returning domain entities.
- Corrupt rows are quarantined or removed in one transaction, with a recoverable error exposed to UI.
- Tests use an in-memory adapter implementing the same repository contracts.
