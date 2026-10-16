# BrewGo acceptance requirements

This is the implementation authority for BrewGo v0.1.0 together with `brand-scope.md`, `ux-spec.md`, and `domain-model.md`. Engineers must not consult raw target artifacts or decompiled output to make product decisions.

## Classification key

- **Observed**: supported by a successful sanitized evidence entry.
- **Derived**: bounded combination of observed facts.
- **Independent**: original BrewGo product or engineering decision.
- **Mock-only**: deterministic local substitute for a production service.

## Requirement matrix

| ID | Requirement | Classification | Evidence/spec basis |
| --- | --- | --- | --- |
| `BG-NAV-01` | Present Order, Cart, and Orders as the only bottom tabs. | Independent | UX specification |
| `BG-NAV-02` | Show current store and fulfillment mode in the shell header. | Derived | `E-010`–`E-015` |
| `BG-NAV-03` | Keep tab configuration local and deterministic. | Independent | Remote tab configuration is unknown |
| `BG-STORE-01` | List the three synthetic BrewGo stores and their supported modes. | Independent | Brand specification |
| `BG-STORE-02` | Support pickup and delivery contexts. | Derived/independent naming | `E-013`, `E-015` |
| `BG-STORE-03` | Represent open, unavailable, and delivery-unavailable states. | Observed capability | `E-013`, `E-016` |
| `BG-STORE-04` | Confirm before clearing incompatible cart lines on store change. | Independent | UX specification |
| `BG-CAT-01` | Browse hierarchical categories and product cards. | Observed capability | `E-017`–`E-020` |
| `BG-CAT-02` | Search products locally by original name and tags. | Independent | v0.1.0 scope |
| `BG-CAT-03` | Preserve unavailable products in the UI but prevent adding them. | Independent over observed availability | `E-018`, `E-022` |
| `BG-PROD-01` | Show original description, price, availability, and modifiers. | Independent presentation | Brand/domain specifications |
| `BG-PROD-02` | Enforce modifier group min/max and option availability. | Independent | `U-003` |
| `BG-PROD-03` | Enforce a positive configured product quantity maximum. | Independent over observed limit capability | `E-019`, `E-029` |
| `BG-CART-01` | Merge lines only when product and canonical modifier selections match. | Independent | `U-004`, domain specification |
| `BG-CART-02` | Edit quantity and remove a line atomically. | Observed capability/independent transaction | `E-022`, `E-023` |
| `BG-CART-03` | Calculate all prices in integer fen. | Independent | Domain specification |
| `BG-CART-04` | Show subtotal, discount, and total with CNY formatting. | Observed capability/independent arithmetic | `E-024`, `U-004` |
| `BG-COUPON-01` | Offer synthetic coupons with expiry and eligible products. | Observed capability/synthetic data | `E-026`–`E-028` |
| `BG-COUPON-02` | Apply at most one coupon and show deterministic rejection reason. | Mock-only | `U-004` |
| `BG-COUPON-03` | Clamp discount to eligible subtotal, configured cap, and total. | Independent | Domain specification |
| `BG-CHECK-01` | Review store, mode, address, lines, coupon, and totals. | Derived | `E-023`, `E-024`, `E-030` |
| `BG-CHECK-02` | Validate all local requirements before confirmation. | Independent | UX/domain specifications |
| `BG-CHECK-03` | Confirm idempotently without a real payment. | Mock-only | Project scope |
| `BG-ORDER-01` | Persist immutable local order snapshots and show newest first. | Independent | UX/domain specifications; `U-005` |
| `BG-ORDER-02` | Show order detail and support order-again with current rules. | Observed capability/independent rules | `E-032`–`E-035` |
| `BG-ORDER-03` | Derive fulfillment status deterministically from local time. | Mock-only | Target transitions unknown |
| `BG-DATA-01` | Restore selected store, mode, cart, and orders after restart. | Independent | v0.1.0 persistence scope |
| `BG-DATA-02` | Recover from corrupt local rows without crashing. | Independent | UX/domain specifications |
| `BG-STATE-01` | Provide loading, empty, error, unavailable, validation, and success states. | Independent over observed failure capability | UX specification |
| `BG-A11Y-01` | Meet documented labels, focus, announcements, scaling, contrast, and target sizes. | Independent | UX/brand specifications |
| `BG-SAFE-01` | Use no external API, target service, target asset, credential, or production endpoint. | Clean-room control | Analysis limitations |

## Locked scenarios

### Scenario A — Pickup happy path

1. Start from a fresh local database.
2. Select Harbor Point and Pickup.
3. Browse Espresso and open Velvet Oat Latte.
4. Select Regular, Warm, Balanced, and Oat milk.
5. Add quantity 2; verify one cart line and integer-fen total.
6. Add the same configuration once more; verify quantity becomes 3 without a second line.
7. Add a different milk selection; verify a second line is created.
8. Apply an eligible synthetic coupon and verify subtotal, discount, and total.
9. Review checkout and confirm once.
10. Verify the cart clears, one order is stored, and back navigation cannot resubmit.
11. Open order detail and advance the injected clock to verify `confirmed -> preparing -> ready -> completed`.

### Scenario B — Delivery validation and coupon rejection

1. Select Harbor Point and Delivery.
2. Add Citrus Cold Brew with valid modifiers.
3. Attempt checkout without an address; verify validation focuses the missing address.
4. Select the synthetic address and apply an expired coupon; verify the coupon remains visible with reason `expired` and discount zero.
5. Select a valid coupon, confirm, and verify `confirmed -> preparing -> dispatched -> completed` under the injected clock.

### Scenario C — Availability and store recovery

1. Add a product available at Harbor Point but unavailable at Orchard Gate.
2. Change store to Orchard Gate.
3. Verify confirmation is required before incompatible lines are cleared.
4. Cancel once and verify the original cart remains.
5. Confirm once and verify incompatible lines are removed atomically.
6. Force store-unavailable fixture mode; verify browse-only presentation, disabled add-to-cart, and change-store action.

### Scenario D — Persistence and corruption recovery

1. Build a cart and terminate/recreate the application state.
2. Verify store, mode, lines, quantities, modifier selections, coupon, and totals restore exactly.
3. Confirm an order and recreate state; verify order history and detail restore.
4. Inject malformed cart storage; verify it is quarantined/reset, the app remains usable, and a recoverable notice is shown.
5. Inject one malformed order among valid orders; verify valid orders remain accessible.

### Scenario E — Empty, error, and accessibility states

1. Inject loading, empty, error, and unavailable repository states and verify every documented action.
2. Navigate all primary flows using keyboard on web.
3. Verify modal focus containment/restoration and first-invalid-control focus.
4. Verify all actionable controls have accessible names and at least 44 × 44 px targets.
5. Verify cart additions, price changes, validation, and confirmation expose accessible announcements.

## Release-level acceptance

The demo is acceptable only when:

- all five locked scenarios pass on the web test target;
- Android-targeted Expo export and web export complete without external runtime APIs;
- unit tests cover money, modifiers, line identity, quantity, coupon rejection/caps, status progression, and persistence recovery;
- integration tests cover store-to-confirmation and order-history flows;
- the repository safety scan reports zero findings;
- a clean checkout can install, typecheck, lint, test, and export using documented commands.

## Change control

Changes to a locked requirement or scenario require a dedicated issue explaining whether the change is evidence-backed, independent, or mock-only. New target analysis cannot silently alter BrewGo product decisions or introduce proprietary content.
