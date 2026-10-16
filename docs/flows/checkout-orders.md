# Checkout and order tracking

This map records the narrow static evidence for checkout and post-order surfaces. It does not inspect or reproduce production payment behavior, credentials, requests, endpoints, transaction logic, or order data.

## Checkout boundary

Observed capabilities:

- Cart content carries totals, delivery description, promotions, availability messages, and selected lines (`E-023`, `E-024`).
- Product-preview models are packaged (`E-030`).
- Payment method/list models, a payment-selection surface, and a payment router are packaged (`E-031`).
- Shop and delivery-address state can propagate into checkout (`E-014`, `E-015`).

Derived flow, medium confidence:

```text
cart review
  -> product/order preview
  -> shop, fulfillment, address, availability, and coupon validation
  -> payment selection
  -> external or server-authoritative result
```

The static evidence does not establish validation order, retry policy, idempotency, payment-provider behavior, or confirmation sequencing. BrewGo will stop at simulated confirmation and will not implement real payments.

## Validation and confirmation states

BrewGo should validate its independent local model for:

- non-empty cart;
- selected and available synthetic store;
- fulfillment mode and delivery address when required;
- modifier completeness;
- item availability and quantity limits;
- deterministic mock-coupon eligibility;
- nonnegative integer-fen total.

These validation rules are independent design informed by the observed state capabilities. They are not claims about target validation order or backend policy. Confirmation will create a local mock order with a generated identifier and timestamp.

## Order history and details

- Standard and coupon-oriented order-detail activities are present and identified as React Native surfaces (`E-032`, `E-035`).
- A routed order-detail popup is present (`E-034`).
- A repeat-order router can build a product-preview model from routed input (`E-033`).
- A focused order-list class-name query found no target-owned match (`U-005`).

Therefore, detail presentation and repeat-order capability are observed, while history-list organization and navigation are unknown. BrewGo will provide an original local history list solely to make the demo flow complete.

## Fulfillment status

No bounded static evidence identified the target's status enum, transition graph, polling schedule, push behavior, or terminal-state rules. These remain unknown.

BrewGo will use a deterministic mock-only progression:

```text
confirmed -> preparing -> ready-or-dispatched -> completed
```

- Pickup orders use `ready`; delivery orders use `dispatched`.
- Progression is derived from local timestamps, never a remote service.
- Cancellation, refund, payment failure, and real-time courier tracking are outside the v0.1.0 demo.

## Failure and recovery

- Cart empty, shop unready, sold-out/menu-reload, address missing, and coupon rejection are carried from earlier evidence (`E-024`, `E-025`, `U-004`).
- Payment failure and pending-payment recovery are not implemented because the demo has no real payment integration.
- Local confirmation failure will preserve the cart and present an original retry message.
- Corrupt local order data will be handled by the persistence recovery design in Step 5.

## Acceptance trace

| BrewGo behavior | Basis | Classification |
| --- | --- | --- |
| Review checkout summary | `E-023`, `E-024`, `E-030` | Derived |
| Validate shop, fulfillment, address, items, and coupon | state capabilities plus `U-004` | Independent design |
| Simulated confirmation without payment | project scope | Mock-only behavior |
| Local order history | `U-005` | Independent demo-completion design |
| Order detail | `E-032`, `E-035` | Observed capability; original UI |
| Repeat-order entry point | `E-033` | Observed capability; independent rules |
| Deterministic fulfillment progression | no recovered transition evidence | Mock-only behavior |
