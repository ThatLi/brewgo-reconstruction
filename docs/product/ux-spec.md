# BrewGo navigation and screen states

This specification is an original BrewGo interaction model derived from the clean-room requirements. It does not reproduce target layouts, copy, artwork, tab order, or visual styling.

## Navigation map

```text
App start
└── Main tabs
    ├── Order
    │   ├── Store selector (modal)
    │   ├── Fulfillment selector (inline)
    │   ├── Catalog categories and search
    │   └── Product detail (modal)
    ├── Cart
    │   └── Checkout review (stack)
    │       └── Confirmation (replace)
    └── Orders
        └── Order detail (stack)
```

Routes:

| Route | Presentation | Purpose |
| --- | --- | --- |
| `/` | redirect | Restore state and open `/order` |
| `/order` | tab | Store context, categories, search, and products |
| `/cart` | tab | Customized lines, quantities, coupon, and totals |
| `/orders` | tab | Local mock-order history |
| `/stores` | modal | Select synthetic store and fulfillment mode |
| `/product/[id]` | modal | Configure one product before adding it |
| `/checkout` | stack | Validate and review the order |
| `/confirmation/[id]` | replace | Show successful local mock confirmation |
| `/orders/[id]` | stack | Show local order detail and status |

The bottom tab bar contains only Order, Cart, and Orders. Account, loyalty, campaigns, and messaging are outside scope.

## Global shell

- The header shows the BrewGo wordmark, current store, and fulfillment mode.
- Selecting the store control opens `/stores` from Order or Cart.
- The cart tab shows an accessible quantity badge when the count is greater than zero.
- Back behavior closes modals first, then stack screens; tab roots do not create nested back history.
- Web routes remain directly addressable, but missing IDs resolve to a not-found/recovery state rather than throwing.

## State-view contract

Every asynchronous or data-driven screen uses one of these explicit states:

| State | Required content | Primary action |
| --- | --- | --- |
| Loading | Short label and progress indicator or skeleton | None; never trap focus |
| Empty | Cause-specific title and short guidance | One next action where possible |
| Error | Plain-language failure, retained safe context, optional detail code | Retry or recover |
| Unavailable | What is unavailable and whether another choice can resolve it | Change store, mode, or item |
| Validation | Field/group-level explanation near the invalid control plus summary for checkout | Fix the first invalid input |
| Success | Clear outcome, identifier when relevant, and next destination | View order or continue ordering |

State copy must be original, concise, and actionable. Color is never the only signal.

## Screen specifications

### App start

- Loading: initialize local schema, restore cart/store preference, then redirect.
- Recovery: if local data is corrupt, quarantine/reset demo data, retain an error summary, and continue with empty state.
- Fatal initialization error: show retry and “Reset local demo data” actions.

### Order tab

- Loading: catalog skeleton while repository resolves synthetic fixtures.
- Empty store: prompt to choose a store before showing the catalog.
- Empty search: show the query and a clear-search action.
- Store unavailable: preserve browsing, disable add-to-cart, offer change-store.
- Product unavailable: keep the card visible with an unavailable label; product detail cannot add it.
- Success: adding an item announces the new cart quantity without navigating away.

### Store selector

- List each synthetic store with hours, supported modes, and availability.
- Selecting a store preserves the current cart only when every line is valid there; otherwise request confirmation before clearing incompatible lines.
- Delivery requires a synthetic address fixture; pickup does not.
- Empty/error states use local fixtures and are test-injectable despite no network dependency.

### Product detail

- Display product name, original description, base price, and modifier groups.
- Required groups are visibly marked.
- Attempting to add with invalid selections moves focus to the first invalid group and announces its rule.
- Quantity starts at one and respects the product’s configured maximum.
- Success closes the modal only after cart persistence succeeds.

### Cart tab

- Empty: “Your next favorite is waiting.” with “Browse drinks.”
- Unavailable line: retain it, exclude checkout, and offer remove or change-store.
- Quantity update: update totals synchronously and persist atomically.
- Coupon rejected: keep the entered/selected coupon visible with one deterministic reason.
- Checkout remains disabled until at least one valid line exists and all selected lines are valid.

### Checkout

- Review store, fulfillment, address when needed, lines, coupon, subtotal, discount, and total.
- Validation summary links/focuses the first actionable issue.
- Submission is locally idempotent per generated checkout attempt.
- Loading disables duplicate confirmation while preserving screen-reader status.
- Success replaces checkout with confirmation so back does not resubmit.
- Failure preserves cart and permits retry.

### Confirmation

- Show generated order identifier, store, fulfillment mode, total, and initial status.
- Primary action opens order detail; secondary action returns to Order.
- No payment-success claim is shown; wording states that this is a demo confirmation.

### Orders tab

- Empty: explain that locally confirmed demo orders appear here.
- List newest first with identifier, created time, total, mode, and current deterministic status.
- Missing/corrupt record opens a recoverable not-found state.

### Order detail

- Show status timeline, store, fulfillment, address when applicable, items, totals, and created time.
- “Order again” copies still-available lines into the cart using current synthetic prices and rules, then reports skipped items.
- Status progression is deterministic from local timestamps and does not imply live tracking.

## Accessibility contract

- Minimum 44 × 44 px touch targets.
- Logical focus order follows visual order.
- Buttons use action labels, not icon names.
- Price changes and cart additions use polite live-region announcements on web and accessibility announcements on native.
- Modal focus is trapped on web and restored to its trigger on close.
- Text scales without clipping through at least 200% where the platform supports it.
- Loading animation respects reduced-motion preferences.
- Error and validation messages are programmatically associated with the relevant control.

## Test-state injection

Repositories expose deterministic fixture modes for loading, empty, error, unavailable, and corrupt-local-data scenarios. Production demo UI does not expose a hidden debug menu; tests inject repository/state adapters directly.
