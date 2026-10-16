# Cart pricing and coupon behavior

This map separates observable cart/coupon data capability from unproven pricing policy. No campaign names, discount values, coupon copy, or production identifiers are retained.

## Cart-line identity

- Persisted cart entries have a database identity plus product and variant identifiers, quantity, fulfillment mode, enabled state, product type/group, and optional nested package products (`E-022`).
- Cart response lines repeat product/variant identifiers and add original/final prices, grouping, gift/add-on flags, and nested combo lines (`E-023`).
- A distinct variant identifier is therefore part of line identity. The evidence does not establish whether other selections, fulfillment mode, benefit identifiers, or package children participate in merging (`U-004`).

BrewGo will independently define a stable line key from product ID plus canonicalized modifier selections. That key is a clean-room design choice, not a recovered target algorithm.

## Quantity and limits

- Quantity is present on persisted and response cart lines (`E-022`, `E-023`).
- Global and fulfillment-specific cart-count limits are represented separately (`E-029`).
- Product models also expose a maximum-amount field (`E-019`).
- The relationship among product maximum, cart maximum, in-progress orders, and outstanding orders is unknown.

## Pricing

- Lines expose original and final prices (`E-023`).
- Cart content exposes initial and discounted totals plus currency (`E-024`).
- Product content exposes original and discounted prices (`E-019`).
- Static model inventories do not establish whether totals are calculated locally, supplied by a service, or reconciled by both (`U-004`).

BrewGo will calculate deterministic local totals in integer fen:

```text
line total = (base price + selected option deltas) × quantity
subtotal   = sum(line totals)
discount   = independently defined mock coupon result
total      = max(0, subtotal - discount)
```

This formula is an independent implementation rule and will not be presented as target parity.

## Coupon visibility and eligibility

- Coupon presentation includes display and discount labels plus an expiry timestamp/label (`E-026`).
- A coupon can carry an associated product list and currency (`E-027`).
- Expiring-coupon state supports countdown and use-now visibility flags (`E-028`).
- These fields support client display and preliminary checks for time, currency, and product association.
- Stacking, thresholds, exclusions, caps, final eligibility, and redemption authority are unknown (`U-004`).

BrewGo will use synthetic coupons with deterministic local rules and explicit rejection reasons. It will not contact, emulate, or infer a production promotion service.

## Recovery and failure states

- Cart reset reasons include empty cart and shop not ready (`E-025`).
- Cart content includes sold-out and delivery descriptions plus a menu-reload flag (`E-024`).
- BrewGo should therefore represent empty, shop-unavailable, sold-out/reload-required, and delivery-context-changed states using original copy.
- Exact trigger priority, partial-line invalidation, and cross-shop migration remain unknown.

## Acceptance trace

| BrewGo behavior | Basis | Classification |
| --- | --- | --- |
| Quantity edits and nested package lines | `E-022`, `E-023` | Observed capability |
| Stable customized-line identity | `U-004` | Independent design |
| Integer-fen subtotal and total formula | `U-004` | Independent design |
| Original/final price and savings display | `E-023`, `E-024` | Observed capability; synthetic values |
| Coupon list with expiry and product association | `E-026`–`E-028` | Observed capability |
| Deterministic eligibility and rejection reasons | `U-004` | Mock-only independent behavior |
| Empty, unavailable, and sold-out recovery | `E-024`, `E-025` | Derived |
