# BrewGo clean-room reconstruction report

## Outcome

BrewGo v0.1.0 is an Android-first Expo/React Native ordering demonstration with a static web target. It implements the locked core flow from synthetic store selection through a locally tracked mock order. There is no authentication, production backend, payment processor, analytics SDK, loyalty system, or target-service integration.

## Provenance and separation

The project used an authorized local package only to establish high-level behavioral capabilities. Sanitized evidence is recorded in `docs/evidence-ledger.md`, with source identity reduced to hashes and bounded identifiers. Raw packages, extracted files, decompiled trees, and REA output stayed in the external work area and were never added to this repository or GitHub Actions.

Implementation decisions came from the committed clean-room specification:

- `docs/product/brand-scope.md` defines original BrewGo names, copy, colors, prices, products, and stores.
- `docs/product/ux-spec.md` defines routes, states, recovery, and accessibility requirements.
- `docs/product/domain-model.md` defines integer-fen commerce rules and repository boundaries.
- `docs/product/acceptance.md` classifies every requirement and locks the end-to-end scenarios.

No engineer needs decompiled code to maintain the demo. Observed capabilities, derived behavior, independent design, and mock-only substitutes remain explicitly distinguished.

## Delivered architecture

### Presentation

Expo Router supplies three tab roots—Order, Cart, and Orders—plus store, product, checkout, confirmation, and order-detail routes. Reusable components enforce original theme tokens, minimum control height, accessible names, live-region feedback, and explicit loading, empty, error, unavailable, validation, and success states.

### Domain

- Prices use branded integer fen values and format to CNY only at the UI boundary.
- Modifier validation enforces group membership, availability, uniqueness, and selection minimum/maximum.
- Cart identity hashes canonical JSON containing the product identifier and sorted unique option identifiers.
- Coupon evaluation is local and deterministic, with expiry, minimum, product eligibility, percentage/fixed discounts, and caps.
- Checkout validates store, nonempty cart, and synthetic delivery address without claiming payment.
- Pickup and delivery statuses progress deterministically from local timestamps.

### Data and persistence

Catalog, store, modifier, address, and coupon data are original TypeScript fixtures. `expo-sqlite` persists the selected context, cart snapshot, selected coupon, and immutable order JSON. Schema version 1 includes a quarantine table. Decoders validate persisted values before exposing them; malformed cart state resets safely, while malformed order rows are removed without hiding valid orders. Tests use an in-memory adapter with the same interface.

### Platform behavior

Metro treats SQLite's WASM file as an asset, allowing the same application to export for Android and static web. The application performs no runtime network request. The SQLite web worker remains an implementation detail of local persistence.

## Verification record

At documentation finalization:

- TypeScript strict checking passes.
- ESLint and Prettier checks pass.
- 31 Vitest unit and integration tests pass.
- Repository prohibited-content scan returns zero findings.
- Android-targeted Expo export passes.
- Static web Expo export passes, including SQLite WASM bundling.
- GitHub Actions run `39009542284` passed the complete clean-checkout workflow.

Coverage includes modifier constraints, customized-line identity, quantity caps and totals, coupon rejection and discount caps, catalog search, pickup/delivery checkout validation, persistence restoration, schema declaration, corrupt-payload rejection, order isolation, and deterministic status progression.

## Safety controls

- `.gitignore` excludes application packages, archives, bytecode, native libraries, keystores, analysis trees, logs, credentials, and local toolchains.
- `scripts/safety-check.mjs` scans staged or tracked content for prohibited file types, oversized files, credentials, target branding, endpoints, and raw-evidence markers.
- GitHub Actions receives source and sanitized reports only.
- Main-branch history is linear and uses Conventional Commit subjects linked to milestone issues.
- The project never executes the authorized input, contacts target services, extracts secrets, or bypasses security controls.

## Known limitations

- All availability, prices, coupons, addresses, and status timing are synthetic and deterministic.
- No production identity, inventory, payment, fulfillment, cancellation, refund, notification, or customer-support behavior is implemented.
- Store-change cart compatibility is represented by the clean-room contract but the current fixtures share one catalog, so no cross-store invalidation is required in the default demo.
- Order-again is specified but excluded from the v0.1.0 core confirmation path.
- Accessibility is implemented in source and covered by semantic review; formal assistive-technology certification and device-matrix testing are outside this release.
- A static export proves bundling, not store-distributed binary signing or production deployment readiness.

These limitations are intentional boundaries, not parity gaps. BrewGo is a standalone demonstration and makes no source-equivalence or backend-equivalence claim.
